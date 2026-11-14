# Argus — Multi-Agent Smart Contract Security Auditor

> Scout → Hunter → Forge → Arbiter  
> Powered by Groq (qwen/qwen3.8-27b + openai/gpt-oss-120b)  
> Every agent handoff is HMAC-SHA256 signed via Loom-Protocol

**Live app**: https://frontend-eight-theta-43.vercel.app  
**Demo video**: https://youtu.be/tLYTZPm3D3g

---

## What it does

Paste any Solidity smart contract (or connect a GitHub repo) and Argus runs a 4-agent security pipeline in real time, producing a cryptographically signed audit report with tamper-evident chain of custody across every agent handoff.

| Agent | Task |
|---|---|
| **Scout** | Attack surface mapping — entry points, external calls, suspicious patterns |
| **Hunter** | Exploit path reasoning — full step-by-step attack chains per vulnerability |
| **Forge** | PoC exploit generation — runnable Solidity / Python attack contracts |
| **Arbiter** | Final synthesis — deduplication, severity scoring, remediation, HMAC-signed report |

Each handoff is cryptographically signed (HMAC-SHA256) via the Loom-Protocol. The final report carries a verifiable signature.

---

## Features

- **Supabase Auth** — email/password sign-up, JWT ES256 via JWKS, 3 free audits on registration
- **Credits system** — buy 10 audit credits ($9.99) or subscribe Pro ($29/month) via Lemon Squeezy
- **GitHub App integration** — install on any repo, trigger audits on push via webhook
- **Audit history dashboard** — full history with status, timestamps, shareable report links
- **Admin dashboard** — platform stats, all audits across users (gated by ADMIN_EMAIL)
- **Shareable reports** — public report links at `/report/<audit_id>` require no login to view
- **Real-time SSE streaming** — live agent progress in the UI as each agent completes
- **Loom-Protocol** — every inter-agent payload is HMAC-SHA256 signed and verified

---

## Architecture

```
Frontend (React 18 + Vite + TailwindCSS)  — Vercel
    ↓  /api/* proxy  →  FastAPI backend  — Render
         ↓  Supabase Auth (ES256 JWT / JWKS)
         ↓  PostgreSQL (Supabase)
         ↓  Lemon Squeezy (payments / webhooks)
         ↓  GitHub App (repo audits on push)
    ArgusPipeline  backend/pipeline.py
         ↓  HMAC-signed handoffs  (Loom-Protocol)
    Scout → Hunter → Forge → Arbiter
         backend/agents/{scout,hunter,forge,arbiter}.py
         ↓  Groq API  (openai-compatible)
              Scout / Forge  →  qwen/qwen3.8-27b   (fast)
              Hunter / Arbiter  →  openai/gpt-oss-120b  (smart)
```

**Frontend**: React 18, Vite, TailwindCSS, React Router, Syne / DM Sans / JetBrains Mono  
**Backend**: FastAPI, Server-Sent Events, HTTPX, asyncpg, python-jose, python-dotenv  
**Auth**: Supabase (email/password + magic link), JWT ES256, JWKS endpoint  
**Database**: PostgreSQL via Supabase (users, audits, credits, subscriptions)  
**Payments**: Lemon Squeezy (merchant of record — works for India-based sellers)  
**AI**: Groq free tier (max_tokens=900 per agent to stay within OTPM limits)

---

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Supabase project
- Groq API key (free tier works)
- Lemon Squeezy account (for payments)
- GitHub App (for repo audit integration, optional)

### 1. Clone & configure environment

```bash
git clone https://github.com/<your-org>/argus.git
cd argus
cp .env.example .env
```

Edit `.env` with your values:

