import chromadb
import json
from pathlib import Path
from sentence_transformers import SentenceTransformer
from chromadb.config import Settings
import sys
sys.path.append(str(Path(__file__).parent.parent.parent))
from backend.core.config import config


class VectorStore:
    """
    Stores meeting data as embeddings in ChromaDB.
    Enables semantic search across all meetings.

    Two collections:
      - transcripts : full dialogue chunks for RAG context
      - extractions : structured facts (decisions, tasks, blockers)
    """

    def __init__(self):
        self.client = chromadb.PersistentClient(
            path=config.CHROMA_PATH,
            settings=Settings(
                anonymized_telemetry=False,
                chroma_product_telemetry_impl=(
                    "backend.db.chroma_noop_telemetry.NoOpProductTelemetry"
                ),
                chroma_telemetry_impl=(
                    "backend.db.chroma_noop_telemetry.NoOpProductTelemetry"
                )
            )
        )
        self.embed_model = SentenceTransformer(
            "all-MiniLM-L6-v2"   # fast + accurate, 384-dim embeddings
        )

        # Two separate collections
        self.transcripts = self.client.get_or_create_collection(
            name="transcripts",
            metadata={"hnsw:space": "cosine"}
        )
        self.extractions = self.client.get_or_create_collection(
            name="extractions",
            metadata={"hnsw:space": "cosine"}
        )
        print(f"[VectorStore] Ready. "
              f"Transcripts: {self.transcripts.count()} docs | "
              f"Extractions: {self.extractions.count()} docs")

    def _embed(self, texts: list[str]) -> list[list[float]]:
        """Convert text list → embedding vectors."""
        return self.embed_model.encode(
            texts,
            convert_to_numpy=True,
            show_progress_bar=False
        ).tolist()

    # ──────────────────────────────────────────────────────
    # INDEXING
    # ──────────────────────────────────────────────────────

    def index_transcript(self, transcript: dict, chunk_size: int = 5):
        """
        Store transcript as overlapping dialogue chunks.
        Each chunk = 5 speaker turns with metadata.

        This is what gets retrieved during RAG —
        the actual words spoken around a topic.
        """
        meeting_id = transcript["meeting_id"]
        segments   = transcript["segments"]

        # Delete existing entries for this meeting (re-index safe)
        existing = self.transcripts.get(
            where={"meeting_id": meeting_id}
        )
        if existing["ids"]:
            self.transcripts.delete(ids=existing["ids"])

        documents = []
        metadatas = []
        ids       = []

        for i in range(0, len(segments), chunk_size):
            chunk_segs = segments[i: i + chunk_size + 2]  # slight overlap

            # Format chunk as readable dialogue
            chunk_text = "\n".join(
                f"[{s['speaker']}] {s['text']}"
                for s in chunk_segs
            )

            # Rich metadata for filtering
            speakers_in_chunk = list(set(
                s["speaker"] for s in chunk_segs
            ))

            chunk_id = f"{meeting_id}_transcript_chunk_{i}"
            documents.append(chunk_text)
            metadatas.append({
                "meeting_id":  meeting_id,
                "created_at":  transcript["created_at"],
                "chunk_index": i,
                "start_time":  chunk_segs[0]["start"],
                "end_time":    chunk_segs[-1]["end"],
                "speakers":    json.dumps(speakers_in_chunk),
                "type":        "transcript_chunk"
            })
            ids.append(chunk_id)

        # Batch embed + store
        embeddings = self._embed(documents)
        self.transcripts.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )
        print(f"[VectorStore] Indexed {len(documents)} transcript "
              f"chunks for: {meeting_id}")

    def index_extraction(self, extraction: dict):
        """
        Store each extracted fact as a separate searchable document.

        Each action item, decision, blocker, and the summary
        become individual vector entries — so semantic search
        finds the exact fact, not just the meeting.
        """
        meeting_id = extraction["meeting_id"]

        # Delete existing entries for this meeting
        existing = self.extractions.get(
            where={"meeting_id": meeting_id}
        )
        if existing["ids"]:
            self.extractions.delete(ids=existing["ids"])

        documents = []
        metadatas = []
        ids       = []

        base_meta = {
            "meeting_id":   meeting_id,
            "meeting_title": extraction.get("title", ""),
            "created_at":   extraction.get("created_at", ""),
            "meeting_type": extraction.get("meeting_type", ""),
        }

        # ── Index action items ────────────────────────────
        for i, item in enumerate(extraction.get("action_items", [])):
            text = (
                f"Action item: {item['task']}. "
                f"Owner: {item.get('owner', 'Unassigned')}. "
                f"Deadline: {item.get('deadline', 'none')}."
            )
            documents.append(text)
            metadatas.append({
                **base_meta,
                "type":     "action_item",
                "owner":    item.get("owner", "Unassigned"),
                "deadline": item.get("deadline") or "none",
                "raw":      json.dumps(item)
            })
            ids.append(f"{meeting_id}_action_{i}")

        # ── Index decisions ───────────────────────────────
        for i, dec in enumerate(extraction.get("decisions", [])):
            text = (
                f"Decision: {dec['decision']}. "
                f"Made by: {dec.get('made_by', 'Unknown')}."
            )
            documents.append(text)
            metadatas.append({
                **base_meta,
                "type":    "decision",
                "made_by": dec.get("made_by", "Unknown"),
                "raw":     json.dumps(dec)
            })
            ids.append(f"{meeting_id}_decision_{i}")

        # ── Index blockers ────────────────────────────────
        for i, blk in enumerate(extraction.get("blockers", [])):
            text = (
                f"Blocker: {blk['blocker']}. "
                f"Affects: {blk.get('affects', 'Unknown')}."
            )
            documents.append(text)
            metadatas.append({
                **base_meta,
                "type":    "blocker",
                "affects": blk.get("affects", "Unknown"),
                "raw":     json.dumps(blk)
            })
            ids.append(f"{meeting_id}_blocker_{i}")

        # ── Index summary ─────────────────────────────────
        if extraction.get("summary"):
            documents.append(extraction["summary"])
            metadatas.append({
                **base_meta,
                "type": "summary",
                "raw":  extraction["summary"]
            })
            ids.append(f"{meeting_id}_summary")

        # ── Index key topics ──────────────────────────────
        if extraction.get("key_topics"):
            topics_text = "Topics discussed: " + \
                          ", ".join(extraction["key_topics"])
            documents.append(topics_text)
            metadatas.append({
                **base_meta,
                "type": "topics",
                "raw":  json.dumps(extraction["key_topics"])
            })
            ids.append(f"{meeting_id}_topics")

        # Batch embed + store
        if documents:
            embeddings = self._embed(documents)
            self.extractions.add(
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids
            )

        print(f"[VectorStore] Indexed {len(documents)} extraction "
              f"facts for: {meeting_id}")

    # ──────────────────────────────────────────────────────
    # SEARCHING
    # ──────────────────────────────────────────────────────

    def _expand_query(self, query: str) -> str:
        """
        Expand query with synonyms to improve semantic matching.
        Short queries often miss short facts due to embedding mismatch.
        """
        expansions = {
            "what does": "tasks responsibilities duties",
            "need to do": "action item task assigned responsibility",
            "blocking": "blocker problem issue preventing",
            "decisions": "decided agreed resolved concluded",
            "how long": "duration timeline period weeks days",
            "training": "onboarding learning training period weeks",
            "who is assigned": "owner responsible assigned person",
            "deadline": "due date when timeline",
        }

        expanded = query
        for phrase, addition in expansions.items():
            if phrase.lower() in query.lower():
                expanded = f"{query} {addition}"
                break

        return expanded

    def search_extractions(
        self,
        query: str,
        n_results: int = 8,
        filter_type: str = None
    ) -> list[dict]:
        """
        Semantic search over extracted facts.
        Returns ranked results with metadata.

        filter_type: "action_item" | "decision" | "blocker" | None
        """
        # Query expansion improves match quality for short intents.
        expanded_query = self._expand_query(query)
        query_embedding = self._embed([expanded_query])[0]

        total_docs = self.extractions.count()
        if total_docs == 0:
            return []

        where = {"type": filter_type} if filter_type else None

        results = self.extractions.query(
            query_embeddings=[query_embedding],
            n_results=min(n_results, total_docs),
            where=where,
            include=["documents", "metadatas", "distances"]
        )

        hits = []
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0]
        ):
            hits.append({
                "text":       doc,
                "metadata":   meta,
                "score":      round(1 - dist, 3),  # cosine similarity
                "meeting_id": meta.get("meeting_id"),
                "type":       meta.get("type"),
                "raw":        json.loads(meta.get("raw", "{}"))
                              if meta.get("raw", "").startswith("{")
                              or meta.get("raw", "").startswith("[")
                              else meta.get("raw")
            })

        return hits

    def search_transcripts(
        self,
        query: str,
        n_results: int = 3
    ) -> list[dict]:
        """
        Semantic search over raw transcript chunks.
        Used to retrieve context for RAG answers.
        """
        expanded = self._expand_query(query)
        query_embedding = self._embed([expanded])[0]

        total_docs = self.transcripts.count()
        if total_docs == 0:
            return []

        results = self.transcripts.query(
            query_embeddings=[query_embedding],
            n_results=min(n_results, total_docs),
            include=["documents", "metadatas", "distances"]
        )

        hits = []
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0]
        ):
            hits.append({
                "text":       doc,
                "metadata":   meta,
                "score":      round(1 - dist, 3),
                "meeting_id": meta.get("meeting_id"),
                "start_time": meta.get("start_time"),
                "end_time":   meta.get("end_time")
            })

        return hits