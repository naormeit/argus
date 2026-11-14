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

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

import stripe

from config import (
    DATABASE_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
    STRIPE_CREDIT_PRICE_ID, STRIPE_PRO_PRICE_ID, FRONTEND_URL,
    GITHUB_APP_ID, GITHUB_WEBHOOK_SECRET, GITHUB_APP_NAME, LOOM_SECRET,
)
from models import AuditRequest, AuditStatus, AuditReport, AuditListItem
from pipeline import ArgusPipeline
from etherscan import fetch_contract_source, ContractNotVerified, ExplorerError
from github_fetcher import fetch_github_source, GitHubFetchError
from auth import verify_supabase_token, get_user_claims
from config import ADMIN_EMAIL

stripe.api_key = STRIPE_SECRET_KEY

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(name)s  %(message)s")
log = logging.getLogger(__name__)

# Fail fast on missing critical secrets
if not LOOM_SECRET:
    raise RuntimeError("LOOM_SECRET env var is required but not set.")

# Rate limiter — in-memory per IP (replace storage with Redis for multi-instance)
limiter = Limiter(key_func=get_remote_address, default_limits=["200/hour"])

# Semaphore: cap concurrent audits to prevent memory/CPU exhaustion
_MAX_CONCURRENT_AUDITS = int(os.getenv("MAX_CONCURRENT_AUDITS", "10"))
_audit_semaphore = asyncio.Semaphore(_MAX_CONCURRENT_AUDITS)

pipeline = ArgusPipeline()

# DB is optional — gracefully disabled if DATABASE_URL is not set
_db_enabled = bool(DATABASE_URL)
if _db_enabled:
    from database import get_pool, close_pool, save_audit, get_audit, list_audits, list_audits_for_user, admin_stats
    from billing import (
        get_credits, has_audit_access, deduct_credit, add_credits,
        activate_subscription, cancel_subscription_by_customer, update_subscription_status,
        CREDITS_PER_PACK,
    )


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
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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


# ── Auth dependency ──────────────────────────────────────────────────────────

def _get_user_id(request: Request) -> str | None:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    return verify_supabase_token(auth[7:])


# ── Helpers ──────────────────────────────────────────────────────────────────

def _make_stream(req: AuditRequest, user_id: str | None = None):
    """Return an SSE StreamingResponse that runs the pipeline and persists the result."""
    audit_id = req.audit_id or str(uuid.uuid4())
    queue: asyncio.Queue[AuditStatus | None] = asyncio.Queue()

    async def on_progress(status: AuditStatus):
        await queue.put(status)

    async def _run():
        async with _audit_semaphore:
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
                            user_id=user_id,
                        )
                        if user_id:
                            await deduct_credit(user_id)
                    except Exception as db_err:
                        log.warning(f"Failed to persist audit {audit_id}: {db_err}")
            except Exception as exc:
                log.error("Pipeline failed for audit %s: %s", audit_id, exc)
                await queue.put(AuditStatus(audit_id=audit_id, status='error', message=str(exc)))
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


async def _require_credits(request: Request) -> str | None:
    """Soft auth: returns user_id if a valid JWT is present, None for anonymous.
    Blocks only when a logged-in user has no credits left."""
    user_id = _get_user_id(request)
    if user_id and _db_enabled and not await has_audit_access(user_id):
        raise HTTPException(status_code=402, detail="No credits remaining. Please top up.")
    return user_id


@app.post("/audit/stream")
@limiter.limit("5/minute;20/hour")
async def stream_audit(req: AuditRequest, request: Request):
    """Stream a code-paste audit via SSE."""
    user_id = await _require_credits(request)
    return _make_stream(req, user_id=user_id)


@app.post("/audit/address")
@limiter.limit("5/minute;20/hour")
async def audit_address(address: str, network: str = "ethereum", request: Request = None):
    """Fetch verified source from a block explorer, then stream the audit."""
    user_id = await _require_credits(request)
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
    return _make_stream(req, user_id=user_id)


@app.post("/audit/github")
@limiter.limit("5/minute;20/hour")
async def audit_github(url: str, request: Request = None):
    """Fetch .sol source from a GitHub URL, then stream the audit."""
    user_id = await _require_credits(request)
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
    return _make_stream(req, user_id=user_id)


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



