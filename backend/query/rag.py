"""Retrieval-augmented generation over stored meetings."""


def query(question: str, meeting_id: str | None = None) -> str:
    """Answer a question using retrieved meeting context."""
    raise NotImplementedError
