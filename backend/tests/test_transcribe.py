import json
from backend.ingestion.audio_processor import AudioProcessor
from backend.ingestion.transcriber import Transcriber

TEST_FILE  = "data/audio/audio 1.mp3"
MEETING_ID = "test_meeting_001"

processor   = AudioProcessor()
transcriber = Transcriber()

print("=" * 55)
print("STEP 1: Converting audio")
print("=" * 55)
audio_info = processor.validate_audio(TEST_FILE)
print(f"Duration : {audio_info['duration_minutes']} mins")
print(f"Size     : {audio_info['size_mb']} MB")
wav_path = processor.convert_to_wav(TEST_FILE)

print("\n" + "=" * 55)
print("STEP 2: Transcribing + Diarizing + Auto-naming")
print("=" * 55)
transcript = transcriber.transcribe(wav_path, meeting_id=MEETING_ID)

print("\n" + "=" * 55)
print("AUTO-DETECTED SPEAKERS")
print("=" * 55)
seen = {}
for seg in transcript["segments"]:
    sp = seg["speaker"]
    if sp not in seen:
        seen[sp] = (seg["start"], seg["text"][:70])

for sp, (ts, sample) in seen.items():
    print(f'\n  [{sp}] first heard at {ts}s:')
    print(f'    "{sample}"')

print(f'\n  Total speakers: {len(seen)}')

print("\n" + "=" * 55)
print("TRANSCRIPT PREVIEW (first 10 segments)")
print("=" * 55)
for seg in transcript["segments"][:10]:
    print(f"  [{seg['speaker']}] {seg['start']}s: {seg['text'][:65]}")

with open(f"data/transcripts/{MEETING_ID}.json", "w", encoding="utf-8") as f:
    json.dump(transcript, f, indent=2, ensure_ascii=False)

print(f"\nSaved -> data/transcripts/{MEETING_ID}.json [ok]")