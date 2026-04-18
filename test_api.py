import requests
import json
import time

BASE = "http://localhost:8000"

print("=" * 55)
print("TESTING MEETING INTELLIGENCE API")
print("=" * 55)

# ── Health check ─────────────────────────────────────────
r = requests.get(f"{BASE}/health")
print(f"\n✓ Health: {r.json()['status']}")

# ── List meetings ─────────────────────────────────────────
r = requests.get(f"{BASE}/meetings")
data = r.json()
print(f"\n✓ Meetings in DB: {data['count']}")
for m in data["meetings"]:
    print(f"  [{m['meeting_id']}] {m['title']}")
    print(f"   Tasks:{m['action_items']} | "
          f"Decisions:{m['decisions']} | "
          f"Blockers:{m['blockers']}")

# ── Natural language query ────────────────────────────────
print(f"\n{'─' * 50}")
print("Natural language queries:")

questions = [
    "What does Ken need to do?",
    "What decisions were made?",
    "What is Logiteam?",
]

for q in questions:
    r = requests.post(
        f"{BASE}/query",
        json={"question": q}
    )
    result = r.json()
    print(f"\nQ: {q}")
    print(f"A: {result['answer'][:120]}...")
    print(f"   [{result['confidence']} confidence]")

# ── Structured query ──────────────────────────────────────
print(f"\n{'─' * 50}")
print("Structured queries:")

r = requests.post(
    f"{BASE}/query",
    json={"question": "all action items", "filter_type": "action_item"}
)
result = r.json()
print(f"\nAll action items ({result['count']}):")
for item in result["results"]:
    raw = item.get("raw", {})
    if isinstance(raw, dict):
        print(f"  ✓ [{raw.get('owner','?')}] {raw.get('task','?')}")

# ── Upload test ───────────────────────────────────────────
print(f"\n{'─' * 50}")
print("Upload test:")

with open("data/audio/audio 1.mp3", "rb") as f:
    r = requests.post(
        f"{BASE}/meetings/upload",
        files={"file": ("audio_1.mp3", f, "audio/mpeg")}
    )

job = r.json()
print(f"  Job created: {job['job_id']}")
print(f"  Meeting ID : {job['meeting_id']}")

# Poll status
print("  Polling job status...")
for _ in range(6):
    time.sleep(5)
    r = requests.get(f"{BASE}/jobs/{job['job_id']}")
    status = r.json()
    print(f"  → {status['status']} ({status['progress']}%)")
    if status["status"] in ["completed", "failed"]:
        break

print(f"\n{'=' * 55}")
print("API test complete ✓")
print("=" * 55)
print(f"\nInteractive docs: http://localhost:8000/docs")