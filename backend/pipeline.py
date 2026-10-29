"""
ArgusPipeline — orchestrates Scout → Hunter → Forge → Arbiter.
"""
import asyncio
import logging
import uuid
from typing import Callable, Awaitable

from config import LOOM_SECRET
from models import AuditReport, AuditStatus
from signing import ArgusLedger
from agents.scout   import ScoutAgent
from agents.hunter  import HunterAgent
from agents.forge   import ForgeAgent
from agents.arbiter import ArbiterAgent

log = logging.getLogger(__name__)

ProgressCallback = Callable[[AuditStatus], Awaitable[None]]


class ArgusPipeline:
    def __init__(self):
        self.ledger  = ArgusLedger(LOOM_SECRET)
        self.scout   = ScoutAgent(self.ledger)
        self.hunter  = HunterAgent(self.ledger)
        self.forge   = ForgeAgent(self.ledger)
        self.arbiter = ArbiterAgent(self.ledger)
        self._active: dict[str, AuditStatus] = {}

    def get_status(self, audit_id: str) -> AuditStatus | None:
        return self._active.get(audit_id)

    async def run(
        self,
        code: str,
        language: str,
        audit_id: str | None = None,
        on_progress: ProgressCallback | None = None,
    ) -> AuditReport:
        audit_id    = audit_id or str(uuid.uuid4())
        transfer_id = str(uuid.uuid4())

        async def _emit(agent: str, pct: int):
            status = AuditStatus(audit_id=audit_id, status="running",
                                 current_agent=agent, progress=pct)
            self._active[audit_id] = status
            if on_progress:
                await on_progress(status)

        self._active[audit_id] = AuditStatus(audit_id=audit_id, status="running",
                                              current_agent="scout", progress=0)

        try:
            # ── Scout ────────────────────────────────────────────────────────
            await _emit("scout", 5)
            surface, env1 = await self.scout.run(code, language, transfer_id)
            log.info(f"[Pipeline] Scout done — {len(surface.suspicious_patterns)} pattern(s).")

            # ── Hunter ───────────────────────────────────────────────────────
            await _emit("hunter", 30)
            paths, env2 = await self.hunter.run(surface, env1, transfer_id)
            log.info(f"[Pipeline] Hunter done — {len(paths)} exploit path(s).")

            # ── Forge ────────────────────────────────────────────────────────
            await _emit("forge", 60)
            pocs, env3 = await self.forge.run(paths, env2, transfer_id)
            log.info(f"[Pipeline] Forge done — {len(pocs)} PoC(s).")

            # ── Arbiter ──────────────────────────────────────────────────────
            await _emit("arbiter", 85)
            report = await self.arbiter.run(surface, pocs, env3, code, audit_id)
            log.info(f"[Pipeline] Arbiter done — {report.overall_risk.value} risk.")

            final = AuditStatus(audit_id=audit_id, status="complete",
                                progress=100, report=report)
            self._active[audit_id] = final
            if on_progress:
                await on_progress(final)

            return report

        except Exception as exc:
            log.exception(f"[Pipeline] Fatal error on audit {audit_id}")
            err_status = AuditStatus(audit_id=audit_id, status="error",
                                     progress=0)
            self._active[audit_id] = err_status
            if on_progress:
                await on_progress(err_status)
            raise
