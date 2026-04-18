import json
from backend.storage.vector_store import VectorStore
from backend.query.rag import MeetingQueryEngine

# ── Step 1: Load and index our meeting data ───────────────
print("=" * 55)
print("INDEXING MEETING DATA INTO VECTOR DB")
print("=" * 55)

vs = VectorStore()

# Load transcript + extraction we already generated
with open("data/transcripts/test_meeting_001.json",  "r") as f:
    transcript = json.load(f)

with open("data/extractions/test_meeting_001.json", "r") as f:
    extraction = json.load(f)

# Index both
vs.index_transcript(transcript)
vs.index_extraction(extraction)

print(f"\nVector DB status:")
print(f"  Transcript chunks : {vs.transcripts.count()}")
print(f"  Extraction facts  : {vs.extractions.count()}")

# ── Step 2: Query the meeting ─────────────────────────────
print("\n" + "=" * 55)
print("QUERYING MEETING INTELLIGENCE")
print("=" * 55)

engine = MeetingQueryEngine(vector_store=vs)

# Test questions — these simulate real user queries
questions = [
    "What does Ken need to do?",
    "What decisions were made in the meeting?",
    "What is blocking progress?",
    "How long is the training period?",
    "What is Logiteam?",
]

for question in questions:
    print(f"\n{'─' * 50}")
    result = engine.ask(question)
    print(f"Q: {result['question']}")
    print(f"A: {result['answer']}")
    print(f"   [confidence: {result['confidence']} | "
          f"sources: {len(result['sources'])}]")

# ── Step 3: Structured filtered queries ───────────────────
print(f"\n{'=' * 55}")
print("STRUCTURED QUERIES (filtered by type)")
print("=" * 55)

# Get all action items
print("\nAll action items:")
result = engine.ask_structured(
    "all tasks and action items",
    filter_type="action_item"
)
for r in result["results"]:
    raw = r["raw"]
    if isinstance(raw, dict):
        owner    = raw.get("owner", "?")
        task     = raw.get("task", r["text"])
        deadline = raw.get("deadline") or "no deadline"
        print(f"  [{owner}] {task} | {deadline}")

# Get all decisions
print("\nAll decisions:")
result = engine.ask_structured(
    "all decisions made",
    filter_type="decision"
)
for r in result["results"]:
    raw = r["raw"]
    if isinstance(raw, dict):
        print(f"  • {raw.get('decision', r['text'])}")

# Get all blockers
print("\nAll blockers:")
result = engine.ask_structured(
    "all blockers and problems",
    filter_type="blocker"
)
for r in result["results"]:
    raw = r["raw"]
    if isinstance(raw, dict):
        print(f"  ⚠ {raw.get('blocker','?')} "
              f"→ affects: {raw.get('affects','?')}")

print(f"\n{'=' * 55}")
print("Week 3 complete ✓")
print("=" * 55)