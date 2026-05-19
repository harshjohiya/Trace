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
        print("[Transcriber] No GPU required for Whisper")
        self.diarization_pipeline = None

    def _get_diarization_pipeline(self):
        if self.diarization_pipeline is None:
            if not config.HF_TOKEN:
                raise ValueError("HF_TOKEN is required for speaker diarization.")
            print("[Transcriber] Loading pyannote.audio diarization pipeline...")
            from pyannote.audio import Pipeline
            import torch
            
            self.diarization_pipeline = Pipeline.from_pretrained(
                "pyannote/speaker-diarization-3.1",
                use_auth_token=config.HF_TOKEN
            )
            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            self.diarization_pipeline.to(device)
            print(f"[Transcriber] Diarization pipeline loaded on {device}")
        return self.diarization_pipeline

    def transcribe(self, audio_path: str, meeting_id: str = None, diarization_enabled: bool = False) -> dict:
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
                granularities = ["word", "segment"] if diarization_enabled else ["segment"]
                transcription = self.client.audio.transcriptions.create(
                    file=(Path(audio_path).name, audio_file),
                    model=self.audio_model,
                    response_format="verbose_json",
                    timestamp_granularities=granularities,
                )
        except Exception as e:
            raise RuntimeError(
                f"Groq transcription failed: {str(e)}\n"
                f"Check your GROQ_API_KEY in .env"
            )

        segments_raw = transcription.segments or []
        words_raw = getattr(transcription, "words", []) or []
        print(f"[Transcriber] Received {len(segments_raw)} segments, {len(words_raw)} words")

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

        if diarization_enabled:
            print("[Transcriber] Diarization requested, running pyannote...")
            try:
                pipeline = self._get_diarization_pipeline()
                diarization = pipeline(audio_path)
                diarization_list = list(diarization.itertracks(yield_label=True))
                
                if words_raw:
                    print("[Transcriber] Using precise word-level diarization alignment")
                    new_segments = []
                    current_speaker = None
                    current_text = ""
                    current_start = 0.0
                    current_end = 0.0
                    
                    for w in words_raw:
                        word_text = w["word"] if isinstance(w, dict) else w.word
                        word_start = w["start"] if isinstance(w, dict) else w.start
                        word_end = w["end"] if isinstance(w, dict) else w.end
                        
                        speaker_durations = {}
                        for turn, _, speaker in diarization_list:
                            overlap_start = max(word_start, turn.start)
                            overlap_end = min(word_end, turn.end)
                            overlap_dur = max(0, overlap_end - overlap_start)
                            if overlap_dur > 0:
                                speaker_durations[speaker] = speaker_durations.get(speaker, 0) + overlap_dur
                                
                        if speaker_durations:
                            word_speaker = max(speaker_durations.items(), key=lambda x: x[1])[0]
                        else:
                            word_speaker = "SPEAKER_00"
                            
                        if current_speaker is None:
                            current_speaker = word_speaker
                            current_start = word_start
                            current_text = word_text
                            current_end = word_end
                        elif current_speaker == word_speaker:
                            current_text += word_text
                            current_end = word_end
                        else:
                            new_segments.append({
                                "speaker": current_speaker,
                                "text": current_text.strip(),
                                "start": round(current_start, 2),
                                "end": round(current_end, 2)
                            })
                            current_speaker = word_speaker
                            current_start = word_start
                            current_text = word_text
                            current_end = word_end
                            
                    if current_speaker is not None:
                        new_segments.append({
                            "speaker": current_speaker,
                            "text": current_text.strip(),
                            "start": round(current_start, 2),
                            "end": round(current_end, 2)
                        })
                    segments = new_segments
                else:
                    print("[Transcriber] Falling back to segment-level diarization alignment")
                    for seg in segments:
                        seg_start = seg["start"]
                        seg_end = seg["end"]
                        
                        speaker_durations = {}
                        for turn, _, speaker in diarization_list:
                            overlap_start = max(seg_start, turn.start)
                            overlap_end = min(seg_end, turn.end)
                            overlap_dur = max(0, overlap_end - overlap_start)
                            if overlap_dur > 0:
                                speaker_durations[speaker] = speaker_durations.get(speaker, 0) + overlap_dur
                                
                        if speaker_durations:
                            seg["speaker"] = max(speaker_durations.items(), key=lambda x: x[1])[0]
                        else:
                            seg["speaker"] = "SPEAKER_00"
                            
                    # Merge consecutive segments from same speaker
                    merged_segments = []
                    for seg in segments:
                        if merged_segments and merged_segments[-1]["speaker"] == seg["speaker"]:
                            merged_segments[-1]["text"] += " " + seg["text"]
                            merged_segments[-1]["end"] = seg["end"]
                        else:
                            merged_segments.append(seg.copy())
                    segments = merged_segments
                    
                print(f"[Transcriber] Diarization complete, found speakers: {set(s['speaker'] for s in segments)}")
                
            except Exception as e:
                print(f"[Transcriber] Diarization failed: {str(e)}")
                print("[Transcriber] Falling back to default 'Speaker' tags")

        transcript = {
            "meeting_id": meeting_id,
            "created_at": datetime.now().isoformat(),
            "total_duration": segments[-1]["end"] if segments else 0,
            "speaker_count": len(set(s["speaker"] for s in segments)) if segments else 1,
            "diarization": diarization_enabled,
            "segments": segments,
            "full_text": "\n\n".join(
                f"{s['speaker']}:\n{s['text']}" for s in segments
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
        transcript["full_text"] = "\n\n".join(
            f"{s['speaker']}:\n{s['text']}"
            for s in transcript["segments"]
        )
        transcript["speaker_names"] = name_map
        return transcript
