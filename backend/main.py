"""
Argus FastAPI backend.
Endpoints:
  POST /audit              — start an audit, return audit_id + full report (sync)
  POST /audit/stream       — start an audit, stream SSE progress events
  GET  /audit/{id}/status  — poll status of any audit
"""
import asyncio
import json
import logging
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from models import AuditRequest, AuditStatus, AuditReport
from pipeline import ArgusPipeline

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(name)s  %(message)s")
log = logging.getLogger(__name__)

pipeline = ArgusPipeline()


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Argus backend starting up.")
    yield
    log.info("Argus backend shutting down.")


app = FastAPI(title="Argus — Multi-Agent Security Auditor", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "argus"}


@app.post("/audit", response_model=AuditReport)
async def run_audit(req: AuditRequest):
    """Synchronous audit — waits for full pipeline to complete."""
    audit_id = req.audit_id or str(uuid.uuid4())
    try:
        report = await pipeline.run(req.code, req.language, audit_id=audit_id)
        return report
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/audit/stream")
async def stream_audit(req: AuditRequest):
    """SSE endpoint — pushes progress events as the pipeline runs."""
    audit_id = req.audit_id or str(uuid.uuid4())
    queue: asyncio.Queue[AuditStatus | None] = asyncio.Queue()

    async def on_progress(status: AuditStatus):
        await queue.put(status)

    async def _run():
        try:
            await pipeline.run(req.code, req.language, audit_id=audit_id, on_progress=on_progress)
        except Exception:
            pass
        finally:
            await queue.put(None)  # sentinel

    asyncio.create_task(_run())

    async def event_stream():
        yield f"data: {json.dumps({'audit_id': audit_id, 'status': 'started'})}\n\n"
        while True:
            status = await queue.get()
            if status is None:
                yield "data: [DONE]\n\n"
                break
            payload = status.model_dump()
            # Include full report in the final event
            if status.report:
                payload["report"] = status.report.model_dump()
            yield f"data: {json.dumps(payload, default=str)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/audit/{audit_id}/status", response_model=AuditStatus)
async def get_audit_status(audit_id: str):
    status = pipeline.get_status(audit_id)
    if not status:
        raise HTTPException(status_code=404, detail=f"Audit {audit_id} not found")
    return status
