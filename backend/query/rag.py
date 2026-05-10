import json
from groq import Groq
from pathlib import Path
import sys
sys.path.append(str(Path(__file__).parent.parent.parent))
from backend.config import config
from backend.storage.vector_store import VectorStore


class MeetingQueryEngine:
    """
    RAG-based query engine for meeting intelligence.

    Given a natural language question:
      1. Search ChromaDB for relevant facts + transcript chunks
      2. Build a context-rich prompt
      3. Ask Llama 3.2 to answer using ONLY retrieved context
      4. Return structured answer with sources
    """

    def __init__(self, vector_store: VectorStore = None):
        self.vs     = vector_store or VectorStore()
        if not config.GROQ_API_KEY:
            raise RuntimeError("GROQ_API_KEY is missing. Set it in your environment.")
        self.client = Groq(api_key=config.GROQ_API_KEY)
        self.model  = config.GROQ_MODEL
        print(f"[QueryEngine] Ready. Model: {self.model}")

    def _build_context(self, query: str) -> tuple[str, list]:
        """
        Retrieve relevant facts + transcript chunks for the query.
        """
        fact_hits       = self.vs.search_extractions(query, n_results=8)
        transcript_hits = self.vs.search_transcripts(query, n_results=3)

        sources = []
        context_parts = []

        if fact_hits:
            context_parts.append("=== EXTRACTED FACTS ===")
            for hit in fact_hits:
                if hit["score"] > 0.15:    # lowered from 0.3
                    context_parts.append(
                        f"[{hit['type'].upper()} | "
                        f"Meeting: {hit['meeting_id']} | "
                        f"Relevance: {hit['score']}]\n"
                        f"{hit['text']}"
                    )
                    sources.append({
                        "type":       hit["type"],
                        "meeting_id": hit["meeting_id"],
                        "score":      hit["score"]
                    })

        if transcript_hits:
            context_parts.append("\n=== RELEVANT TRANSCRIPT EXCERPTS ===")
            for hit in transcript_hits:
                if hit["score"] > 0.15:    # lowered from 0.3
                    context_parts.append(
                        f"[Meeting: {hit['meeting_id']} | "
                        f"{hit['start_time']}s-{hit['end_time']}s]\n"
                        f"{hit['text']}"
                    )
                    sources.append({
                        "type":       "transcript",
                        "meeting_id": hit["meeting_id"],
                        "score":      hit["score"]
                    })

        return "\n\n".join(context_parts), sources

    def _call_llm(self, system: str, user: str) -> str:
        """Call Llama 3.2 and return response text."""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user}
                ],
                temperature=0.1,
                max_tokens=512,
            )
            return (response.choices[0].message.content or "").strip()
        except Exception as e:
            error_text = str(e)
            if "model_decommissioned" in error_text:
                raise RuntimeError(
                    f"Groq model '{self.model}' is decommissioned. "
                    "Set GROQ_MODEL=llama-3.3-70b-versatile in your .env."
                ) from e
            raise RuntimeError(f"RAG LLM call failed via Groq: {error_text}") from e

    def ask(self, question: str) -> dict:
        """
        Main query method. Ask anything about your meetings.

        Returns:
          {
            "question": str,
            "answer": str,
            "sources": list,
            "confidence": "high" | "medium" | "low"
          }
        """
        print(f"\n[QueryEngine] Question: {question}")

        # Step 1: Retrieve context
        context, sources = self._build_context(question)

        if not context.strip():
            return {
                "question":   question,
                "answer":     "No relevant information found in meeting records.",
                "sources":    [],
                "confidence": "low"
            }

        # Step 2: Build RAG prompt
        system_prompt = """You are a meeting intelligence assistant.
Answer questions using ONLY the provided meeting context.

CRITICAL RULES:
- Answer in clean plain English only
- NEVER repeat or echo the context format tags like [DECISION], [ACTION_ITEM], [Meeting:], [Relevance:]
- NEVER include metadata labels in your answer
- Extract the actual content and present it naturally
- If multiple items found, use a numbered list
- If context doesn't contain the answer, say "Not found in meeting records"
- Keep answers concise and direct"""

        user_prompt = f"""MEETING CONTEXT:
{context}

QUESTION: {question}

Answer based strictly on the context above:"""

        # Step 3: Generate answer
        answer = self._call_llm(system_prompt, user_prompt)

        # Step 4: Assess confidence
        top_score    = max((s["score"] for s in sources), default=0)
        confidence   = (
            "high"   if top_score > 0.7 else
            "medium" if top_score > 0.4 else
            "low"
        )

        result = {
            "question":   question,
            "answer":     answer,
            "sources":    sources[:4],
            "confidence": confidence
        }

        print(f"[QueryEngine] Confidence: {confidence} "
              f"(top score: {top_score})")
        return result

    def ask_structured(
        self,
        question: str,
        filter_type: str = None
    ) -> dict:
        """
        Query with type filter for precise structured lookups.
        Lower threshold so short facts are always returned.
        """
        hits = self.vs.search_extractions(
            question,
            n_results=10,
            filter_type=filter_type
        )

        # Much lower threshold for structured - we WANT all facts of that type
        relevant = [h for h in hits if h["score"] > 0.05]

        return {
            "question": question,
            "filter":   filter_type,
            "results":  relevant,
            "count":    len(relevant)
        }
