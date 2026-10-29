# Argus — Multi-Agent Security Auditor

> **Meta AI Global Hackathon 2026** — Indie Developer Track  
> Scout → Hunter → Forge → Arbiter, powered by Muse Spark + Muse Code  
> Every agent handoff is HMAC-SHA256 signed via Loom-Protocol

## What it does

Paste smart-contract (or any code). Argus runs a 4-agent pipeline:

| Agent | Model | Task |
|---|---|---|
| **Scout** | Muse Spark | Attack surface mapping — entry points, external calls, suspicious patterns |
| **Hunter** | Muse Spark | Exploit path reasoning — full step-by-step attack chains per vulnerability |
| **Forge** | Muse Code | PoC exploit generation — runnable Solidity / Python attack contracts |
| **Arbiter** | Muse Spark | Final synthesis — findings, remediations, HMAC-signed report |

Each handoff between agents is cryptographically signed (HMAC-SHA256).  
The final report carries a signature the user can verify independently.

## Setup

### 1. Set your Meta API key

```
cp .env.example .env
# edit .env and set META_API_KEY=<your key from meta.ai/hackathon>
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

## API

| Method | Path | Description |
|---|---|---|
| POST | `/audit` | Synchronous audit, returns full report |
| POST | `/audit/stream` | SSE stream — real-time agent progress |
| GET | `/audit/{id}/status` | Poll audit status |

### Request body

```json
{
  "code": "pragma solidity ...",
  "language": "solidity",
  "audit_id": "optional-uuid"
}
```

## Architecture

```
Frontend (React + Vite + Tailwind)
    ↓ POST /audit/stream
FastAPI (main.py)
    ↓
ArgusPipeline (pipeline.py)
    ↓ HMAC-signed handoffs (signing.py / Loom-Protocol)
Scout → Hunter → Forge → Arbiter
    (agents/scout.py, hunter.py, forge.py, arbiter.py)
    ↓ Muse Spark + Muse Code via openai-compatible client
Meta AI API (api.llama.com)
```

## Loom-Protocol signing

Every agent calls `ledger.sign_handoff(from, to, payload, transfer_id)` before passing data downstream.  
The next agent calls `ledger.verify_handoff(envelope, payload)` — rejecting anything tampered with.  
The Arbiter calls `ledger.sign_report(report_data)` to produce a final HMAC the UI displays.

## Day 1 deliverables ✓

- [x] Full 4-agent pipeline (Scout, Hunter, Forge, Arbiter)
- [x] HMAC-SHA256 signed handoffs
- [x] FastAPI backend with SSE streaming
- [x] React frontend with live agent timeline
- [x] PoC exploit display with syntax highlighting
- [x] Signed final report with code hash

## Day 2–9 (upcoming)

- [ ] Baseten integration for Muse Spark Open (privacy mode)
- [ ] Demo video + Loom recording
- [ ] Real Loom-Protocol SDK integration (`pip install loom-protocol`)
- [ ] Deployed to Vercel / Railway
- [ ] Submission write-up
