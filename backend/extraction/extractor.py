import json
import re
import time
from typing import Optional
import ollama
from pathlib import Path
import sys
sys.path.append(str(Path(__file__).parent.parent.parent))
from backend.config import config
from backend.extraction.prompts import (
    EXTRACTION_SYSTEM_PROMPT,
    CHUNK_EXTRACTION_PROMPT,
    AGGREGATION_PROMPT,
    MEETING_TITLE_PROMPT
)


class MeetingExtractor:
    """
    Extracts structured data from meeting transcripts using Llama 3.1.

    Pipeline:
      1. Split transcript into overlapping chunks
      2. Extract candidates from each chunk in parallel
      3. Aggregate + deduplicate across all chunks
      4. Generate meeting title + type
      5. Return clean structured JSON
    """

    def __init__(self):
        self.model   = config.OLLAMA_MODEL
        self.client  = ollama.Client(host=config.OLLAMA_BASE_URL)
        self._verify_ollama()

    def _verify_ollama(self):
        """Make sure Ollama is running and model is available."""
        try:
            models = self.client.list()
            available = [m.model for m in models.models]
            # Check if our model is available (flexible match)
            match = any(
                self.model.split(":")[0] in m for m in available
            )
            if not match:
                raise RuntimeError(
                    f"Model '{self.model}' not found in Ollama.\n"
                    f"Available: {available}\n"
                    f"Run: ollama pull {self.model}"
                )
            print(f"[Extractor] Ollama ready. Model: {self.model} ✓")
        except Exception as e:
            if "Connection" in str(e) or "refused" in str(e).lower():
                raise RuntimeError(
                    "Ollama is not running!\n"
                    "Start it with: ollama serve"
                ) from e
            raise

    # ──────────────────────────────────────────────────────
    # CHUNKING
    # ──────────────────────────────────────────────────────

    def _chunk_transcript(
        self,
        transcript: dict,
        chunk_size: int = 20,
        overlap: int = 3
    ) -> list[str]:
        """
        Split transcript segments into overlapping chunks.

        chunk_size: number of segments per chunk
        overlap:    segments shared between adjacent chunks
                    (catches action items that span chunk boundaries)

        Returns list of formatted transcript strings.
        """
        segments = transcript["segments"]
        chunks   = []
        i        = 0

        while i < len(segments):
            chunk_segs = segments[i: i + chunk_size]

            # Format as readable dialogue
            chunk_text = "\n".join(
                f"[{s['speaker']}] ({s['start']}s): {s['text']}"
                for s in chunk_segs
            )
            chunks.append(chunk_text)

            # Advance with overlap
            i += chunk_size - overlap

        print(f"[Extractor] Split into {len(chunks)} chunks "
              f"({len(segments)} segments, "
              f"chunk_size={chunk_size}, overlap={overlap})")
        return chunks

    # ──────────────────────────────────────────────────────
    # LLM CALLS
    # ──────────────────────────────────────────────────────

    def _call_llm(self, prompt: str, expect_json: bool = True) -> str:
        """
        Call Llama 3.1 via Ollama with retry logic.
        Returns raw response text.
        """
        max_retries = 3

        for attempt in range(max_retries):
            try:
                response = self.client.chat(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": EXTRACTION_SYSTEM_PROMPT
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    options={
                        "temperature": 0.0,   # deterministic — no creativity
                        "num_predict": 1024,
                    }
                )
                return response.message.content

            except Exception as e:
                if attempt < max_retries - 1:
                    print(f"[Extractor] LLM call failed (attempt {attempt+1}), retrying...")
                    time.sleep(2)
                else:
                    raise RuntimeError(f"LLM call failed after {max_retries} attempts: {e}")

    def _parse_json_response(self, raw: str, context: str = "") -> Optional[dict]:
        """
        Robustly parse JSON from LLM response.
        Handles common LLM formatting issues:
          - JSON wrapped in markdown code blocks
          - Extra text before/after JSON
          - Trailing commas
        """
        if not raw or not raw.strip():
            return None

        # Strip markdown code blocks if present
        raw = re.sub(r"```json\s*", "", raw)
        raw = re.sub(r"```\s*", "", raw)
        raw = raw.strip()

        # Try direct parse first
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            pass

        # Extract JSON object from response
        match = re.search(r'\{[\s\S]*\}', raw)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass

        # Fix trailing commas (common LLM mistake)
        cleaned = re.sub(r',\s*([}\]])', r'\1', raw)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            pass

        print(f"[Extractor] WARNING: Could not parse JSON "
              f"({context}). Raw:\n{raw[:200]}")
        return None

    # ──────────────────────────────────────────────────────
    # EXTRACTION PIPELINE
    # ──────────────────────────────────────────────────────

    def _extract_from_chunk(self, chunk_text: str, idx: int) -> Optional[dict]:
        """Extract structured data from a single transcript chunk."""
        print(f"[Extractor] Processing chunk {idx + 1}...")

        prompt = CHUNK_EXTRACTION_PROMPT.format(transcript=chunk_text)
        raw    = self._call_llm(prompt)
        result = self._parse_json_response(raw, context=f"chunk_{idx}")

        if result:
            # Normalise — ensure all keys exist
            result.setdefault("action_items", [])
            result.setdefault("decisions",    [])
            result.setdefault("blockers",     [])
            result.setdefault("key_topics",   [])

        return result

    def _aggregate_chunks(self, chunk_results: list[dict]) -> dict:
        """
        Send all chunk results to LLM for final aggregation.
        Deduplicates and merges across chunks.
        """
        print("[Extractor] Aggregating chunks...")

        # Filter out None results
        valid = [r for r in chunk_results if r is not None]

        if not valid:
            return self._empty_result()

        # If only one chunk, skip aggregation LLM call
        if len(valid) == 1:
            result = valid[0]
            result["summary"] = ""
            return result

        chunks_json = json.dumps(valid, indent=2)
        prompt      = AGGREGATION_PROMPT.format(chunks_json=chunks_json)
        raw         = self._call_llm(prompt)
        result      = self._parse_json_response(raw, context="aggregation")

        return result if result else self._merge_chunks_simple(valid)

    def _merge_chunks_simple(self, chunks: list[dict]) -> dict:
        """
        Fallback merge without LLM — simple deduplication.
        Used if aggregation LLM call fails.
        """
        merged = self._empty_result()

        seen_tasks     = set()
        seen_decisions = set()
        seen_blockers  = set()

        for chunk in chunks:
            for item in chunk.get("action_items", []):
                key = item.get("task", "").lower()[:50]
                if key not in seen_tasks:
                    merged["action_items"].append(item)
                    seen_tasks.add(key)

            for item in chunk.get("decisions", []):
                key = item.get("decision", "").lower()[:50]
                if key not in seen_decisions:
                    merged["decisions"].append(item)
                    seen_decisions.add(key)

            for item in chunk.get("blockers", []):
                key = item.get("blocker", "").lower()[:50]
                if key not in seen_blockers:
                    merged["blockers"].append(item)
                    seen_blockers.add(key)

            for topic in chunk.get("key_topics", []):
                if topic not in merged["key_topics"]:
                    merged["key_topics"].append(topic)

        merged["summary"] = ""
        return merged

    def _generate_title(self, summary: str, topics: list) -> dict:
        """Generate meeting title and type from summary."""
        print("[Extractor] Generating meeting title...")
        prompt = MEETING_TITLE_PROMPT.format(
            summary=summary,
            topics=", ".join(topics[:5])
        )
        raw    = self._call_llm(prompt)
        result = self._parse_json_response(raw, context="title")
        return result or {"title": "Team Meeting", "meeting_type": "discussion"}

    def _empty_result(self) -> dict:
        return {
            "action_items": [],
            "decisions":    [],
            "blockers":     [],
            "key_topics":   [],
            "summary":      ""
        }

    # ──────────────────────────────────────────────────────
    # PUBLIC API
    # ──────────────────────────────────────────────────────

    def extract(self, transcript: dict) -> dict:
        """
        Main entry point. Run full extraction pipeline.

        Input:  transcript dict from Transcriber
        Output: structured extraction dict with:
                  - action_items
                  - decisions
                  - blockers
                  - key_topics
                  - summary
                  - title
                  - meeting_type
                  - metadata
        """
        print(f"\n[Extractor] Starting extraction for: "
              f"{transcript['meeting_id']}")
        start_time = time.time()

        # Step 1: Chunk
        chunks = self._chunk_transcript(transcript)

        # Step 2: Extract from each chunk
        chunk_results = []
        for i, chunk in enumerate(chunks):
            result = self._extract_from_chunk(chunk, i)
            chunk_results.append(result)

        # Step 3: Aggregate
        final = self._aggregate_chunks(chunk_results)

        # Step 4: Generate title
        title_data = self._generate_title(
            final.get("summary", ""),
            final.get("key_topics", [])
        )

        # Step 5: Build final output
        elapsed = round(time.time() - start_time, 1)
        output  = {
            "meeting_id":   transcript["meeting_id"],
            "created_at":   transcript["created_at"],
            "title":        title_data.get("title", "Team Meeting"),
            "meeting_type": title_data.get("meeting_type", "discussion"),
            "duration_sec": transcript.get("total_duration", 0),
            "speakers":     list(set(
                s["speaker"] for s in transcript["segments"]
            )),
            "action_items": final.get("action_items", []),
            "decisions":    final.get("decisions",    []),
            "blockers":     final.get("blockers",     []),
            "key_topics":   final.get("key_topics",   []),
            "summary":      final.get("summary",      ""),
            "metadata": {
                "extraction_time_sec": elapsed,
                "chunks_processed":    len(chunks),
                "model_used":          self.model,
                "segment_count":       len(transcript["segments"])
            }
        }

        print(f"[Extractor] Done in {elapsed}s ✓")
        print(f"[Extractor] Found: "
              f"{len(output['action_items'])} action items | "
              f"{len(output['decisions'])} decisions | "
              f"{len(output['blockers'])} blockers")

        return output

    def save(self, extraction: dict, output_dir: str = "data/extractions") -> str:
        """Save extraction result to disk."""
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        path = Path(output_dir) / f"{extraction['meeting_id']}.json"
        with open(path, "w", encoding="utf-8") as f:
            json.dump(extraction, f, indent=2, ensure_ascii=False)
        print(f"[Extractor] Saved → {path}")
        return str(path)