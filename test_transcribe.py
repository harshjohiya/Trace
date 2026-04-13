from backend.ingestion.audio_processor import AudioProcessor
from backend.ingestion.transcriber import Transcriber

# ── Test with any audio/video file ──────────────────────
# Drop any .mp3 / .mp4 / .wav / .m4a into data/audio/
# and change this path

TEST_FILE = "data/audio/audio 1.mp3"  # ← change this

processor = AudioProcessor()
transcriber = Transcriber()

# Step 1: Convert to WAV
print("=== Converting audio ===")
audio_info = processor.validate_audio(TEST_FILE)
print(f"Duration: {audio_info['duration_minutes']} mins | Size: {audio_info['size_mb']} MB")

wav_path = processor.convert_to_wav(TEST_FILE)

# Step 2: Transcribe + Diarize
print("\n=== Transcribing ===")
transcript = transcriber.transcribe(wav_path, meeting_id="test_meeting_001")

# Step 3: Preview output
print("\n=== Transcript Preview ===")
for seg in transcript["segments"][:5]:   # first 5 segments
    print(f"[{seg['speaker']}] ({seg['start']}s): {seg['text']}")

print(f"\nTotal speakers detected: {transcript['speaker_count']}")
print(f"Total duration: {transcript['total_duration']}s")
print(f"\nFull transcript saved to: data/transcripts/test_meeting_001.json")