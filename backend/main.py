import sys
import os
from pathlib import Path

# ── Force venv libraries — prevents system Python conflicts ──
_venv_root = Path(__file__).parent.parent / "venv"
_site_packages = (
    _venv_root / "Lib" / "site-packages"
)

if _site_packages.exists():
    # Insert venv site-packages at front so it wins over system Python
    venv_path = str(_site_packages)
    if venv_path not in sys.path:
        sys.path.insert(0, venv_path)
    # Remove ONLY the system Python site-packages (keep stdlib paths like Lib, DLLs)
    sys.path = [
        p for p in sys.path
        if not (
            "AppData\\Local\\Programs\\Python" in p
            and "site-packages" in p
        )
        or "Trace\\venv" in p
    ]

# Set environment variable so child processes also use venv
os.environ["PYTHONPATH"] = str(_site_packages)

# Disable speechbrain lazy loading — prevents k2_fsa import crash
os.environ["SB_ENABLE_LAZY_LOAD"] = "0"

sys.path.append(str(Path(__file__).parent.parent))

import json
import uuid
import hashlib
import shutil
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from backend.ingestion.audio_processor import AudioProcessor
from backend.ingestion.transcriber import Transcriber
from backend.extraction.extractor import MeetingExtractor
from backend.storage.vector_store import VectorStore
from backend.query.rag import MeetingQueryEngine
from backend.config import config

# ── App setup ────────────────────────────────────────────
app = FastAPI(
    title="Meeting Intelligence API",
    description="Convert meetings into queryable organizational memory",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Singletons — load once, reuse across requests ────────
print("[API] Loading models...")
audio_processor = AudioProcessor()
transcriber     = Transcriber()
extractor       = MeetingExtractor()
vector_store    = VectorStore()
query_engine    = MeetingQueryEngine(vector_store=vector_store)
print("[API] All models ready [ok]")

# ── In-memory job tracker ────────────────────────────────
# In production this would be Redis — fine for demo
jobs: dict = {}

# ── Audio hash registry — prevents duplicate uploads ─────
_HASH_REGISTRY_PATH = Path("data/audio_hashes.json")

def _load_hash_registry() -> dict:
    """Load hash→meeting_id mapping from disk."""
    if _HASH_REGISTRY_PATH.exists():
        with open(_HASH_REGISTRY_PATH, "r") as f:
            return json.load(f)
    return {}

def _save_hash_registry(registry: dict):
    """Persist hash→meeting_id mapping to disk."""
    _HASH_REGISTRY_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(_HASH_REGISTRY_PATH, "w") as f:
        json.dump(registry, f, indent=2)

def _hash_file(file_path: str) -> str:
    """Compute SHA-256 hash of a file."""
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)
    return sha256.hexdigest()

# ── Pydantic models ──────────────────────────────────────
class QueryRequest(BaseModel):
    question: str
    filter_type: Optional[str] = None   # "action_item"|"decision"|"blocker"|None

class QueryResponse(BaseModel):
    question:   str
    answer:     str
    confidence: str
    sources:    list

# ────────────────────────────────────────────────────────
# ROUTES
# ────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "name":    "Meeting Intelligence API",
        "version": "1.0.0",
        "status":  "running",
        "endpoints": [
            "POST   /meetings/upload",
            "GET    /meetings",
            "GET    /meetings/{meeting_id}",
            "GET    /meetings/{meeting_id}/transcript",
            "GET    /meetings/{meeting_id}/extraction",
            "DELETE /meetings/{meeting_id}",
            "POST   /query",
            "GET    /jobs/{job_id}",
        ]
    }

@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}


# ── Upload + process meeting ─────────────────────────────