```bash
# AI
GROQ_API_KEY=gsk_...
GROQ_FAST_MODEL=qwen/qwen3.8-27b          # optional override
GROQ_SMART_MODEL=openai/gpt-oss-120b      # optional override

# Security
LOOM_SECRET=<random 32+ char secret>

# Database
DATABASE_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres

# Supabase Auth
SUPABASE_JWT_SECRET=<your Supabase JWT secret>
SUPABASE_PROJECT_REF=<your project ref>

# Lemon Squeezy
LS_API_KEY=<your LS API key>
LS_WEBHOOK_SECRET=<your LS webhook secret>
LS_STORE_ID=<your store id>
LS_CREDITS_VARIANT_ID=<variant id for $9.99 / 10 audits>
LS_PRO_VARIANT_ID=<variant id for $29/month>

# GitHub App (optional)
GITHUB_APP_ID=<app id>
GITHUB_PRIVATE_KEY=<RSA private key, newlines as \n>
GITHUB_WEBHOOK_SECRET=<webhook secret>
GITHUB_APP_NAME=argus-auditor             # your app's slug

# App
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=<your email, grants /admin/* access>

# Blockchain (optional, for contract address lookup)
ETHERSCAN_API_KEY=<your key>
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

The frontend proxies `/api/*` to `http://localhost:8000` via Vite config.

---

## API Reference

### Auth (all protected routes require `Authorization: Bearer <supabase_jwt>`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Health check |
| GET | `/me` | ✓ | Current user info + credit balance |
| GET | `/audits/me` | ✓ | Audit history for current user |
| GET | `/reports` | ✓ | All reports for current user |
| GET | `/report/{audit_id}` | — | Public shareable report |
| GET | `/admin/stats` | ✓ admin | Platform stats |
| GET | `/admin/audits` | ✓ admin | All audits across users |
| GET | `/github/install-url` | ✓ | GitHub App install URL |
| POST | `/audit/stream` | ✓ | SSE audit stream (paste code) |
| POST | `/audit/address` | ✓ | Audit by contract address (Etherscan) |
| POST | `/audit/github` | ✓ | Trigger audit on GitHub repo |
| POST | `/checkout/credits` | ✓ | Create Lemon Squeezy credits checkout |
| POST | `/checkout/subscribe` | ✓ | Create Lemon Squeezy Pro subscription checkout |
| POST | `/webhooks/lemonsqueezy` | — | Lemon Squeezy payment webhook |
| POST | `/webhooks/github` | — | GitHub App event webhook |

### SSE event types (`POST /audit/stream`)

| Event | Payload |
|---|---|
| `agent_start` | `{ agent, status }` |
| `agent_complete` | `{ agent, findings, loom_signature }` |
| `audit_complete` | Full signed report |
| `error` | `{ message }` |

### Request body (`/audit/stream`)

```json
{
  "code": "pragma solidity ^0.8.0; ...",
  "language": "solidity"
}
```

---

## Loom-Protocol (chain of custody)

Every agent calls `ledger.sign_handoff(from_agent, to_agent, payload)` before passing data downstream.  
The receiving agent calls `ledger.verify_handoff(envelope)` — rejecting anything tampered with.  
The Arbiter calls `ledger.sign_report(report_data)` for the final HMAC shown in the UI and stored with the report.

Signing key is set via `LOOM_SECRET` in `.env` and never leaves the backend.

---

## Pricing

| Plan | Price | Credits |
|---|---|---|
| Free | $0 | 3 audits on sign-up |
| Credits | $9.99 | 10 audit credits (never expire) |
| Pro | $29/month | Unlimited audits |

Payments are handled by [Lemon Squeezy](https://lemonsqueezy.com) (merchant of record — handles VAT/GST globally).

---

## Deployment

### Backend — Render

The backend is deployed as a web service on [Render](https://render.com) (free tier).

> **Note**: Render free tier spins down after 15 minutes of inactivity. The first request after a cold start takes ~30 seconds.

Required env vars on Render (all variables from `.env` above, with production values).

A `Dockerfile` and `deploy.sh` are included in the repo root for Cloud Run deployment as an alternative.

### Frontend — Vercel

The frontend is deployed on [Vercel](https://vercel.com). Set the following in Vercel project settings:

```
VITE_API_URL=https://argus-backend-1ge3.onrender.com
```

The `frontend/vercel.json` rewrites `/api/*` → backend URL.

---

## Project structure

```
argus/
├── backend/
│   ├── main.py              # FastAPI app, all routes
│   ├── pipeline.py          # ArgusPipeline orchestrator
│   ├── signing.py           # Loom-Protocol (HMAC-SHA256)
│   ├── config.py            # Env var config
│   ├── auth.py              # Supabase JWT verification
│   ├── db.py                # PostgreSQL helpers (asyncpg)
│   └── agents/
│       ├── scout.py
│       ├── hunter.py
│       ├── forge.py
│       └── arbiter.py
├── frontend/
│   ├── src/
│   │   ├── pages/           # Audit, Pricing, Dashboard, Report, Admin, Login…
│   │   ├── context/         # AuthContext (Supabase client)
│   │   └── components/
│   ├── vercel.json          # API proxy rewrite rules
│   └── vite.config.ts
├── Dockerfile               # Cloud Run deployment
├── deploy.sh                # Cloud Run deploy script
└── .env.example
```

---

## Status

- [x] 4-agent pipeline (Scout → Hunter → Forge → Arbiter)
- [x] HMAC-SHA256 signed agent handoffs (Loom-Protocol)
- [x] FastAPI backend with real-time SSE streaming
- [x] React frontend with live agent timeline, animated terminal, 3D card UI
- [x] Supabase Auth (email/password, JWT ES256 via JWKS)
- [x] Credits system (3 free on sign-up, buy more via Lemon Squeezy)
- [x] Lemon Squeezy payment integration (credits + Pro subscription)
- [x] GitHub App integration (audit on push, install flow)
- [x] Audit history dashboard with shareable report links
- [x] Admin dashboard (platform stats, all audits)
- [x] Deployed: Vercel (frontend) + Render (backend)
- [ ] Lemon Squeezy seller account activation (payout setup required for live payments)
