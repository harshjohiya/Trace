"""Load and preprocess meeting audio."""

from pathlib import Path


def load_audio(path: Path | str) -> Path:
    """Resolve and validate an audio file path."""
    p = Path(path).resolve()
    if not p.is_file():
        raise FileNotFoundError(p)
    return p
