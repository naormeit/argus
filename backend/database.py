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


async def admin_stats() -> dict:
    pool = await get_pool()
    async with pool.acquire() as conn:
        total          = await conn.fetchval("SELECT COUNT(*) FROM audits")
        total_findings = await conn.fetchval("SELECT COALESCE(SUM(findings_count), 0) FROM audits")
        recent_7d      = await conn.fetchval("SELECT COUNT(*) FROM audits WHERE created_at >= NOW() - INTERVAL '7 days'")
        prev_7d        = await conn.fetchval("SELECT COUNT(*) FROM audits WHERE created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days'")
        users_count    = await conn.fetchval("SELECT COUNT(DISTINCT user_id) FROM audits WHERE user_id IS NOT NULL")
        by_risk        = await conn.fetch("SELECT overall_risk, COUNT(*) AS count FROM audits WHERE overall_risk IS NOT NULL GROUP BY overall_risk ORDER BY count DESC")
        by_language    = await conn.fetch("SELECT language, COUNT(*) AS count FROM audits GROUP BY language ORDER BY count DESC LIMIT 10")
        by_source_type = await conn.fetch("SELECT source_type, COUNT(*) AS count FROM audits GROUP BY source_type ORDER BY count DESC")
        daily          = await conn.fetch("""
            SELECT DATE(created_at) AS day, COUNT(*) AS count
            FROM audits
            WHERE created_at >= NOW() - INTERVAL '14 days'
            GROUP BY DATE(created_at)
            ORDER BY day
        """)
    return {
        "total_audits":    int(total),
        "total_findings":  int(total_findings),
        "recent_7d":       int(recent_7d),
        "prev_7d":         int(prev_7d),
        "users_count":     int(users_count),
        "by_risk":         [{"risk": r["overall_risk"], "count": int(r["count"])} for r in by_risk],
        "by_language":     [{"language": r["language"],  "count": int(r["count"])} for r in by_language],
        "by_source_type":  [{"type": r["source_type"],   "count": int(r["count"])} for r in by_source_type],
        "daily_audits":    [{"date": str(r["day"]),       "count": int(r["count"])} for r in daily],
    }


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
