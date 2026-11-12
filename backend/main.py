"""
Argus FastAPI backend.
  POST /audit/stream       — stream SSE progress events
  POST /audit/address      — fetch contract source from block explorer, then stream
  GET  /report/{id}        — fetch a stored audit report
  GET  /reports            — list recent audits
  GET  /health
"""
import asyncio
import json
import logging
import os
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from config import DATABASE_URL
from models import AuditRequest, AuditStatus, AuditReport, AuditListItem
from pipeline import ArgusPipeline
from etherscan import fetch_contract_source, ContractNotVerified, ExplorerError
from github_fetcher import fetch_github_source, GitHubFetchError

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(name)s  %(message)s")
log = logging.getLogger(__name__)

pipeline = ArgusPipeline()

# DB is optional — gracefully disabled if DATABASE_URL is not set
_db_enabled = bool(DATABASE_URL)
if _db_enabled:
    from database import get_pool, close_pool, save_audit, get_audit, list_audits


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Argus backend starting up.")
    if _db_enabled:
        try:
            await get_pool()
            log.info("Database connected.")
        except Exception as exc:
            log.warning("Database unavailable at startup (%s) — persistence disabled.", exc)
    else:
        log.warning("DATABASE_URL not set — audit persistence disabled.")
    yield
    if _db_enabled:
        await close_pool()
    log.info("Argus backend shutting down.")


app = FastAPI(title="Argus — Multi-Agent Security Auditor", version="0.2.0", lifespan=lifespan)

_extra_origins = os.getenv("CORS_ORIGINS", "").split(",")
_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://frontend-eight-theta-43.vercel.app",
] + [o for o in _extra_origins if o]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helpers ──────────────────────────────────────────────────────────────────

def _make_stream(req: AuditRequest):
    """Return an SSE StreamingResponse that runs the pipeline and persists the result."""
    audit_id = req.audit_id or str(uuid.uuid4())
    queue: asyncio.Queue[AuditStatus | None] = asyncio.Queue()

    async def on_progress(status: AuditStatus):
        await queue.put(status)

    async def _run():
        try:
            report = await pipeline.run(
                req.code, req.language, audit_id=audit_id, on_progress=on_progress
            )
            if _db_enabled:
                try:
                    await save_audit(
                        report.model_dump(),
                        req.code,
                        req.language,
                        source_type=req.source_type,
                        source_ref=req.source_ref,
                        network=req.network,
                    )
                except Exception as db_err:
                    log.warning(f"Failed to persist audit {audit_id}: {db_err}")
        except Exception:
            pass
        finally:
            await queue.put(None)

    asyncio.create_task(_run())

    async def event_stream():
        yield f"data: {json.dumps({'audit_id': audit_id, 'status': 'started'})}\n\n"
        while True:
            status = await queue.get()
            if status is None:
                yield "data: [DONE]\n\n"
                break
            payload = status.model_dump()
            if status.report:
                payload["report"] = status.report.model_dump()
            yield f"data: {json.dumps(payload, default=str)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "argus", "db": _db_enabled}


@app.post("/audit/stream")
async def stream_audit(req: AuditRequest):
    """Stream a code-paste audit via SSE."""
    return _make_stream(req)


@app.post("/audit/address")
async def audit_address(address: str, network: str = "ethereum"):
    """Fetch verified source from a block explorer, then stream the audit."""
    try:
        source, contract_name = await fetch_contract_source(address, network)
    except ContractNotVerified as e:
        raise HTTPException(status_code=422, detail=str(e))
    except ExplorerError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    req = AuditRequest(
        code=source,
        language="solidity",
        source_type="address",
        source_ref=address,
        network=network,
    )
    return _make_stream(req)


@app.post("/audit/github")
async def audit_github(url: str):
    """Fetch .sol source from a GitHub URL, then stream the audit."""
    try:
        source, label = await fetch_github_source(url)
    except GitHubFetchError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"GitHub fetch failed: {e}")

    req = AuditRequest(
        code=source,
        language="solidity",
        source_type="github",
        source_ref=url,
    )
    return _make_stream(req)


@app.get("/report/{audit_id}", response_model=AuditReport)
async def get_report(audit_id: str):
    """Fetch a stored audit report by ID."""
    if not _db_enabled:
        raise HTTPException(status_code=503, detail="Persistence not configured.")
    data = await get_audit(audit_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Report {audit_id} not found.")
    return data


@app.get("/reports", response_model=list[AuditListItem])
async def recent_reports(limit: int = 20):
    """List the most recent audits."""
    if not _db_enabled:
        return []
    rows = await list_audits(min(limit, 100))
    return [
        AuditListItem(
            id=str(r["id"]),
            created_at=r["created_at"].isoformat(),
            language=r["language"],
            source_type=r["source_type"],
            source_ref=r.get("source_ref"),
            network=r.get("network"),
            overall_risk=r.get("overall_risk"),
            findings_count=r.get("findings_count", 0),
            summary=r.get("summary"),
        )
        for r in rows
    ]
