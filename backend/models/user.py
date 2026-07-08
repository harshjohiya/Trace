from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from db.database import Base


class User(Base):
    __tablename__ = "users"

    # UUID primary key — stores Supabase Auth user IDs (e.g. "cab06b1c-2b79-...")
    # as_uuid=False keeps the value as a plain Python str, which matches the
    # `sub` claim we get directly from the JWT payload.
    id = Column(UUID(as_uuid=False), primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
