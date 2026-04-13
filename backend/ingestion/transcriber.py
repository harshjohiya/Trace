import json
import torch
import gc
from pathlib import Path
from datetime import datetime
import sys
sys.path.append(str(Path(__file__).parent.parent.parent))
from backend.config import config

class Transcriber:
    def __init__(self):
        self.device = config.DEVICE
        self.model = None
        self.diarize_model = None
        self.batch_size = 8
        print(f"[Transcriber] Using device: {self.device}")
        print(f"[Transcriber] CUDA available: {torch.cuda.is_available()}")
        if torch.cuda.is_available():
            print(f"[Transcriber] GPU: {torch.cuda.get_device_name(0)}")
            vram = torch.cuda.get_device_properties(0).total_memory / 1024**3
            print(f"[Transcriber] VRAM: {vram:.1f} GB")

    def _get_compute_config(self):
        """
        RTX 2050 has 4GB VRAM.
        Pick the safest settings that fit.
        """
        if not torch.cuda.is_available():
            return "cpu", "int8", 4, "small"

        vram_gb = torch.cuda.get_device_properties(0).total_memory / 1024**3
        print(f"[Transcriber] Detected VRAM: {vram_gb:.1f} GB")

        if vram_gb >= 8:
            return "cuda", "float16", 16, config.WHISPER_MODEL
        elif vram_gb >= 4:
            # RTX 2050 lands here — use medium model with int8
            return "cuda", "int8_float16", 8, "medium"
        else:
            return "cuda", "int8_float16", 4, "small"

    def load_models(self):
        if self.model is not None and self.diarize_model is not None:
            return

        device, compute_type, batch_size, model_name = self._get_compute_config()
        self.device = device
        self.batch_size = batch_size

        # ── Load Whisper ──────────────────────────────────────
        if self.model is None:
            print(f"[Transcriber] Loading Whisper: model={model_name} compute={compute_type}")

            # Patch faster-whisper options for version compatibility
            try:
                from faster_whisper.transcribe import TranscriptionOptions
                import dataclasses
                fields = {f.name for f in dataclasses.fields(TranscriptionOptions)}
                extra = {}
                if "multilingual" in fields:
                    extra["multilingual"] = False
                if "max_new_tokens" in fields:
                    extra["max_new_tokens"] = None
                if "clip_timestamps" in fields:
                    extra["clip_timestamps"] = "0"
                if "hallucination_silence_threshold" in fields:
                    extra["hallucination_silence_threshold"] = None
                if "hotwords" in fields:
                    extra["hotwords"] = None
            except Exception:
                extra = {}

            import whisperx

            # Patch broken VAD URL before loading
            self._patch_vad_loader()

            try:
                self.model = whisperx.load_model(
                    model_name,
                    device,
                    compute_type=compute_type,
                    language="en",
                    asr_options=extra if extra else None
                )
            except RuntimeError as e:
                if "out of memory" in str(e).lower():
                    print("[Transcriber] OOM on GPU, falling back to CPU...")
                    gc.collect()
                    torch.cuda.empty_cache()
                    self.device = "cpu"
                    self.batch_size = 4
                    self.model = whisperx.load_model(
                        "small", "cpu",
                        compute_type="int8",
                        language="en"
                    )
                else:
                    raise

            print("[Transcriber] Whisper model loaded ✓")

        # ── Load Diarization (pure pyannote — skips whisperx wrapper) ──
        if self.diarize_model is None:
            print("[Transcriber] Loading diarization pipeline...")
            self._load_diarization()
            print("[Transcriber] Diarization model loaded ✓")

    def _patch_vad_loader(self):
        """
        Patch whisperx's broken VAD URL with a working one.
        The original URL returns HTTP 301 and urllib doesn't follow it.
        """
        import os
        import urllib.request
        import whisperx.vad as vad_module

        # Where whisperx caches the VAD model
        model_dir = torch.hub._get_torch_home()
        os.makedirs(model_dir, exist_ok=True)
        vad_path = os.path.join(model_dir, "whisperx-vad-segmentation.bin")

        if not os.path.isfile(vad_path):
            # Working direct URL (raw GitHub, follows redirects properly)
            working_url = (
                "https://raw.githubusercontent.com/"
                "m-bain/whisperX/main/whisperx/assets/pytorch_model.bin"
            )
            print(f"[Transcriber] Downloading VAD weights...")
            try:
                req = urllib.request.Request(
                    working_url,
                    headers={"User-Agent": "Mozilla/5.0"}
                )
                with urllib.request.urlopen(req, timeout=60) as resp, \
                     open(vad_path, "wb") as out:
                    out.write(resp.read())
                print(f"[Transcriber] VAD weights saved to {vad_path}")
            except Exception as e:
                print(f"[Transcriber] WARNING: Could not download VAD: {e}")
                print("[Transcriber] Will attempt to continue without VAD patch...")

    def _load_diarization(self):
        """
        Load pyannote diarization directly — avoids whisperx's wrapper
        which has the broken segmentation-3.0 download issue.
        """
        from pyannote.audio import Pipeline

        if not config.HF_TOKEN:
            raise ValueError(
                "HF_TOKEN is empty in your .env file!\n"
                "Get your token from https://huggingface.co/settings/tokens"
            )

        try:
            pipeline = Pipeline.from_pretrained(
                "pyannote/speaker-diarization-3.1",
                use_auth_token=config.HF_TOKEN
            )
            pipeline = pipeline.to(torch.device(self.device))
            self.diarize_model = pipeline
        except Exception as e:
            err = str(e)
            if "gated" in err.lower() or "403" in err or "401" in err or "NoneType" in err:
                raise RuntimeError(
                    "\n\n❌ HUGGINGFACE ACCESS DENIED\n"
                    "You need to accept terms for these models:\n"
                    "  1. https://huggingface.co/pyannote/segmentation-3.0\n"
                    "  2. https://huggingface.co/pyannote/speaker-diarization-3.1\n"
                    "  3. https://huggingface.co/pyannote/wespeaker-voxceleb-resnet34-LM\n\n"
                    "After accepting, wait 1-2 minutes then rerun.\n"
                ) from e
            raise

    def transcribe(self, audio_path: str, meeting_id: str = None) -> dict:
        import whisperx

        self.load_models()

        audio_path = str(audio_path)
        meeting_id = meeting_id or Path(audio_path).stem

        print(f"\n[Transcriber] Transcribing: {audio_path}")

        # ── Step 1: Transcribe ──────────────────────────────
        print("[Transcriber] Step 1/3: Transcribing speech...")
        audio = whisperx.load_audio(audio_path)
        result = self.model.transcribe(
            audio,
            batch_size=self.batch_size,
            language="en"
        )
        print(f"[Transcriber] Got {len(result['segments'])} raw segments")

        # ── Step 2: Align timestamps ────────────────────────
        print("[Transcriber] Step 2/3: Aligning word timestamps...")
        align_model, metadata = whisperx.load_align_model(
            language_code=result["language"],
            device=self.device
        )
        result = whisperx.align(
            result["segments"],
            align_model,
            metadata,
            audio,
            self.device,
            return_char_alignments=False
        )
        # Free alignment model immediately to save VRAM
        del align_model
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        # ── Step 3: Diarize (pure pyannote) ─────────────────
        print("[Transcriber] Step 3/3: Identifying speakers...")
        diarization = self.diarize_model(audio_path)

        # Map pyannote output → whisperx-compatible format
        diarize_df = self._pyannote_to_df(diarization)
        result = self._assign_speakers(result, diarize_df)

        # ── Build + save output ──────────────────────────────
        transcript = self._build_transcript(result, meeting_id)
        output_path = self._save_transcript(transcript, meeting_id)
        print(f"[Transcriber] Saved → {output_path}")

        return transcript

    def _pyannote_to_df(self, diarization) -> "pd.DataFrame":
        """Convert pyannote Annotation → DataFrame whisperx expects."""
        import pandas as pd
        rows = []
        for turn, _, speaker in diarization.itertracks(yield_label=True):
            rows.append({
                "start": turn.start,
                "end": turn.end,
                "speaker": speaker
            })
        return pd.DataFrame(rows)

    def _assign_speakers(self, result: dict, diarize_df) -> dict:
        """
        Assign speaker label to each whisperx segment by
        finding the diarization segment with max overlap.
        """
        for seg in result["segments"]:
            seg_start = seg["start"]
            seg_end = seg["end"]

            best_speaker = "UNKNOWN"
            best_overlap = 0.0

            for _, row in diarize_df.iterrows():
                overlap_start = max(seg_start, row["start"])
                overlap_end = min(seg_end, row["end"])
                overlap = max(0.0, overlap_end - overlap_start)

                if overlap > best_overlap:
                    best_overlap = overlap
                    best_speaker = row["speaker"]

            seg["speaker"] = best_speaker

        return result

    def _build_transcript(self, result: dict, meeting_id: str) -> dict:
        segments = []
        current_speaker = None
        current_text = []
        current_start = None
        current_end = None

        for seg in result["segments"]:
            speaker = seg.get("speaker", "UNKNOWN")
            text = seg.get("text", "").strip()
            start = seg.get("start", 0)
            end = seg.get("end", 0)

            if speaker == current_speaker:
                current_text.append(text)
                current_end = end
            else:
                if current_speaker is not None:
                    segments.append({
                        "speaker": current_speaker,
                        "text": " ".join(current_text),
                        "start": round(current_start, 2),
                        "end": round(current_end, 2)
                    })
                current_speaker = speaker
                current_text = [text]
                current_start = start
                current_end = end

        if current_speaker is not None:
            segments.append({
                "speaker": current_speaker,
                "text": " ".join(current_text),
                "start": round(current_start, 2),
                "end": round(current_end, 2)
            })

        return {
            "meeting_id": meeting_id,
            "created_at": datetime.now().isoformat(),
            "total_duration": segments[-1]["end"] if segments else 0,
            "speaker_count": len(set(s["speaker"] for s in segments)),
            "segments": segments,
            "full_text": "\n".join(
                f"[{s['speaker']}]: {s['text']}" for s in segments
            )
        }

    def _save_transcript(self, transcript: dict, meeting_id: str) -> str:
        output_dir = Path(config.TRANSCRIPT_DIR)
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"{meeting_id}.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(transcript, f, indent=2, ensure_ascii=False)
        return str(output_path)