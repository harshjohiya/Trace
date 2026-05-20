import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from core.config import config

from pathlib import Path

# Use DATABASE_URL from environment (PostgreSQL on Render/Supabase) if set,
# otherwise fall back to local SQLite for development
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Render/Supabase PostgreSQL — fix the postgres:// → postgresql:// scheme
    # that some providers still use
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_size=5)
else:
    # Local development — SQLite
    SQLALCHEMY_DATABASE_URL = "sqlite:///./data/trace.db"
    Path("./data").mkdir(parents=True, exist_ok=True)
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
