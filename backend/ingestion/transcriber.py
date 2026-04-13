"""Speech-to-text for meeting audio."""

from pathlib import Path


def transcribe(audio_path: Path) -> str:
    """Return transcript text for the given audio file."""
    raise NotImplementedError