@app.post("/meetings/upload")
async def upload_meeting(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """
    Upload an audio/video file.
    Triggers background processing pipeline:
      audio → transcript → extraction → vector index

    Returns a job_id to poll for status.
    If the same audio was already uploaded, returns the existing meeting.
    """
    # Validate file type
    allowed = {".mp3", ".mp4", ".wav", ".m4a", ".ogg", ".webm", ".flac"}
    suffix  = Path(file.filename).suffix.lower()
    if suffix not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {suffix}. "
                   f"Allowed: {', '.join(allowed)}"
        )

    # Save uploaded file to a temp path first
    meeting_id  = f"meeting_{uuid.uuid4().hex[:8]}"
    upload_path = Path(config.AUDIO_DIR) / f"{meeting_id}{suffix}"
    upload_path.parent.mkdir(parents=True, exist_ok=True)

    with open(upload_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # ── Dedup check: hash file content, reject if already processed ──
    file_hash = _hash_file(str(upload_path))
    registry  = _load_hash_registry()

    if file_hash in registry:
        # Same audio already processed — clean up and return existing
        existing_id = registry[file_hash]
        upload_path.unlink(missing_ok=True)
        print(f"[Upload] Duplicate detected: {file.filename} "
              f"matches existing {existing_id}")
        return {
            "meeting_id": existing_id,
            "status":     "duplicate",
            "message":    f"This audio was already processed as {existing_id}. "
                          f"No duplicate created."
        }

    # Register this hash → meeting_id
    registry[file_hash] = meeting_id
    _save_hash_registry(registry)

    # Create job
    job_id        = f"job_{uuid.uuid4().hex[:8]}"
    jobs[job_id]  = {
        "job_id":     job_id,
        "meeting_id": meeting_id,
        "filename":   file.filename,
        "status":     "queued",
        "progress":   0,
        "created_at": datetime.now().isoformat(),
        "error":      None
    }

    # Run pipeline in background
    background_tasks.add_task(
        _run_pipeline,
        job_id, meeting_id, str(upload_path)
    )

    return {
        "job_id":     job_id,
        "meeting_id": meeting_id,
        "status":     "queued",
        "message":    "Processing started. Poll /jobs/{job_id} for status."
    }


async def _run_pipeline(job_id: str, meeting_id: str, audio_path: str):
    """Full processing pipeline as background task."""

    # Re-inject venv path inside background thread
    venv_site = str(
        Path(__file__).parent.parent / "venv" / "Lib" / "site-packages"
    )
    if venv_site not in sys.path:
        sys.path.insert(0, venv_site)
    def update_job(status: str, progress: int, error: str = None):
        jobs[job_id].update({
            "status":   status,
            "progress": progress,
            "error":    error
        })

    try:
        # Step 1: Convert audio
        update_job("converting", 10)
        print(f"[Pipeline] {job_id} — converting audio: {audio_path}")
        wav_path = audio_processor.convert_to_wav(audio_path)
        print(f"[Pipeline] {job_id} — converted to: {wav_path}")

        # Step 2: Transcribe + diarize
        update_job("transcribing", 25)
        print(f"[Pipeline] {job_id} — transcribing...")
        transcript = transcriber.transcribe(wav_path, meeting_id=meeting_id)

        # Save transcript
        transcript_path = Path(config.TRANSCRIPT_DIR) / f"{meeting_id}.json"
        transcript_path.parent.mkdir(parents=True, exist_ok=True)
        with open(transcript_path, "w", encoding="utf-8") as f:
            json.dump(transcript, f, indent=2)
        print(f"[Pipeline] {job_id} — transcript saved")

        # Step 3: Extract structured data
        update_job("extracting", 60)
        print(f"[Pipeline] {job_id} — extracting...")
        extraction = extractor.extract(transcript)
        extractor.save(extraction)
        print(f"[Pipeline] {job_id} — extraction saved")

        # Step 4: Index in vector DB
        update_job("indexing", 85)
        print(f"[Pipeline] {job_id} — indexing...")
        vector_store.index_transcript(transcript)
        vector_store.index_extraction(extraction)
        print(f"[Pipeline] {job_id} — indexed")

        # Done
        update_job("completed", 100)
        jobs[job_id]["completed_at"] = datetime.now().isoformat()
        print(f"[Pipeline] {job_id} — COMPLETE")

    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"[Pipeline] {job_id} — FAILED:\n{error_detail}")
        update_job("failed", 0, error=f"{type(e).__name__}: {str(e)}")


# ── Job status ───────────────────────────────────────────

