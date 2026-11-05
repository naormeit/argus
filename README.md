# Argus — Multi-Agent Smart Contract Security Auditor

> **Meta AI Global Hackathon 2026** — Indie Developer Track  
> Scout → Hunter → Forge → Arbiter, powered by Meta's Llama models via Groq  
> Every agent handoff is HMAC-SHA256 signed via Loom-Protocol

**Live demo**: https://frontend-eight-theta-43.vercel.app  
**Demo video**: https://youtu.be/tLYTZPm3D3g

---

## What it does

Paste any smart contract (Solidity) and Argus runs a 4-agent security pipeline in under 90 seconds, producing a cryptographically signed audit report with tamper-evident chain of custody across every agent handoff.

| Agent | Task |
|---|---|
| **Scout** | Attack surface mapping — entry points, external calls, suspicious patterns |
| **Hunter** | Exploit path reasoning — full step-by-step attack chains per vulnerability |
| **Forge** | PoC exploit generation — runnable Solidity / Python attack contracts |
| **Arbiter** | Final synthesis — deduplication, severity scoring, remediation, HMAC-signed report |

Each handoff between agents is cryptographically signed (HMAC-SHA256) via the Loom-Protocol.  
The final report carries a signature the user can verify independently.

---

## Architecture

```
Frontend (React + Vite + TailwindCSS)
    ↓ POST /api/audit/stream  (SSE)
FastAPI  backend/main.py
    ↓
ArgusPipeline  backend/pipeline.py
    ↓  HMAC-signed handoffs  (backend/signing.py — Loom-Protocol)
Scout → Hunter → Forge → Arbiter
    backend/agents/{scout,hunter,forge,arbiter}.py
    ↓  Llama 3 via Groq (openai-compatible client)
api.groq.com
```

**Frontend stack**: React 18, Vite, TailwindCSS, React Router, Syne / DM Sans / JetBrains Mono fonts  
**Backend stack**: FastAPI, Server-Sent Events, HTTPX, python-dotenv  
**Models**: Meta Llama 3.3 70B (via Groq API — openai-compatible endpoint)

---

## Setup

### 1. Environment

```bash
cp .env.example .env
# Set in .env:
#   GROQ_API_KEY=<your Groq key>
#   LOOM_SECRET=<any secret string for HMAC signing>
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

## API

| Method | Path | Description |
|---|---|---|
| POST | `/audit/stream` | SSE stream — real-time agent progress + final report |
| GET | `/health` | Health check |

### Request body (`/audit/stream`)

```json
{
  "code": "pragma solidity ^0.8.0; ...",
  "language": "solidity"
}
```

### SSE event types

| Event | Payload |
|---|---|
| `agent_start` | `{ agent, status }` |
| `agent_complete` | `{ agent, findings, loom_signature }` |
| `audit_complete` | Full signed report |
| `error` | `{ message }` |

---

## Loom-Protocol (chain of custody)

Every agent calls `ledger.sign_handoff(from_agent, to_agent, payload)` before passing data downstream.  
The receiving agent calls `ledger.verify_handoff(envelope)` — rejecting anything tampered with.  
The Arbiter calls `ledger.sign_report(report_data)` to produce a final HMAC displayed in the UI.

The signing key is set via `LOOM_SECRET` in `.env` and never leaves the backend.

---

## Deliverables

- [x] 4-agent pipeline (Scout, Hunter, Forge, Arbiter)
- [x] HMAC-SHA256 signed agent handoffs (Loom-Protocol)
- [x] FastAPI backend with real-time SSE streaming
- [x] React frontend with live agent timeline, animated terminal, 3D card UI
- [x] PoC exploit display with syntax highlighting
- [x] Signed final report with per-agent findings
- [x] Deployed to Vercel: https://frontend-eight-theta-43.vercel.app
- [x] Demo video: https://youtu.be/tLYTZPm3D3g
- [x] Submitted to Meta AI Global Hackathon 2026
