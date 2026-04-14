import json
from backend.extraction.extractor import MeetingExtractor

# ── Load the transcript we already generated ─────────────
TRANSCRIPT_FILE = "data/transcripts/test_meeting_001.json"

print("=" * 55)
print("Loading transcript...")
print("=" * 55)
with open(TRANSCRIPT_FILE, "r", encoding="utf-8") as f:
    transcript = json.load(f)

print(f"Meeting  : {transcript['meeting_id']}")
print(f"Duration : {transcript['total_duration']}s")
print(f"Speakers : {transcript['speaker_count']}")

# ── Run extraction ────────────────────────────────────────
print("\n" + "=" * 55)
print("Running NLP extraction with Llama 3.1...")
print("=" * 55)

extractor  = MeetingExtractor()
extraction = extractor.extract(transcript)
extractor.save(extraction)

# ── Pretty print results ──────────────────────────────────
print("\n" + "=" * 55)
print(f"MEETING: {extraction['title']}")
print(f"TYPE   : {extraction['meeting_type']}")
print("=" * 55)

print(f"\nSUMMARY:\n  {extraction['summary']}")

print(f"\nACTION ITEMS ({len(extraction['action_items'])}):")
for i, item in enumerate(extraction['action_items'], 1):
    deadline = f" | due: {item['deadline']}" if item.get('deadline') else ""
    print(f"  {i}. [{item.get('owner','?')}] {item['task']}{deadline}")

print(f"\nDECISIONS ({len(extraction['decisions'])}):")
for i, d in enumerate(extraction['decisions'], 1):
    print(f"  {i}. {d['decision']}  (by {d.get('made_by','?')})")

print(f"\nBLOCKERS ({len(extraction['blockers'])}):")
for i, b in enumerate(extraction['blockers'], 1):
    print(f"  {i}. {b['blocker']}")

print(f"\nKEY TOPICS:")
for t in extraction['key_topics']:
    print(f"  - {t}")

print(f"\nMETADATA:")
meta = extraction['metadata']
print(f"  Extraction time : {meta['extraction_time_sec']}s")
print(f"  Chunks processed: {meta['chunks_processed']}")
print(f"  Model used      : {meta['model_used']}")

print(f"\nSaved -> data/extractions/test_meeting_001.json [ok]")