@app.get("/jobs/{job_id}")
def get_job_status(job_id: str):
    """Poll this endpoint to track processing progress."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]


# ── Meeting data endpoints ───────────────────────────────

@app.get("/meetings")
def list_meetings():
    """List all processed meetings."""
    extraction_dir = Path("data/extractions")
    meetings       = []

    if not extraction_dir.exists():
        return {"meetings": [], "count": 0}

    for path in sorted(extraction_dir.glob("*.json"), reverse=True):
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            meetings.append({
                "meeting_id":   data.get("meeting_id"),
                "title":        data.get("title", "Untitled"),
                "meeting_type": data.get("meeting_type", "unknown"),
                "created_at":   data.get("created_at"),
                "duration_sec": data.get("duration_sec", 0),
                "speakers":     data.get("speakers", []),
                "action_items": len(data.get("action_items", [])),
                "decisions":    len(data.get("decisions", [])),
                "blockers":     len(data.get("blockers", [])),
            })
        except Exception:
            continue

    return {"meetings": meetings, "count": len(meetings)}


@app.get("/meetings/{meeting_id}")
def get_meeting(meeting_id: str):
    """Get full extraction data for a meeting."""
    path = Path(f"data/extractions/{meeting_id}.json")
    if not path.exists():
        raise HTTPException(status_code=404, detail="Meeting not found")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


@app.get("/meetings/{meeting_id}/transcript")
def get_transcript(meeting_id: str):
    """Get full transcript for a meeting."""
    path = Path(f"data/transcripts/{meeting_id}.json")
    if not path.exists():
        raise HTTPException(status_code=404, detail="Transcript not found")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


@app.get("/meetings/{meeting_id}/extraction")
def get_extraction(meeting_id: str):
    """Get structured extraction for a meeting."""
    return get_meeting(meeting_id)


# ── Query endpoints ──────────────────────────────────────

@app.post("/query")
def query_meetings(request: QueryRequest):
    """
    Ask a natural language question across all meetings.

    Examples:
      {"question": "What does Ken need to do?"}
      {"question": "All blockers", "filter_type": "blocker"}
    """
    if not request.question.strip():
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty"
        )

    if request.filter_type:
        # Structured filtered query
        result = query_engine.ask_structured(
            request.question,
            filter_type=request.filter_type
        )
        return {
            "question":    request.question,
            "filter_type": request.filter_type,
            "results":     result["results"],
            "count":       result["count"]
        }
    else:
        # Natural language RAG query
        result = query_engine.ask(request.question)
        return QueryResponse(
            question   = result["question"],
            answer     = result["answer"],
            confidence = result["confidence"],
            sources    = result["sources"]
        )


@app.get("/meetings/{meeting_id}/action-items")
def get_action_items(meeting_id: str):
    """Get all action items for a specific meeting."""
    meeting = get_meeting(meeting_id)
    return {
        "meeting_id":   meeting_id,
        "action_items": meeting.get("action_items", []),
        "count":        len(meeting.get("action_items", []))
    }


@app.get("/meetings/{meeting_id}/decisions")
def get_decisions(meeting_id: str):
    """Get all decisions for a specific meeting."""
    meeting = get_meeting(meeting_id)
    return {
        "meeting_id": meeting_id,
        "decisions":  meeting.get("decisions", []),
        "count":      len(meeting.get("decisions", []))
    }


# ── Delete meeting ───────────────────────────────────────

@app.delete("/meetings/{meeting_id}")
def delete_meeting(meeting_id: str):
    """Delete a meeting and all its data."""
    deleted = []
    errors  = []

    # Remove extraction
    ext_path = Path(f"data/extractions/{meeting_id}.json")
    if ext_path.exists():
        ext_path.unlink()
        deleted.append("extraction")

    # Remove transcript
    tr_path = Path(f"data/transcripts/{meeting_id}.json")
    if tr_path.exists():
        tr_path.unlink()
        deleted.append("transcript")

    # Remove from vector DB
    try:
        existing = vector_store.extractions.get(
            where={"meeting_id": meeting_id}
        )
        if existing["ids"]:
            vector_store.extractions.delete(ids=existing["ids"])
            deleted.append("vector_extractions")

        existing = vector_store.transcripts.get(
            where={"meeting_id": meeting_id}
        )
        if existing["ids"]:
            vector_store.transcripts.delete(ids=existing["ids"])
            deleted.append("vector_transcripts")
    except Exception as e:
        errors.append(str(e))

    # Remove from hash registry so re-upload is allowed
    try:
        registry = _load_hash_registry()
        hashes_to_remove = [
            h for h, mid in registry.items() if mid == meeting_id
        ]
        for h in hashes_to_remove:
            del registry[h]
        if hashes_to_remove:
            _save_hash_registry(registry)
            deleted.append("hash_registry")
    except Exception as e:
        errors.append(str(e))

    # Remove audio files
    audio_dir = Path(config.AUDIO_DIR)
    for f in audio_dir.glob(f"*{meeting_id}*"):
        f.unlink(missing_ok=True)
        deleted.append(f"audio:{f.name}")

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail=f"Meeting {meeting_id} not found"
        )

    return {
        "meeting_id": meeting_id,
        "deleted":    deleted,
        "errors":     errors,
        "message":    f"Meeting {meeting_id} removed successfully"
    }