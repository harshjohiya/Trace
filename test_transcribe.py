import json
from backend.ingestion.audio_processor import AudioProcessor
from backend.ingestion.transcriber import Transcriber

# ── Change this to your audio file ──────────────────────────
TEST_FILE  = "data/audio/audio 1.mp3"
MEETING_ID = "test_meeting_001"

# ── After first run, look at "All Speakers" output below ─────
# then fill in the real names here
NAME_MAP = {
    "SPEAKER_00": "Ken",
    "SPEAKER_01": "Maria",
    "SPEAKER_02": "Angela",
    "SPEAKER_03": "terek",
}

# ────────────────────────────────────────────────────────────
processor  = AudioProcessor()
transcriber = Transcriber()

# Step 1 — Convert
print("=" * 50)
print("STEP 1: Converting audio")
print("=" * 50)
audio_info = processor.validate_audio(TEST_FILE)
print(f"Duration : {audio_info['duration_minutes']} mins")
print(f"Size     : {audio_info['size_mb']} MB")
print(f"Format   : {audio_info['format']}")

wav_path = processor.convert_to_wav(TEST_FILE)

# Step 2 — Transcribe + Diarize
print("\n" + "=" * 50)
print("STEP 2: Transcribing + Diarizing")
print("=" * 50)
transcript = transcriber.transcribe(wav_path, meeting_id=MEETING_ID)

# Step 3 — Show raw speaker labels BEFORE renaming
print("\n" + "=" * 50)
print("RAW SPEAKERS DETECTED")
print("=" * 50)
seen = {}
for seg in transcript["segments"]:
    sp = seg["speaker"]
    if sp not in seen:
        seen[sp] = seg["text"][:70]

for sp, sample in seen.items():
    print(f'  {sp}: "{sample}"')

print(f"\n  Total unique speakers: {len(seen)}")
print(f"  Total duration      : {transcript['total_duration']}s")

# Step 4 — Rename to real names
transcript = transcriber.rename_speakers(transcript, NAME_MAP)

# Save final transcript
with open(f"data/transcripts/{MEETING_ID}.json", "w", encoding="utf-8") as f:
    json.dump(transcript, f, indent=2, ensure_ascii=False)

# Step 5 — Show final preview
print("\n" + "=" * 50)
print("FINAL TRANSCRIPT (first 10 segments)")
print("=" * 50)
for seg in transcript["segments"][:10]:
    print(f"[{seg['speaker']}] {seg['start']}s: {seg['text']}")

print(f"\nSaved → data/transcripts/{MEETING_ID}.json")
print("\nDone! ✓")