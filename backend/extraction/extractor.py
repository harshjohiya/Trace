import json
import re
import time
from typing import Optional
from groq import Groq
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
        self.model = config.GROQ_MODEL
        if not config.GROQ_API_KEY:
            raise RuntimeError("GROQ_API_KEY is missing. Set it in your environment.")
        self.client = Groq(api_key=config.GROQ_API_KEY)
        self._verify_groq()

    def _verify_groq(self):
        """Make sure Groq API is reachable and model is available."""
        try:
            self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
                    {"role": "user", "content": "connection test"},
                ],
                temperature=0.0,
                max_tokens=10,
            )
            print(f"[Extractor] Groq ready. Model: {self.model} [ok]")
        except Exception as e:
            error_text = str(e)
            if "model_decommissioned" in error_text:
                raise RuntimeError(
                    f"Groq model '{self.model}' is decommissioned. "
                    "Set GROQ_MODEL=llama-3.3-70b-versatile in your .env."
                ) from e
            raise RuntimeError(
                f"Groq API verification failed for model '{self.model}': {error_text}"
            ) from e

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
        Call Llama 3.1 via Groq with retry logic.
        Returns raw response text.
        """
        max_retries = 3

        for attempt in range(max_retries):
            try:
                response = self.client.chat.completions.create(
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
                    temperature=0.0,
                    max_tokens=1000,
                )
                return (response.choices[0].message.content or "").strip()

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

        valid = [r for r in chunk_results if r is not None]

        if not valid:
            return self._empty_result()

        # Even single chunks go through aggregation
        # so summary always gets generated
        chunks_json = json.dumps(valid, indent=2)
        prompt      = AGGREGATION_PROMPT.format(chunks_json=chunks_json)
        raw         = self._call_llm(prompt)
        result      = self._parse_json_response(raw, context="aggregation")

        if result:
            # Force summary generation if still null
            if not result.get("summary"):
                result["summary"] = self._generate_summary_fallback(valid)
            return result

        return self._merge_chunks_simple(valid)

    def _generate_summary_fallback(self, chunks: list[dict]) -> str:
        """Generate summary separately if aggregation didn't produce one."""
        print("[Extractor] Generating summary separately...")
        all_topics = []
        all_decisions = []
        for c in chunks:
            all_topics.extend(c.get("key_topics", []))
            all_decisions.extend(
                d.get("decision","") for d in c.get("decisions", [])
            )

        prompt = f"""Write a 2-3 sentence meeting summary based on:
Topics discussed: {', '.join(all_topics[:6])}
Decisions made: {', '.join(all_decisions[:4])}

Return ONLY the summary text, no JSON, no labels."""

        try:
            return self._call_llm(prompt).strip()
        except Exception:
            return "Meeting summary not available."

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

    def _clean_extraction(self, data: dict) -> dict:
        """
        Post-process LLM output to remove:
        - Null/empty entries in any list
        - Duplicate decisions and action items
        - Overly long task descriptions (trim to clean phrases)
        """
        # ── Remove null/empty blockers ───────────────────────
        data["blockers"] = [
            b for b in data.get("blockers", [])
            if isinstance(b, dict) and b.get("blocker") and b.get("affects")
        ]

        # ── Remove null/empty action items ───────────────────
        data["action_items"] = [
            a for a in data.get("action_items", [])
            if isinstance(a, dict) and a.get("task") and a.get("owner")
        ]

        # ── Deduplicate decisions ────────────────────────────
        seen = set()
        clean_dec = []
        for d in data.get("decisions", []):
            if not isinstance(d, dict):
                continue
            # Normalize: lowercase + first 60 chars as key
            key = d.get("decision", "").lower().strip()[:60]
            if key and key not in seen:
                clean_dec.append(d)
                seen.add(key)
        data["decisions"] = clean_dec

        # ── Deduplicate action items ─────────────────────────
        seen = set()
        clean_acts = []
        for a in data.get("action_items", []):
            if not isinstance(a, dict):
                continue

            # Trim long task descriptions to a clean phrase.
            task = a.get("task", "").strip()
            task = re.sub(r"\s+", " ", task)
            if len(task) > 140:
                task = task[:140].rsplit(" ", 1)[0].strip(" ,.;:")
                a["task"] = task

            key = task.lower()[:60]
            if key and key not in seen:
                clean_acts.append(a)
                seen.add(key)
        data["action_items"] = clean_acts

        # ── Deduplicate blockers ─────────────────────────────
        seen = set()
        clean_blocks = []
        for b in data.get("blockers", []):
            if not isinstance(b, dict):
                continue
            key = b.get("blocker", "").lower().strip()[:60]
            if key and key not in seen:
                clean_blocks.append(b)
                seen.add(key)
        data["blockers"] = clean_blocks

        # ── Deduplicate key topics ───────────────────────────
        seen = set()
        clean_topics = []
        for t in data.get("key_topics", []):
            if not isinstance(t, str):
                continue
            key = t.lower().strip()[:50]
            if key and key not in seen:
                clean_topics.append(t)
                seen.add(key)
        data["key_topics"] = clean_topics

        return data

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

        # Step 4.5: Clean up LLM artifacts
        final = self._clean_extraction(final)

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

        print(f"[Extractor] Done in {elapsed}s [ok]")
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
        print(f"[Extractor] Saved -> {path}")
        return str(path)
