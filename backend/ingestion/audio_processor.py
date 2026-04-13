import os
import subprocess
import uuid
from pathlib import Path
from tqdm import tqdm
import sys
sys.path.append(str(Path(__file__).parent.parent.parent))
from backend.config import config

class AudioProcessor:
    def __init__(self):
        self.audio_dir = Path(config.AUDIO_DIR)
        self.audio_dir.mkdir(parents=True, exist_ok=True)

    def convert_to_wav(self, input_path: str) -> str:
        """
        Convert any audio/video file to 16kHz mono WAV.
        WhisperX requires this exact format.
        """
        input_path = Path(input_path)
        
        if not input_path.exists():
            raise FileNotFoundError(f"File not found: {input_path}")

        # Generate unique output filename
        output_filename = f"{uuid.uuid4().hex}_{input_path.stem}.wav"
        output_path = self.audio_dir / output_filename

        print(f"[AudioProcessor] Converting: {input_path.name} → {output_filename}")

        # ffmpeg command: convert to 16kHz mono WAV (required by Whisper)
        command = [
            "ffmpeg",
            "-i", str(input_path),    # input file
            "-ar", "16000",           # sample rate: 16kHz
            "-ac", "1",               # mono channel
            "-c:a", "pcm_s16le",      # 16-bit PCM WAV
            "-y",                     # overwrite if exists
            str(output_path)
        ]

        result = subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )

        if result.returncode != 0:
            raise RuntimeError(
                f"ffmpeg conversion failed:\n{result.stderr.decode()}"
            )

        file_size_mb = output_path.stat().st_size / (1024 * 1024)
        print(f"[AudioProcessor] Done. Output: {output_path} ({file_size_mb:.1f} MB)")

        return str(output_path)

    def validate_audio(self, file_path: str) -> dict:
        """
        Check audio file duration and size before processing.
        Helps catch corrupt files early.
        """
        command = [
            "ffprobe",
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            file_path
        ]

        result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        if result.returncode != 0:
            error_output = result.stderr.decode(errors="ignore").strip() or "Unknown ffprobe error"
            raise RuntimeError(f"Could not read audio file metadata for '{file_path}': {error_output}")

        import json
        info = json.loads(result.stdout)
        fmt = info.get("format", {})

        duration_sec = float(fmt.get("duration", 0))
        size_mb = int(fmt.get("size", 0)) / (1024 * 1024)

        return {
            "duration_minutes": round(duration_sec / 60, 2),
            "size_mb": round(size_mb, 2),
            "format": fmt.get("format_name", "unknown")
        }