@app.get("/audits/me", response_model=list[AuditListItem])
async def my_audits(limit: int = 50, request: Request = None):
    """List the authenticated user's own audits."""
    user_id = _get_user_id(request) if request else None
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required.")
    if not _db_enabled:
        return []
    rows = await list_audits_for_user(user_id, min(limit, 100))
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


# ── Admin ─────────────────────────────────────────────────────────────────────

def _require_admin(request: Request) -> str:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=403, detail="Admin access required.")
    claims = get_user_claims(auth[7:])
    if not claims:
        raise HTTPException(status_code=403, detail="Admin access required.")
    if not ADMIN_EMAIL or claims.get("email") != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Admin access required.")
    return claims["sub"]


@app.get("/admin/stats")
async def get_admin_stats(request: Request):
    _require_admin(request)
    if not _db_enabled:
        raise HTTPException(status_code=503, detail="Persistence not configured.")
    return await admin_stats()


@app.get("/admin/audits")
async def get_admin_audits(limit: int = 50, request: Request = None):
    _require_admin(request)
    if not _db_enabled:
        return []
    rows = await list_audits(min(limit, 200))
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


# ── Billing ───────────────────────────────────────────────────────────────────

@app.get("/me")
async def me(request: Request):
    """Return the current user's credit balance and plan."""
    user_id = _get_user_id(request)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required.")
    if not _db_enabled:
        return {"credits": 0, "plan": "free", "subscription_status": None}
    info = await get_credits(user_id)
    return {
        "credits": info["credits"],
        "plan": info["plan"],
        "subscription_status": info.get("subscription_status"),
    }


@app.post("/checkout/credits")
async def checkout_credits(request: Request):
    """Create a Stripe Checkout session for the 10-audit credit pack ($9.99)."""
    user_id = _get_user_id(request)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required.")
    if not STRIPE_SECRET_KEY or not STRIPE_CREDIT_PRICE_ID:
        raise HTTPException(status_code=503, detail="Billing not configured.")
    body = await request.json()
    email = body.get("email", "")
    session = stripe.checkout.Session.create(
        mode="payment",
        line_items=[{"price": STRIPE_CREDIT_PRICE_ID, "quantity": 1}],
        client_reference_id=user_id,
        customer_email=email or None,
        success_url=f"{FRONTEND_URL}/success?type=credits&session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{FRONTEND_URL}/pricing",
    )
    return {"url": session.url}


@app.post("/checkout/subscribe")
async def checkout_subscribe(request: Request):
    """Create a Stripe Checkout session for the Pro subscription ($29/month)."""
    user_id = _get_user_id(request)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required.")
    if not STRIPE_SECRET_KEY or not STRIPE_PRO_PRICE_ID:
        raise HTTPException(status_code=503, detail="Billing not configured.")
    body = await request.json()
    email = body.get("email", "")
    session = stripe.checkout.Session.create(
        mode="subscription",
        line_items=[{"price": STRIPE_PRO_PRICE_ID, "quantity": 1}],
        client_reference_id=user_id,
        customer_email=email or None,
        success_url=f"{FRONTEND_URL}/success?type=pro&session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{FRONTEND_URL}/pricing",
    )
    return {"url": session.url}


