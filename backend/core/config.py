from dotenv import load_dotenv
from pathlib import Path
import os

load_dotenv()

# Project root is the parent of the backend/ directory
# This ensures all data paths are absolute regardless of where uvicorn is launched from
_PROJECT_ROOT = Path(__file__).resolve().parents[2]
_DATA_DIR = _PROJECT_ROOT / "data"

class Config:
    # LLM
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    GROQ_AUDIO_MODEL = os.getenv("GROQ_AUDIO_MODEL", "whisper-large-v3")

    # Hugging Face
    HF_TOKEN = os.getenv("HF_TOKEN")

    # Whisper
    WHISPER_MODEL = os.getenv("WHISPER_MODEL", "large-v2")
    DEVICE = os.getenv("DEVICE", "cuda")  # your RTX 2050 will be used

    # Storage
    DATABASE_URL = os.getenv("DATABASE_URL")
    CHROMA_PATH = os.getenv("CHROMA_PATH", str(_DATA_DIR / "chroma_db"))

    # Audio — all absolute paths anchored to project root
    AUDIO_DIR      = str(_DATA_DIR / "audio")
    TRANSCRIPT_DIR = str(_DATA_DIR / "transcripts")
    EXTRACTION_DIR = str(_DATA_DIR / "extractions")
    HASH_REGISTRY  = str(_DATA_DIR / "audio_hashes.json")

    # Security
    SECRET_KEY = os.getenv("SECRET_KEY", "trace_super_secret_jwt_key_for_development")

config = Config()

