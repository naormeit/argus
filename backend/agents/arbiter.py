"""
Arbiter — Final Verifier & Report Signer
Fourth agent. Synthesizes all findings into a cryptographically signed audit report.
"""
import hashlib
import json
import logging
from datetime import datetime, timezone
import anthropic
from config import ANTHROPIC_API_KEY, CLAUDE_SMART_MODEL
from models import AttackSurface, ProofOfConcept, AuditReport, Finding, Severity
from agents.base import BaseAgent
from signing import ArgusLedger

log = logging.getLogger(__name__)

_SYSTEM = """You are Arbiter, a senior security auditor agent responsible for the final verdict.

Given an attack surface analysis and proof-of-concept exploits, produce a final audit summary.
Return ONLY a JSON object:
{
  "findings": [
    {
      "vulnerability": "Reentrancy in withdraw()",
      "severity": "critical",
      "description": "The withdraw() function transfers ETH before updating the user's balance, enabling a reentrancy attack that drains the contract.",
      "remediation": "Apply the Checks-Effects-Interactions pattern: update balances[msg.sender] to 0 BEFORE calling msg.sender.call{value: amount}(). Alternatively, use ReentrancyGuard from OpenZeppelin.",
      "confidence": 0.98
    }
  ],
  "overall_risk": "critical",
  "summary": "Two-to-three paragraph executive summary of all findings, their combined risk, and top remediation priorities."
}

severity / overall_risk: critical | high | medium | low | info
Be precise. If a PoC was generated, mark confidence >= 0.9. Write remediations a developer can act on immediately."""

_SEVERITY_ORDER = {
    Severity.CRITICAL: 5, Severity.HIGH: 4, Severity.MEDIUM: 3,
    Severity.LOW: 2, Severity.INFO: 1,
}


class ArbiterAgent(BaseAgent):
    def __init__(self, ledger: ArgusLedger):
        super().__init__("arbiter", ledger)
        self._client: anthropic.AsyncAnthropic | None = None

    @property
    def client(self) -> anthropic.AsyncAnthropic:
        if self._client is None:
            self._client = anthropic.AsyncAnthropic(api_key=ANTHROPIC_API_KEY)
        return self._client

    async def run(
        self,
        surface: AttackSurface,
        pocs: list[ProofOfConcept],
        envelope: dict,
        original_code: str,
        audit_id: str,
    ) -> AuditReport:
        pocs_raw = [p.model_dump() for p in pocs]
        self._verify_from("forge", envelope, pocs_raw)

        log.info(f"[Arbiter] Synthesizing final report — audit {audit_id}")

        code_hash = hashlib.sha256(original_code.encode()).hexdigest()

        context = {
            "attack_surface": surface.model_dump(),
            "proofs_of_concept": pocs_raw,
        }

        resp = await self.client.messages.create(
            model=CLAUDE_SMART_MODEL,
            max_tokens=3000,
            system=_SYSTEM,
            messages=[{
                "role": "user",
                "content": f"Audit context:\n{json.dumps(context, indent=2)}\n\nReturn only valid JSON."
            }],
        )

        raw   = resp.content[0].text if resp.content else ""
        data  = self._parse_obj(raw, "Arbiter")

        findings: list[Finding] = []
        for f in data.get("findings", []):
            poc_code = None
            for p in pocs:
                if p.exploit_path.vulnerability.function_name in f.get("vulnerability", ""):
                    poc_code = p.poc_code
                    break
            try:
                findings.append(Finding(
                    vulnerability=f.get("vulnerability", "Unknown"),
                    severity=Severity(f.get("severity", "medium")),
                    description=f.get("description", ""),
                    poc_code=poc_code,
                    remediation=f.get("remediation", ""),
                    confidence=float(f.get("confidence", 0.7)),
                ))
            except Exception as e:
                log.warning(f"[Arbiter] Skipped malformed finding: {e}")

        try:
            overall_risk = Severity(data.get("overall_risk", "medium"))
        except ValueError:
            overall_risk = Severity.MEDIUM

        if findings and overall_risk == Severity.MEDIUM:
            highest = max(findings, key=lambda x: _SEVERITY_ORDER.get(x.severity, 0))
            overall_risk = highest.severity

        report_payload = {
            "audit_id":    audit_id,
            "timestamp":   datetime.now(timezone.utc).isoformat(),
            "code_hash":   code_hash,
            "findings":    [f.model_dump() for f in findings],
            "overall_risk": overall_risk.value,
            "summary":     data.get("summary", ""),
        }
        signature = self.ledger.sign_report(report_payload)

        report = AuditReport(
            audit_id=audit_id,
            timestamp=report_payload["timestamp"],
            code_hash=code_hash,
            findings=findings,
            overall_risk=overall_risk,
            signature=signature,
            summary=data.get("summary", ""),
        )

        log.info(f"[Arbiter] Report signed. {len(findings)} finding(s), overall risk: {overall_risk.value}.")
        return report
