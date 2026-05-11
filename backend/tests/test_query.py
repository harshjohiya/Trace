import json
from backend.db.vector_store import VectorStore
from backend.rag.query_engine import MeetingQueryEngine

print("=" * 55)
print("INDEXING MEETING DATA INTO VECTOR DB")
print("=" * 55)

vs = VectorStore()

with open("data/transcripts/test_meeting_001.json", "r") as f:
    transcript = json.load(f)

with open("data/extractions/test_meeting_001.json", "r") as f:
    extraction = json.load(f)

# Always re-index to pick up any changes
vs.index_transcript(transcript)
vs.index_extraction(extraction)

print(f"\nVector DB:")
print(f"  Transcript chunks : {vs.transcripts.count()}")
print(f"  Extraction facts  : {vs.extractions.count()}")

print("\n" + "=" * 55)
print("NATURAL LANGUAGE QUERIES")
print("=" * 55)

engine = MeetingQueryEngine(vector_store=vs)

questions = [
    "What does Ken need to do?",
    "What decisions were made in the meeting?",
    "What is blocking progress?",
    "How long is the training period?",
    "What is Logiteam?",
    "Who is responsible for sending the confidentiality agreement?",
]

for question in questions:
    print(f"\n{'─' * 50}")
    result = engine.ask(question)
    print(f"Q: {result['question']}")
    print(f"A: {result['answer']}")
    print(f"   [confidence: {result['confidence']} | "
          f"top score: {result['sources'][0]['score'] if result['sources'] else 0}]")

print(f"\n{'=' * 55}")
print("STRUCTURED QUERIES")
print("=" * 55)

print("\nAll action items:")
result = engine.ask_structured("all tasks", filter_type="action_item")
for r in result["results"]:
    raw = r["raw"]
    if isinstance(raw, dict):
        owner    = raw.get("owner", "?")
        task     = raw.get("task", "?")
        deadline = raw.get("deadline") or "no deadline"
        print(f"  ✓ [{owner}] {task} | {deadline}")

print("\nAll decisions:")
result = engine.ask_structured("all decisions", filter_type="decision")
for r in result["results"]:
    raw = r["raw"]
    if isinstance(raw, dict):
        print(f"  • {raw.get('decision','?')}")
        print(f"    → by {raw.get('made_by','?')}")

print("\nAll blockers:")
result = engine.ask_structured("all blockers", filter_type="blocker")
for r in result["results"]:
    raw = r["raw"]
    if isinstance(raw, dict):
        print(f"  ⚠ {raw.get('blocker','?')}"
              f" → affects: {raw.get('affects','?')}")

print(f"\n{'=' * 55}")
print("Week 3 complete ✓")
print("=" * 55)