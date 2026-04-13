from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    # LLM
    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1:8b")

    # Hugging Face
    HF_TOKEN = os.getenv("HF_TOKEN")

    # Whisper
    WHISPER_MODEL = os.getenv("WHISPER_MODEL", "large-v2")
    DEVICE = os.getenv("DEVICE", "cuda")  # your RTX 2050 will be used

    # Storage
    DATABASE_URL = os.getenv("DATABASE_URL")
    CHROMA_PATH = os.getenv("CHROMA_PATH", "./data/chroma_db")

    # Audio
    AUDIO_DIR = "./data/audio"
    TRANSCRIPT_DIR = "./data/transcripts"

config = Config()