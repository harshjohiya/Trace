import base64
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt

from db.database import get_db
from models.user import User
from core.config import config

router = APIRouter()

# ── JWT Token Verification (Supabase) ─────────────────────────

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def _get_jwt_secret() -> bytes:
    """
    Supabase provides the JWT secret as a base64-encoded string in the dashboard.
    PyJWT needs the raw bytes, not the base64 string, for HS256 verification.
    Try base64-decoding first; if it fails, use the raw string as-is (for dev keys).
    """
    secret = config.SUPABASE_JWT_SECRET
    try:
        # Supabase secrets are base64url or standard base64
        # Pad if needed and decode to raw bytes
        padded = secret + "=" * (-len(secret) % 4)
        raw = base64.b64decode(padded)
        print(f"[AUTH] JWT secret: decoded from base64 ({len(raw)} bytes)")
        return raw
    except Exception:
        print(f"[AUTH] JWT secret: using as raw string")
        return secret.encode("utf-8")

_JWT_SECRET = _get_jwt_secret()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Inspect token header to see what algorithm Supabase is using
        unverified_header = jwt.get_unverified_header(token)
        token_alg = unverified_header.get("alg", "unknown")
        print(f"[AUTH] Token algorithm: {token_alg}")

        if token_alg in ["RS256", "ES256"]:
            # Fetch JWKS using the issuer URL from the token
            unverified_payload = jwt.decode(token, options={"verify_signature": False})
            iss = unverified_payload.get("iss")
            if not iss:
                raise Exception("Missing 'iss' in token payload for JWKS verification")
            
            jwks_url = f"{iss}/.well-known/jwks.json"
            jwks_client = jwt.PyJWKClient(jwks_url)
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=[token_alg],
                options={"verify_aud": True},
                audience="authenticated"
            )
        else:
            # Fallback to symmetric key for HS256 (legacy Supabase or local dev)
            payload = jwt.decode(
                token,
                _JWT_SECRET,
                algorithms=[token_alg],
                options={"verify_aud": True},
                audience="authenticated"
            )

        sub: str = payload.get("sub")
        email: str = payload.get("email")
        if sub is None or email is None:
            print(f"[AUTH] JWT decoded but missing 'sub' or 'email'. payload keys: {list(payload.keys())}")
            raise credentials_exception
        print(f"[AUTH] JWT verified OK for user: {email}")
    except jwt.ExpiredSignatureError:
        print("[AUTH] JWT expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        print(f"[AUTH] JWT invalid: {type(e).__name__}: {e}")
        raise credentials_exception

    # Auto-create or sync a local user record using the authenticated Supabase user ID and email
    user = db.query(User).filter(User.id == sub).first()
    if user is None:
        user_metadata = payload.get("user_metadata", {}) or {}
        full_name = user_metadata.get("full_name") or user_metadata.get("name")
        user = User(
            id=sub,
            email=email,
            full_name=full_name
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user
