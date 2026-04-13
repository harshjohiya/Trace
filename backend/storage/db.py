"""Database access."""

from pathlib import Path


def get_db_path() -> Path:
    """Return path to the primary SQLite (or other) database file."""
    raise NotImplementedError
