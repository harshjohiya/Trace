"""API entrypoint for meeting intelligence."""

from fastapi import FastAPI

from backend.config import PROJECT_ROOT

app = FastAPI(title="Meeting Intelligence")


@app.get("/health")
def health():
    return {"status": "ok", "project_root": str(PROJECT_ROOT)}
