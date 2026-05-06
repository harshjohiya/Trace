"""
One-time cleanup — remove all duplicate meetings.
Keeps only test_meeting_001, deletes everything else.
"""
import sys
sys.stdout.reconfigure(encoding="utf-8")

import requests
import json
from pathlib import Path
import shutil

BASE = "http://localhost:8000"

print("=" * 55)
print("CLEANUP: Removing duplicate meetings")
print("=" * 55)

# Step 1: List all meetings
r = requests.get(f"{BASE}/meetings")
data = r.json()
print(f"\nFound {data['count']} meetings:")
for m in data["meetings"]:
    print(f"  [{m['meeting_id']}] {m['title']}")

# Step 2: Delete all except test_meeting_001
keep = "test_meeting_001"
deleted = []
for m in data["meetings"]:
    mid = m["meeting_id"]
    if mid == keep:
        print(f"\n  KEEP: {mid}")
        continue

    r = requests.delete(f"{BASE}/meetings/{mid}")
    if r.status_code == 200:
        result = r.json()
        print(f"  DELETED: {mid} -> {result['deleted']}")
        deleted.append(mid)
    else:
        print(f"  FAILED: {mid} -> {r.status_code}: {r.text}")

# Step 3: Clean up orphaned audio files (keep only audio 1.mp3)
audio_dir = Path("data/audio")
orphaned = 0
for f in audio_dir.iterdir():
    if f.name in (".gitkeep", "audio 1.mp3"):
        continue
    f.unlink()
    orphaned += 1

print(f"\n--- Summary ---")
print(f"  Meetings deleted:       {len(deleted)}")
print(f"  Orphaned audio removed: {orphaned}")

# Step 4: Verify
r = requests.get(f"{BASE}/meetings")
data = r.json()
print(f"\n  Remaining meetings: {data['count']}")
for m in data["meetings"]:
    print(f"    [{m['meeting_id']}] tasks={m['action_items']} "
          f"decisions={m['decisions']} blockers={m['blockers']}")

print(f"\n{'=' * 55}")
print("Cleanup complete!")
print("=" * 55)