@app.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events."""
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="Webhook secret not configured.")
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid Stripe signature.")

    if not _db_enabled:
        return {"received": True}

    etype = event["type"]
    data = event["data"]["object"]

    if etype == "checkout.session.completed":
        user_id = data.get("client_reference_id")
        customer_id = data.get("customer")
        if not user_id:
            return {"received": True}
        if data.get("mode") == "payment":
            await add_credits(user_id, CREDITS_PER_PACK)
            log.info("Added %d credits to user %s", CREDITS_PER_PACK, user_id)
        elif data.get("mode") == "subscription":
            sub_id = data.get("subscription")
            await activate_subscription(user_id, sub_id, customer_id)
            log.info("Activated Pro subscription for user %s", user_id)

    elif etype in ("customer.subscription.deleted",):
        customer_id = data.get("customer")
        await cancel_subscription_by_customer(customer_id)
        log.info("Cancelled subscription for customer %s", customer_id)

    elif etype in ("customer.subscription.updated",):
        customer_id = data.get("customer")
        status = data.get("status", "canceled")
        await update_subscription_status(customer_id, status)

    return {"received": True}


# ── GitHub App webhook ────────────────────────────────────────────────────────

def _format_pr_comment(filename: str, report) -> str:
    _emoji = {"critical": "🔴", "high": "🟠", "medium": "🟡", "low": "🔵", "info": "⚪"}
    risk = report.overall_risk.value
    lines = [f"### {_emoji.get(risk, '⚪')} `{filename}` — **{risk.upper()} RISK**"]
    if report.findings:
        lines.append(f"\n**{len(report.findings)} finding(s) detected:**\n")
        for f in report.findings[:10]:
            sev = f.severity.value
            lines.append(f"- {_emoji.get(sev, '⚪')} **{f.vulnerability}** `{sev}`  ")
            lines.append(f"  {f.description[:180]}")
    else:
        lines.append("\n✅ No issues detected.")
    return "\n".join(lines)


async def _handle_pr_scan(
    installation_id: int, owner: str, repo: str, pr_number: int
) -> None:
    from github_app import get_installation_token, get_pr_sol_files, fetch_raw_file, post_pr_comment
    try:
        token = await get_installation_token(installation_id)
        sol_files = await get_pr_sol_files(token, owner, repo, pr_number)
        if not sol_files:
            return
        comments: list[str] = []
        source_ref = f"https://github.com/{owner}/{repo}/pull/{pr_number}"
        for f in sol_files[:5]:
            try:
                source = await fetch_raw_file(token, f["raw_url"])
                audit_id = str(uuid.uuid4())
                report = await pipeline.run(source, "solidity", audit_id=audit_id)
                comments.append(_format_pr_comment(f["filename"], report))
                if _db_enabled:
                    try:
                        await save_audit(
                            report.model_dump(),
                            source,
                            "solidity",
                            source_type="github_pr",
                            source_ref=source_ref,
                        )
                    except Exception as db_exc:
                        log.warning("[GH] DB save failed for %s: %s", f["filename"], db_exc)
            except Exception as exc:
                log.warning("[GH] scan failed for %s: %s", f["filename"], exc)
        if comments:
            body = (
                "## 🔍 Argus Security Scan\n\n"
                + "\n\n---\n\n".join(comments)
                + f"\n\n*Powered by [Argus]({FRONTEND_URL}) — Multi-Agent Smart Contract Auditor*"
            )
            await post_pr_comment(token, owner, repo, pr_number, body)
    except Exception as exc:
        log.error("[GH] PR scan failed for %s/%s#%d: %s", owner, repo, pr_number, exc)


@app.post("/webhooks/github")
async def github_webhook(request: Request):
    """Receive GitHub App pull_request events and trigger an audit."""
    if not GITHUB_APP_ID or not GITHUB_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="GitHub App not configured.")
    payload = await request.body()
    sig = request.headers.get("X-Hub-Signature-256", "")
    event = request.headers.get("X-GitHub-Event", "")

    from github_app import verify_webhook_signature
    if not verify_webhook_signature(payload, sig):
        raise HTTPException(status_code=400, detail="Invalid GitHub signature.")

    if event != "pull_request":
        return {"received": True}

    data = json.loads(payload)
    if data.get("action") not in ("opened", "synchronize", "reopened"):
        return {"received": True}

    installation_id: int = data["installation"]["id"]
    owner: str = data["repository"]["owner"]["login"]
    repo: str = data["repository"]["name"]
    pr_number: int = data["pull_request"]["number"]

    asyncio.create_task(_handle_pr_scan(installation_id, owner, repo, pr_number))
    return {"received": True}


@app.get("/github/install-url")
async def github_install_url():
    """Return the GitHub App installation URL."""
    if not GITHUB_APP_NAME:
        raise HTTPException(status_code=503, detail="GitHub App not configured.")
    return {"url": f"https://github.com/apps/{GITHUB_APP_NAME}/installations/new"}
