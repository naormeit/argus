"""
Async PostgreSQL connection pool (Supabase / any Postgres).
"""
import asyncpg
import json
import logging
from config import DATABASE_URL

log = logging.getLogger(__name__)

_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            DATABASE_URL, min_size=1, max_size=5, ssl="require",
            command_timeout=10, statement_cache_size=0,
        )
        log.info("Database pool created.")
    return _pool


async def close_pool():
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


async def save_audit(report_dict: dict, source_code: str, language: str,
                     source_type: str = "paste", source_ref: str | None = None,
                     network: str | None = None,
                     user_id: str | None = None) -> None:
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO audits
              (id, language, source_code, source_type, source_ref, network,
               overall_risk, findings_count, summary, signature, report, user_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (id) DO NOTHING
            """,
            report_dict["audit_id"],
            language,
            source_code,
            source_type,
            source_ref,
            network,
            report_dict.get("overall_risk"),
            len(report_dict.get("findings", [])),
            report_dict.get("summary"),
            report_dict.get("signature"),
            json.dumps(report_dict),
            user_id,
        )


async def get_audit(audit_id: str) -> dict | None:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT report FROM audits WHERE id = $1", audit_id
        )
        if row:
            return json.loads(row["report"])
        return None


async def list_audits(limit: int = 20) -> list[dict]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, created_at, language, source_type, source_ref,
                   network, overall_risk, findings_count, summary
            FROM audits
            ORDER BY created_at DESC
            LIMIT $1
            """,
            limit,
        )
        return [dict(r) for r in rows]


async def list_audits_for_user(user_id: str, limit: int = 50) -> list[dict]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, created_at, language, source_type, source_ref,
                   network, overall_risk, findings_count, summary
            FROM audits
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2
            """,
            user_id, limit,
        )
        return [dict(r) for r in rows]
