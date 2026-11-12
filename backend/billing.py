"""
Credit and subscription helpers for Argus billing (Phase 4).
"""
import logging
from database import get_pool

log = logging.getLogger(__name__)

CREDITS_PER_PACK = 10


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
            "SELECT credits, plan, stripe_customer_id, subscription_status FROM user_credits WHERE user_id = $1",
            user_id,
        )
        return dict(row)


async def has_audit_access(user_id: str) -> bool:
    info = await get_credits(user_id)
    if info["plan"] == "pro" and info.get("subscription_status") == "active":
        return True
    return info["credits"] > 0


async def deduct_credit(user_id: str) -> None:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT plan, subscription_status FROM user_credits WHERE user_id = $1", user_id
        )
        if row and row["plan"] == "pro" and row["subscription_status"] == "active":
            return
        await conn.execute(
            "UPDATE user_credits SET credits = GREATEST(credits - 1, 0), updated_at = NOW() WHERE user_id = $1",
            user_id,
        )


async def add_credits(user_id: str, amount: int) -> None:
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "UPDATE user_credits SET credits = credits + $1, updated_at = NOW() WHERE user_id = $2",
            amount, user_id,
        )


async def activate_subscription(user_id: str, sub_id: str, customer_id: str) -> None:
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """UPDATE user_credits
               SET plan = 'pro', stripe_subscription_id = $1,
                   subscription_status = 'active', stripe_customer_id = $2, updated_at = NOW()
               WHERE user_id = $3""",
            sub_id, customer_id, user_id,
        )


async def cancel_subscription_by_customer(customer_id: str) -> None:
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """UPDATE user_credits
               SET plan = 'free', subscription_status = 'canceled', updated_at = NOW()
               WHERE stripe_customer_id = $1""",
            customer_id,
        )


async def update_subscription_status(customer_id: str, status: str) -> None:
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "UPDATE user_credits SET subscription_status = $1, updated_at = NOW() WHERE stripe_customer_id = $2",
            status, customer_id,
        )
