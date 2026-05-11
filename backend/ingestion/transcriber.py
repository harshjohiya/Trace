from groq import Groq
import json
from pathlib import Path
from datetime import datetime
from backend.core.config import config


class Transcriber:
    def __init__(self):
        self.client = Groq(api_key=config.GROQ_API_KEY)
        self.audio_model = config.GROQ_AUDIO_MODEL
        print(f"[Transcriber] Using Groq Whisper API: {self.audio_model}")
        print("[Transcriber] No GPU required")

    def transcribe(self, audio_path: str, meeting_id: str = None) -> dict:
        meeting_id = meeting_id or Path(audio_path).stem
        audio_path = str(audio_path)

        # Check file size - Groq limit is 25MB
        file_size_mb = Path(audio_path).stat().st_size / (1024 * 1024)
        print(f"[Transcriber] File size: {file_size_mb:.1f} MB")
        if file_size_mb > 25:
            raise ValueError(
                f"Audio file too large ({file_size_mb:.1f} MB). "
                f"Groq API limit is 25MB. "
                f"Please use a shorter recording."
            )

        print(f"[Transcriber] Sending to Groq Whisper API...")

        try:
            with open(audio_path, "rb") as audio_file:
                transcription = self.client.audio.transcriptions.create(
                    file=(Path(audio_path).name, audio_file),
                    model=self.audio_model,
                    response_format="verbose_json",
                    timestamp_granularities=["segment"],
                )
        except Exception as e:
            raise RuntimeError(
                f"Groq transcription failed: {str(e)}\n"
                f"Check your GROQ_API_KEY in .env"
            )

        segments_raw = transcription.segments or []
        print(f"[Transcriber] Received {len(segments_raw)} segments")

        # Build segments - no speaker diarization for now
        # All speech attributed to "Speaker" as placeholder
        segments = []
        for seg in segments_raw:
            text = seg.text.strip() if hasattr(seg, "text") else str(seg.get("text", "")).strip()
            start = seg.start if hasattr(seg, "start") else seg.get("start", 0)
            end = seg.end if hasattr(seg, "end") else seg.get("end", 0)

            if text:
                segments.append({
                    "speaker": "Speaker",
                    "text": text,
                    "start": round(float(start), 2),
                    "end": round(float(end), 2)
                })

        transcript = {
            "meeting_id": meeting_id,
            "created_at": datetime.now().isoformat(),
            "total_duration": segments[-1]["end"] if segments else 0,
            "speaker_count": 1,
            "diarization": False,
            "segments": segments,
            "full_text": "\n".join(
                f"[{s['speaker']}]: {s['text']}" for s in segments
            )
        }

        output_path = self._save_transcript(transcript, meeting_id)
        print(f"[Transcriber] Done — {len(segments)} segments")
        print(f"[Transcriber] Saved → {output_path}")

        return transcript

    def _save_transcript(self, transcript: dict, meeting_id: str) -> str:
        from pathlib import Path
        import json
        output_dir = Path("data/transcripts")
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"{meeting_id}.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(transcript, f, indent=2, ensure_ascii=False)
        return str(output_path)

    def rename_speakers(self, transcript: dict, name_map: dict) -> dict:
        # Keep this method - useful for future when diarization returns
        for seg in transcript["segments"]:
            seg["speaker"] = name_map.get(seg["speaker"], seg["speaker"])
        transcript["full_text"] = "\n".join(
            f"[{s['speaker']}]: {s['text']}"
            for s in transcript["segments"]
        )
        transcript["speaker_names"] = name_map
        return transcript
