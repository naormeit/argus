"""
Credit and subscription helpers for Argus billing (Phase 4).
"""
import logging
from datetime import datetime, timezone

from database import get_pool

log = logging.getLogger(__name__)

CREDITS_PER_PACK = 10

# Statuses that keep a paid subscription usable until subscription_ends_at.
_ACTIVE_SUB_STATUSES = ("active", "on_trial", "cancelled")


def subscription_active(info: dict) -> bool:
    """True only while a Pro subscription is active (including a cancelled
    subscription that still has paid time left)."""
    if info.get("plan") != "pro":
        return False
    if info.get("subscription_status") not in _ACTIVE_SUB_STATUSES:
        return False
    ends_at = info.get("subscription_ends_at")
    if ends_at is not None and ends_at <= datetime.now(timezone.utc):
        return False
    return True


def _parse_ts(value) -> datetime | None:
    """Parse an ISO-8601 timestamp coming from a provider webhook."""
    if not value:
        return None
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    try:
        text = str(value).replace("Z", "+00:00")
        parsed = datetime.fromisoformat(text)
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
    except ValueError:
        log.warning("Could not parse subscription timestamp %r", value)
        return None


async def _ensure_row(conn, user_id: str) -> None:
    await conn.execute(
        "INSERT INTO user_credits (user_id, credits, plan) VALUES ($1, 3, 'free') ON CONFLICT DO NOTHING",
        user_id,
    )


async def get_credits(user_id: str) -> dict:
    pool = await get_pool()
    async with pool.acquire() as conn:
        await _ensure_row(conn, user_id)
        row = await conn.fetchrow(
            """
            SELECT credits, plan, stripe_customer_id, stripe_subscription_id,
                   subscription_status, subscription_ends_at
              FROM user_credits
             WHERE user_id = $1
            """,
            user_id,
        )
        return dict(row)


async def has_audit_access(user_id: str) -> bool:
    info = await get_credits(user_id)
    if subscription_active(info):
        return True
    return info["credits"] > 0


async def atomic_deduct_credit(user_id: str) -> bool:
    """Atomically check access and deduct one credit. Returns True if access granted.
    Pro subscribers always pass without deduction. Credit users require credits > 0
    and the deduction happens in the same SQL statement (eliminates TOCTOU race)."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        await _ensure_row(conn, user_id)
        row = await conn.fetchrow(
            """
            SELECT plan, subscription_status, subscription_ends_at
              FROM user_credits
             WHERE user_id = $1
            """,
            user_id,
        )
        if row and subscription_active(dict(row)):
            return True
        result = await conn.fetchrow(
            """
            UPDATE user_credits
               SET credits = credits - 1, updated_at = NOW()
             WHERE user_id = $1 AND credits > 0
            RETURNING credits
            """,
            user_id,
        )
        return result is not None


async def deduct_credit(user_id: str) -> None:
    pool = await get_pool()
    async with pool.acquire() as conn:
        await _ensure_row(conn, user_id)
        row = await conn.fetchrow(
            """
            SELECT plan, subscription_status, subscription_ends_at
              FROM user_credits
             WHERE user_id = $1
            """,
            user_id,
        )
        if row and subscription_active(dict(row)):
            return
        await conn.execute(
            "UPDATE user_credits SET credits = GREATEST(credits - 1, 0), updated_at = NOW() WHERE user_id = $1",
            user_id,
        )


async def refund_credit(user_id: str) -> None:
    """Return one credit after an audit fails before producing a report."""
    if not user_id:
        return
    pool = await get_pool()
    async with pool.acquire() as conn:
        await _ensure_row(conn, user_id)
        await conn.execute(
            "UPDATE user_credits SET credits = credits + 1, updated_at = NOW() WHERE user_id = $1",
            user_id,
        )
        log.info("Refunded 1 credit to user %s after a failed audit.", user_id)


async def add_credits(user_id: str, amount: int) -> None:
    if amount <= 0:
        return
    pool = await get_pool()
    async with pool.acquire() as conn:
        await _ensure_row(conn, user_id)
        await conn.execute(
            "UPDATE user_credits SET credits = credits + $1, updated_at = NOW() WHERE user_id = $2",
            amount, user_id,
        )


async def activate_subscription(
    user_id: str,
    sub_id: str,
    customer_id: str,
    ends_at=None,
    status: str = "active",
) -> None:
    pool = await get_pool()
    async with pool.acquire() as conn:
        await _ensure_row(conn, user_id)
        await conn.execute(
            """
            UPDATE user_credits
               SET plan = 'pro',
                   stripe_subscription_id = $1,
                   subscription_status = $2,
                   stripe_customer_id = $3,
                   subscription_ends_at = $4,
                   updated_at = NOW()
             WHERE user_id = $5
            """,
            sub_id, status, customer_id, _parse_ts(ends_at), user_id,
        )


async def set_subscription_cancelled(customer_id: str, ends_at=None) -> None:
    """Mark a subscription cancelled but keep Pro access until the paid period ends."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """
            UPDATE user_credits
               SET plan = 'pro',
                   subscription_status = 'cancelled',
                   subscription_ends_at = COALESCE($1, subscription_ends_at),
                   updated_at = NOW()
             WHERE stripe_customer_id = $2
            """,
            _parse_ts(ends_at), customer_id,
        )


# Backwards-compatible name used by older webhook code.
cancel_subscription_by_customer = set_subscription_cancelled


async def update_subscription_status(customer_id: str, status: str, ends_at=None) -> None:
    """Apply a provider status to the customer's row.

    'expired' / 'unpaid' downgrade to the free plan. Everything else keeps the
    plan intact; access is decided by subscription_active().
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        if status in ("expired", "unpaid"):
            await conn.execute(
                """
                UPDATE user_credits
                   SET plan = 'free',
                       subscription_status = $1,
                       subscription_ends_at = COALESCE($2, subscription_ends_at),
                       updated_at = NOW()
                 WHERE stripe_customer_id = $3
                """,
                status, _parse_ts(ends_at), customer_id,
            )
        else:
            await conn.execute(
                """
                UPDATE user_credits
                   SET subscription_status = $1,
                       subscription_ends_at = COALESCE($2, subscription_ends_at),
                       updated_at = NOW()
                 WHERE stripe_customer_id = $3
                """,
                status, _parse_ts(ends_at), customer_id,
            )
