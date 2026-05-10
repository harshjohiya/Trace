from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    # LLM
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-70b-versatile")

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
