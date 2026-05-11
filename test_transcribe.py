from backend.ingestion.audio_processor import AudioProcessor
from backend.ingestion.transcriber import Transcriber
import json

TEST_FILE  = "data/audio/audio 1.mp3"
MEETING_ID = "test_meeting_001"

processor   = AudioProcessor()
transcriber = Transcriber()

print("=== Converting audio ===")
audio_info = processor.validate_audio(TEST_FILE)
print(f"Duration : {audio_info['duration_minutes']} mins")
print(f"Size     : {audio_info['size_mb']} MB")

wav_path = processor.convert_to_wav(TEST_FILE)

print("\n=== Transcribing via Groq Whisper API ===")
transcript = transcriber.transcribe(wav_path, meeting_id=MEETING_ID)

print("\n=== Preview (first 5 segments) ===")
for seg in transcript["segments"][:5]:
    print(f"  [{seg['start']}s - {seg['end']}s] {seg['text']}")

print(f"\nTotal segments : {len(transcript['segments'])}")
print(f"Total duration : {transcript['total_duration']}s")
print(f"Saved to       : data/transcripts/{MEETING_ID}.json")
