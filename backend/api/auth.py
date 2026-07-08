from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt
from jwt import PyJWKClient

from db.database import get_db
from models.user import User
from core.config import config

router = APIRouter()

# ── JWKS-based JWT Verification (Supabase ES256) ──────────────────────────────
#
# Supabase now signs user session JWTs with an asymmetric ES256 key pair.
# Verification must be done against the public key from the JWKS endpoint —
# the legacy SUPABASE_JWT_SECRET (HS256 shared secret) will NOT work here.
#
# The PyJWKClient is instantiated once at module load and cached for the
# lifetime of the process; it handles key fetching, caching, and rotation
# internally, so no per-request network round-trips occur.

SUPABASE_JWKS_URL = (
    f"{config.SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json"
)

# cache_keys=True (default) – keys are cached and only re-fetched on a kid miss
_jwks_client = PyJWKClient(SUPABASE_JWKS_URL, cache_keys=True)

print(f"[AUTH] JWKS client initialised -> {SUPABASE_JWKS_URL}")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency that validates a Supabase-issued JWT and returns the
    corresponding local User record, creating it automatically on first login.

    Raises HTTP 401 with the real PyJWT error message so future debugging is
    straightforward — no more opaque "Could not validate credentials" messages.
    """
    # ── 1. Resolve the signing key from the project's JWKS ──────────────────
    try:
        signing_key = _jwks_client.get_signing_key_from_jwt(token)
    except Exception as e:
        print(f"[AUTH] JWKS key lookup failed: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token signing key lookup failed: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ── 2. Decode & verify the JWT ───────────────────────────────────────────
    try:
        alg = jwt.get_unverified_header(token).get("alg", "ES256")
        print(f"[AUTH] Token algorithm: {alg}")

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256"],   # accept either asymmetric alg
            audience="authenticated",
        )
    except jwt.ExpiredSignatureError:
        print("[AUTH] JWT expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError as e:
        print(f"[AUTH] JWT invalid: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ── 3. Extract required claims ───────────────────────────────────────────
    sub: str | None = payload.get("sub")
    email: str | None = payload.get("email")
    if not sub or not email:
        print(
            f"[AUTH] JWT missing 'sub' or 'email'. "
            f"Present keys: {list(payload.keys())}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is missing required claims (sub, email)",
            headers={"WWW-Authenticate": "Bearer"},
        )

    print(f"[AUTH] JWT verified OK for user: {email}")

    # ── 4. Auto-create / sync local user record ──────────────────────────────
    user = db.query(User).filter(User.id == sub).first()
    if user is None:
        user_metadata = payload.get("user_metadata", {}) or {}
        full_name = user_metadata.get("full_name") or user_metadata.get("name")
        user = User(id=sub, email=email, full_name=full_name)
        db.add(user)
        db.commit()
        db.refresh(user)

    return user
