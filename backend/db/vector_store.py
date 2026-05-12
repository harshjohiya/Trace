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
    # CHUNKING
    # ──────────────────────────────────────────────────────

    @staticmethod
    def chunk_transcript_for_embedding(segments, meeting_id, chunk_tokens=400, overlap_tokens=50):
        """
        Chunk transcript segments by token count with overlap.
        1 token ≈ 0.75 words (approximation, no tokenizer needed).
        Returns list of chunk dicts ready for Chroma ingestion.
        """
        chunks = []
        current_words = []
        current_length = 0
        chunk_index = 0
        current_speaker = "unknown"
        current_timestamp = 0

        for segment in segments:
            words = segment["text"].split()
            word_count = len(words)

            # Track first speaker/timestamp of this chunk
            if current_length == 0:
                current_speaker = segment.get("speaker", "unknown")
                current_timestamp = segment.get("start", segment.get("start_time", 0))

            current_words.extend(words)
            current_length += word_count

            if current_length >= chunk_tokens:
                chunks.append({
                    "text": " ".join(current_words),
                    "meeting_id": meeting_id,
                    "speaker": current_speaker,
                    "timestamp": current_timestamp,
                    "chunk_index": chunk_index,
                    "type": "discussion"
                })
                chunk_index += 1
                # Keep overlap
                overlap_words = current_words[-overlap_tokens:] if overlap_tokens > 0 else []
                current_words = overlap_words
                current_length = len(overlap_words)

        # Don't drop the last partial chunk
        if current_words:
            chunks.append({
                "text": " ".join(current_words),
                "meeting_id": meeting_id,
                "speaker": current_speaker,
                "timestamp": current_timestamp,
                "chunk_index": chunk_index,
                "type": "discussion"
            })

        return chunks

    # ──────────────────────────────────────────────────────
    # INDEXING
    # ──────────────────────────────────────────────────────

    def index_transcript(self, transcript: dict, chunk_tokens: int = 400, overlap_tokens: int = 50):
        """
        Store transcript as token-aware overlapping chunks.
        Uses improved chunking based on token count for better semantic boundaries.

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

        # Use token-aware chunking
        chunks = self.chunk_transcript_for_embedding(
            segments,
            meeting_id,
            chunk_tokens=chunk_tokens,
            overlap_tokens=overlap_tokens
        )

        # Prepare documents, metadatas, and IDs for batch insertion
        documents = [c["text"] for c in chunks]
        metadatas = [{
            "meeting_id":   c["meeting_id"],
            "speaker":      c["speaker"],
            "timestamp":    c["timestamp"],
            "chunk_index":  c["chunk_index"],
            "type":         c["type"]
        } for c in chunks]
        ids = [f"{c['meeting_id']}_chunk_{c['chunk_index']}" for c in chunks]

        # Batch store
        self.transcripts.add(
            documents=documents,
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
                "start_time": meta.get("timestamp"),
                "end_time":   meta.get("timestamp")
            })

        return hits
