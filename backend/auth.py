"""
Supabase JWT verification.
Tokens are HS256-signed with the project's JWT secret (Settings → API → JWT Settings).
"""
import logging
from typing import Optional

import jwt

from config import SUPABASE_JWT_SECRET

log = logging.getLogger(__name__)


def verify_supabase_token(token: str) -> Optional[str]:
    """Decode a Supabase access token and return the user_id (sub claim), or None."""
    if not SUPABASE_JWT_SECRET or not token:
        return None
    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        return payload.get("sub")
    except Exception as exc:
        log.debug("JWT verification failed: %s", exc)
        return None
