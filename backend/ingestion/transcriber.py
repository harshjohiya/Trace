import json
import torch
import gc
import os
import urllib.request
import numpy as np
import time
from pathlib import Path
from datetime import datetime
import sys
sys.path.append(str(Path(__file__).parent.parent.parent))
from backend.core.config import config
from backend.ingestion.speaker_identifier import SpeakerIdentifier


class Transcriber:
    def __init__(self):
        self.device = config.DEVICE
        self.model = None
        self.diarize_model = None
        self._diarization_attempted = False
        self._align_cache = {}
        # When True we use whisperx APIs (alignment + helpers).
        # When False we fall back to faster_whisper (no alignment).
        self._whisperx_mode = True
        self.batch_size = 8
        print(f"[Transcriber] Using device: {self.device}")
        print(f"[Transcriber] CUDA available: {torch.cuda.is_available()}")
        if torch.cuda.is_available():
            print(f"[Transcriber] GPU: {torch.cuda.get_device_name(0)}")
            vram = torch.cuda.get_device_properties(0).total_memory / 1024**3
            print(f"[Transcriber] VRAM: {vram:.1f} GB")

    # ──────────────────────────────────────────────────────────
    # SETUP HELPERS
    # ──────────────────────────────────────────────────────────

    def _get_compute_config(self):
        """Pick Whisper model size + compute type based on available VRAM."""
        if not torch.cuda.is_available():
            return "cpu", "int8", 4, "small"

        vram_gb = torch.cuda.get_device_properties(0).total_memory / 1024**3
        print(f"[Transcriber] Detected VRAM: {vram_gb:.1f} GB")

        if vram_gb >= 8:
            return "cuda", "float16", 16, config.WHISPER_MODEL
        elif vram_gb >= 4:
            return "cuda", "int8_float16", 8, "medium"
        else:
            return "cuda", "int8_float16", 4, "small"

    def _patch_vad_loader(self):
        """
        Whisperx's built-in VAD URL returns HTTP 301 and breaks.
        Download the weights manually from GitHub if not cached.
        """
        model_dir = torch.hub._get_torch_home()
        os.makedirs(model_dir, exist_ok=True)
        vad_path = os.path.join(model_dir, "whisperx-vad-segmentation.bin")

        if not os.path.isfile(vad_path):
            working_url = (
                "https://raw.githubusercontent.com/"
                "m-bain/whisperX/main/whisperx/assets/pytorch_model.bin"
            )
            print("[Transcriber] Downloading VAD weights from GitHub...")
            try:
                req = urllib.request.Request(
                    working_url,
                    headers={"User-Agent": "Mozilla/5.0"}
                )
                with urllib.request.urlopen(req, timeout=60) as resp, \
                     open(vad_path, "wb") as out:
                    out.write(resp.read())
                print(f"[Transcriber] VAD weights saved -> {vad_path}")
            except Exception as e:
                print(f"[Transcriber] WARNING: VAD download failed: {e}")

    def _get_faster_whisper_extra_options(self):
        """
        Newer faster-whisper versions added required fields that
        older whisperx doesn't pass. Detect and inject them.
        """
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
            return extra
        except Exception:
            return {}

    # ──────────────────────────────────────────────────────────
    # MODEL LOADING
    # ──────────────────────────────────────────────────────────

    def load_models(self):
        """Load Whisper + pyannote. Safe to call multiple times."""
        if self.model is not None and (
            self.diarize_model is not None or self._diarization_attempted
        ):
            return

        device, compute_type, batch_size, model_name = self._get_compute_config()
        self.device = device
        self.batch_size = batch_size

        if self.model is None:
            self._load_whisper(model_name, device, compute_type)

        if self.diarize_model is None and not self._diarization_attempted:
            self._load_diarization()

        if self._whisperx_mode and self.device == "cpu":
            # Preload alignment model once to remove per-request startup overhead.
            self._get_align_resources("en")

    def _load_whisper(self, model_name, device, compute_type):
        # WhisperX imports can pull in heavy deps (pyannote, torchmetrics,
        # matplotlib) which may fail under restrictive Windows App Control
        # policies. Try to import whisperx first and fall back to
        # faster_whisper when import fails.
        try:
            import whisperx
            self._whisperx_mode = True
        except Exception as e:
            print(f"[Transcriber] whisperx import failed: {e}")
            print("[Transcriber] Falling back to faster_whisper (no alignment)")
            self._whisperx_mode = False

        if self._whisperx_mode:
            print(f"[Transcriber] Loading WhisperX: model={model_name} "
                  f"device={device} compute={compute_type}")

            self._patch_vad_loader()
            extra = self._get_faster_whisper_extra_options()

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
                    print("[Transcriber] OOM — falling back to CPU/small...")
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

            print("[Transcriber] WhisperX model loaded [ok]")
        else:
            # Try faster_whisper as a lightweight fallback for pure ASR
            try:
                from faster_whisper import WhisperModel
                print(f"[Transcriber] Loading faster_whisper: model={model_name} "
                      f"device={device} compute={compute_type}")
                self.model = WhisperModel(model_name, device=device, compute_type=compute_type)
                print("[Transcriber] faster_whisper model loaded [ok]")
            except Exception as e:
                raise RuntimeError(
                    "Failed to import whisperx and faster_whisper is unavailable. "
                    "Install whisperx or faster-whisper, or run on a machine without App Control blocking DLLs."
                ) from e

    def _load_diarization(self):
        """
        Load pyannote speaker diarization pipeline directly.
        Skips whisperx's broken wrapper entirely.
        """
        self._diarization_attempted = True
        try:
            from pyannote.audio import Pipeline
        except Exception as e:
            print(f"[Transcriber] pyannote import failed: {e}")
            print("[Transcriber] Diarization disabled — continuing without speaker diarization.")
            self.diarize_model = None
            return

        if not config.HF_TOKEN:
            raise ValueError(
                "HF_TOKEN is missing from your .env file!\n"
                "Get it from: https://huggingface.co/settings/tokens"
            )

        print("[Transcriber] Loading pyannote diarization pipeline...")

        try:
            pipeline = Pipeline.from_pretrained(
                "pyannote/speaker-diarization-3.1",
                use_auth_token=config.HF_TOKEN
            )
            clustering = getattr(pipeline, "_clustering", None)
            if clustering is not None:
                if hasattr(clustering, "threshold"):
                    clustering.threshold = 0.60
                if hasattr(clustering, "method"):
                    clustering.method = "average"

            pipeline = pipeline.to(torch.device(self.device))
            self.diarize_model = pipeline
            print("[Transcriber] Diarization pipeline loaded [ok]")

        except Exception as e:
            err = str(e)
            if any(x in err for x in ["gated", "403", "401", "NoneType"]):
                raise RuntimeError(
                    "\n\n❌ HUGGINGFACE ACCESS DENIED\n"
                    "You need to accept terms for ALL THREE models:\n"
                    "  1. https://huggingface.co/pyannote/segmentation-3.0\n"
                    "  2. https://huggingface.co/pyannote/speaker-diarization-3.1\n"
                    "  3. https://huggingface.co/pyannote/wespeaker-voxceleb-resnet34-LM\n\n"
                    "After accepting, wait 2 min then rerun.\n"
                ) from e
            print(f"[Transcriber] Diarization loading failed: {e}\nContinuing without diarization.")
            self.diarize_model = None

    def _get_align_resources(self, language_code: str):
        """Load/cached WhisperX align model per language code."""
        # On CUDA, keep align model ephemeral to avoid VRAM pressure/OOM.
        if self.device == "cuda":
            import whisperx
            return whisperx.load_align_model(
                language_code=language_code,
                device=self.device
            )

        if language_code in self._align_cache:
            return self._align_cache[language_code]

        import whisperx
        align_model, metadata = whisperx.load_align_model(
            language_code=language_code,
            device=self.device
        )
        self._align_cache[language_code] = (align_model, metadata)
        return align_model, metadata

    # ──────────────────────────────────────────────────────────
    # SPEAKER COUNT ESTIMATION
    # ──────────────────────────────────────────────────────────

    def _estimate_speaker_count(self, audio, sample_rate: int = 16000) -> int:
        """
        Estimate speaker count from audio energy patterns BEFORE
        running full diarization. Gives pyannote a tight min/max
        range so it doesn't collapse similar-voiced speakers.

        Method: split audio into 1s frames → compute RMS energy
        per frame → cluster into low/mid/high bands → map to
        estimated speaker count.
        """
        frame_size = sample_rate  # 1 second
        n_frames = len(audio) // frame_size

        if n_frames < 4:
            print("[Transcriber] Audio too short to estimate — assuming 2 speakers")
            return 2

        # RMS energy per frame
        energies = []
        for i in range(n_frames):
            frame = audio[i * frame_size: (i + 1) * frame_size]
            rms = float(np.sqrt(np.mean(frame.astype(np.float32) ** 2)))
            energies.append(rms)

        energies = np.array(energies)

        # Keep only speech frames (top 60% energy)
        threshold = np.percentile(energies, 40)
        speech_energies = energies[energies > threshold]

        if len(speech_energies) < 4:
            return 2

        mean_e = np.mean(speech_energies)
        std_e  = np.std(speech_energies)

        # Bucket into energy bands — different speakers have
        # different average vocal energy levels
        low  = np.sum(speech_energies < mean_e - 0.3 * std_e)
        mid  = np.sum(
            (speech_energies >= mean_e - 0.3 * std_e) &
            (speech_energies <= mean_e + 0.3 * std_e)
        )
        high = np.sum(speech_energies > mean_e + 0.3 * std_e)

        # Count bands that have meaningful presence (>5% of frames)
        active_bands = sum(
            1 for b in [low, mid, high]
            if b > n_frames * 0.05
        )

        estimate = max(2, active_bands + 1)
        print(f"[Transcriber] Energy bands -> low:{low} mid:{mid} high:{high} "
              f"| estimated speakers: {estimate}")

        return estimate

    # ──────────────────────────────────────────────────────────
    # MAIN TRANSCRIBE PIPELINE
    # ──────────────────────────────────────────────────────────

    def transcribe(self, audio_path: str, meeting_id: str = None) -> dict:
        """
        Full pipeline:
          1. Transcribe with WhisperX
          2. Align word timestamps
          3. Estimate + run speaker diarization
          4. Auto-identify speaker names
          5. Build + save structured JSON
        """
        self.load_models()

        audio_path = str(audio_path)
        meeting_id = meeting_id or Path(audio_path).stem
        stage_start = time.time()

        print(f"\n[Transcriber] Starting pipeline for: {audio_path}")

        # ── Step 1: Transcribe ───────────────────────────────
        print("[Transcriber] Step 1/3: Transcribing speech...")
        if self._whisperx_mode:
            import whisperx
            audio = whisperx.load_audio(audio_path)
            result = self.model.transcribe(
                audio,
                batch_size=self.batch_size,
                language="en"
            )
        else:
            # faster_whisper fallback: transcribe from file path
            print("[Transcriber] Using faster_whisper for ASR (no alignment).")
            segments, info = self.model.transcribe(audio_path, beam_size=5, language="en")
            segs = []
            for s in segments:
                # faster_whisper segments have start, end, text attributes
                segs.append({"start": float(s.start), "end": float(s.end), "text": s.text})
            result = {"language": getattr(info, "language", "en"), "segments": segs}
        print(f"[Transcriber] ASR completed in {time.time() - stage_start:.1f}s")

        print(f"[Transcriber] Got {len(result['segments'])} raw segments")

        # ── Step 2: Align timestamps (whisperx only) ─────────
        if self._whisperx_mode:
            align_start = time.time()
            print("[Transcriber] Step 2/3: Aligning timestamps...")
            align_model, metadata = self._get_align_resources(result["language"])
            result = whisperx.align(
                result["segments"], align_model,
                metadata, audio, self.device,
                return_char_alignments=False
            )
            if self.device == "cuda":
                del align_model
                gc.collect()
                torch.cuda.empty_cache()
            print(f"[Transcriber] Alignment completed in {time.time() - align_start:.1f}s")
        else:
            print("[Transcriber] Skipping alignment (not available without whisperx)")

        # ── Step 3: Diarize ──────────────────────────────────
        diarize_start = time.time()
        print("[Transcriber] Step 3/3: Identifying speakers...")
        if self.diarize_model is None:
            print("[Transcriber] Diarization disabled — assigning single speaker to all segments")
            for seg in result["segments"]:
                seg["speaker"] = "SPEAKER_00"
        else:
            # Use a conservative default estimate when we don't have raw audio array
            if self._whisperx_mode:
                estimated = self._estimate_speaker_count(audio)
            else:
                estimated = 2
            print(f"[Transcriber] Estimated speakers: {estimated}")

            diarization = self.diarize_model(
                audio_path,
                min_speakers=max(2, estimated - 1),
                max_speakers=estimated + 2
            )
            actual = len(set(
                spk for _, _, spk in diarization.itertracks(yield_label=True)
            ))
            print(f"[Transcriber] Pyannote found: {actual} speakers")

            diarize_df = self._pyannote_to_df(diarization)
            result     = self._assign_speakers(result, diarize_df)
        print(f"[Transcriber] Diarization completed in {time.time() - diarize_start:.1f}s")

        # ── Step 4: Build transcript ─────────────────────────
        transcript = self._build_transcript(result, meeting_id)

        # ── Step 5: Auto-identify names ──────────────────────
        identify_start = time.time()
        identifier = SpeakerIdentifier()
        name_map   = identifier.identify(transcript)

        print(f"[Transcriber] Auto-identified names: {name_map}")
        transcript = self.rename_speakers(transcript, name_map)
        print(f"[Transcriber] Speaker identification completed in {time.time() - identify_start:.1f}s")

        # ── Step 6: Save ─────────────────────────────────────
        output_path = self._save_transcript(transcript, meeting_id)
        print(f"[Transcriber] Saved -> {output_path}")
        print(f"[Transcriber] Total transcribe pipeline: {time.time() - stage_start:.1f}s")

        return transcript

    # ──────────────────────────────────────────────────────────
    # DIARIZATION HELPERS
    # ──────────────────────────────────────────────────────────

    def _pyannote_to_df(self, diarization):
        """Convert pyannote Annotation object → pandas DataFrame."""
        import pandas as pd
        rows = []
        for turn, _, speaker in diarization.itertracks(yield_label=True):
            rows.append({
                "start":   turn.start,
                "end":     turn.end,
                "speaker": speaker
            })
        return pd.DataFrame(rows)

    def _assign_speakers(self, result: dict, diarize_df) -> dict:
        """
        Match each Whisper segment to a speaker by finding
        the diarization window with maximum time overlap.
        """
        for seg in result["segments"]:
            seg_start = seg["start"]
            seg_end   = seg["end"]

            best_speaker = "UNKNOWN"
            best_overlap = 0.0

            for _, row in diarize_df.iterrows():
                overlap = max(
                    0.0,
                    min(seg_end, row["end"]) - max(seg_start, row["start"])
                )
                if overlap > best_overlap:
                    best_overlap = overlap
                    best_speaker = row["speaker"]

            seg["speaker"] = best_speaker

        return result

    # ──────────────────────────────────────────────────────────
    # OUTPUT BUILDERS
    # ──────────────────────────────────────────────────────────

    def _build_transcript(self, result: dict, meeting_id: str) -> dict:
        """
        Merge consecutive same-speaker segments into
        clean blocks with timestamps.
        """
        segments = []
        current_speaker = None
        current_text    = []
        current_start   = None
        current_end     = None

        for seg in result["segments"]:
            speaker = seg.get("speaker", "UNKNOWN")
            text    = seg.get("text", "").strip()
            start   = seg.get("start", 0)
            end     = seg.get("end", 0)

            if speaker == current_speaker:
                current_text.append(text)
                current_end = end
            else:
                if current_speaker is not None:
                    segments.append({
                        "speaker": current_speaker,
                        "text":    " ".join(current_text),
                        "start":   round(current_start, 2),
                        "end":     round(current_end, 2)
                    })
                current_speaker = speaker
                current_text    = [text]
                current_start   = start
                current_end     = end

        if current_speaker is not None:
            segments.append({
                "speaker": current_speaker,
                "text":    " ".join(current_text),
                "start":   round(current_start, 2),
                "end":     round(current_end, 2)
            })

        return {
            "meeting_id":     meeting_id,
            "created_at":     datetime.now().isoformat(),
            "total_duration": segments[-1]["end"] if segments else 0,
            "speaker_count":  len(set(s["speaker"] for s in segments)),
            "segments":       segments,
            "full_text":      "\n".join(
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

    def rename_speakers(self, transcript: dict, name_map: dict) -> dict:
        """
        Replace SPEAKER_00 / SPEAKER_01 etc. with real names.

        Usage:
            transcript = transcriber.rename_speakers(transcript, {
                "SPEAKER_00": "Angela",
                "SPEAKER_01": "Tarek",
            })
        """
        for seg in transcript["segments"]:
            seg["speaker"] = name_map.get(seg["speaker"], seg["speaker"])

        transcript["full_text"] = "\n".join(
            f"[{s['speaker']}]: {s['text']}"
            for s in transcript["segments"]
        )
        transcript["speaker_names"] = name_map
        return transcript
