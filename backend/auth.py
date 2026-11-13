"""
Supabase JWT verification.

Supabase migrated from HS256 (Shared Secret) to ECC P-256 signing in Nov 2026.
This module handles both:
  - New tokens: verified via JWKS endpoint (ES256 / RS256)
  - Old tokens still in circulation: verified with the legacy HS256 shared secret
"""
import logging
from typing import Optional

import jwt
from jwt import PyJWKClient

from config import SUPABASE_JWT_SECRET, SUPABASE_PROJECT_REF

log = logging.getLogger(__name__)

_jwks_client: PyJWKClient | None = None


def _get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        jwks_url = f"https://{SUPABASE_PROJECT_REF}.supabase.co/auth/v1/.well-known/jwks.json"
        _jwks_client = PyJWKClient(jwks_url, cache_jwk_set=True, lifespan=3600)
    return _jwks_client


def _decode(token: str) -> dict | None:
    """Try JWKS (ECC/RSA) first, fall back to legacy HS256 shared secret."""
    # --- JWKS path (current Supabase default: ECC P-256 / ES256) ---
    try:
        client = _get_jwks_client()
        signing_key = client.get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            options={"verify_aud": False},
        )
    except Exception as e:
        log.debug("JWKS verification failed: %s", e)

    # --- Legacy HS256 shared secret ---
    if SUPABASE_JWT_SECRET:
        try:
            return jwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
        except Exception as exc:
            log.debug("HS256 verification failed: %s", exc)

    return None


def verify_supabase_token(token: str) -> Optional[str]:
    """Return the user_id (sub claim) from a valid Supabase access token, or None."""
    if not token:
        return None
    payload = _decode(token)
    return payload.get("sub") if payload else None


def get_user_claims(token: str) -> Optional[dict]:
    """Return {sub, email} from a valid Supabase access token, or None."""
    if not token:
        return None
    payload = _decode(token)
    if not payload:
        return None
    return {"sub": payload.get("sub"), "email": payload.get("email", "")}
