"""
Hunter — Exploit Path Reasoner
Second agent. Takes Scout's attack surface and reasons through full exploit chains.
"""
import json
import logging
from openai import AsyncOpenAI
from config import META_API_KEY, META_API_BASE_URL, MUSE_SPARK_MODEL
from models import AttackSurface, ExploitPath, AttackVector, Severity
from agents.base import BaseAgent
from signing import ArgusLedger

log = logging.getLogger(__name__)

_SYSTEM = """You are Hunter, a security exploit reasoning agent.

Given a list of suspicious code patterns, reason through each and build a concrete exploit chain.

Return ONLY a JSON array:
[
  {
    "function_name": "withdraw",
    "exploit_chain": [
      "1. Attacker deploys malicious contract with fallback that re-calls withdraw()",
      "2. Attacker calls withdraw() — balance check passes",
      "3. ETH transfer triggers attacker's fallback",
      "4. Fallback calls withdraw() again before balance is updated",
      "5. Repeat until contract is drained"
    ],
    "preconditions": ["Attacker must have deposited at least 1 wei", "Contract must hold ETH"],
    "impact": "Full drain of contract ETH balance",
    "severity": "critical"
  }
]

severity: critical | high | medium | low | info
Only include patterns that are genuinely exploitable."""


class HunterAgent(BaseAgent):
    def __init__(self, ledger: ArgusLedger):
        super().__init__("hunter", ledger)
        self._client: AsyncOpenAI | None = None

    @property
    def client(self) -> AsyncOpenAI:
        if self._client is None:
            self._client = AsyncOpenAI(api_key=META_API_KEY, base_url=META_API_BASE_URL)
        return self._client

    async def run(self, surface: AttackSurface, envelope: dict, transfer_id: str) -> tuple[list[ExploitPath], dict]:
        self._verify_from("scout", envelope, surface.model_dump())

        if not surface.suspicious_patterns:
            log.info("[Hunter] No patterns to reason about — clean surface.")
            return [], self._sign_to("forge", [], transfer_id)

        log.info(f"[Hunter] Reasoning through {len(surface.suspicious_patterns)} pattern(s) — audit {transfer_id}")

        patterns_json = json.dumps([p.model_dump() for p in surface.suspicious_patterns], indent=2)

        resp = await self.client.chat.completions.create(
            model=MUSE_SPARK_MODEL,
            messages=[
                {"role": "system", "content": _SYSTEM},
                {"role": "user",   "content": f"Suspicious patterns to reason about:\n{patterns_json}\n\nReturn only valid JSON array."},
            ],
            temperature=0.15,
            max_tokens=3000,
        )

        raw   = resp.choices[0].message.content or ""
        items = self._parse_arr(raw, "Hunter")

        paths: list[ExploitPath] = []
        for item in items:
            matched = next(
                (p for p in surface.suspicious_patterns if p.function_name == item.get("function_name")),
                surface.suspicious_patterns[0],
            )
            try:
                paths.append(ExploitPath(
                    vulnerability=matched,
                    exploit_chain=item.get("exploit_chain", []),
                    preconditions=item.get("preconditions", []),
                    impact=item.get("impact", "Unknown"),
                    severity=Severity(item.get("severity", "medium")),
                ))
            except Exception as e:
                log.warning(f"[Hunter] Skipped malformed path: {e}")

        envelope = self._sign_to("forge", [p.model_dump() for p in paths], transfer_id)
        log.info(f"[Hunter] {len(paths)} exploit path(s) built. Handoff signed → Forge.")
        return paths, envelope
