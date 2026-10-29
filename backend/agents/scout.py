"""
Scout — Attack Surface Mapper
First agent in the Argus pipeline.
Calls Muse Spark to map entry points, state changes, and suspicious patterns.
"""
import json
import logging
from openai import AsyncOpenAI
from config import META_API_KEY, META_API_BASE_URL, MUSE_SPARK_MODEL
from models import AttackSurface, AttackVector
from agents.base import BaseAgent
from signing import ArgusLedger

log = logging.getLogger(__name__)

_SYSTEM = """You are Scout, a smart-contract and code security agent specializing in attack surface mapping.

Analyze the provided code and return ONLY a JSON object with this exact schema:
{
  "entry_points": ["list of public/external function names"],
  "state_changing_functions": ["functions that write to storage or transfer value"],
  "external_calls": ["all external calls, e.g. token.transfer(), msg.sender.call()"],
  "suspicious_patterns": [
    {
      "function_name": "withdraw",
      "vector_type": "reentrancy",
      "description": "state update happens after external call — classic CEI violation",
      "line_numbers": [42, 47],
      "confidence": 0.95
    }
  ],
  "language": "solidity",
  "summary": "One paragraph: what this code does and its overall risk posture."
}

vector_type must be one of: reentrancy | access_control | integer_overflow | unchecked_return | front_running | other
confidence: 1.0 = certain, 0.0 = speculative. Only flag real patterns."""


class ScoutAgent(BaseAgent):
    def __init__(self, ledger: ArgusLedger):
        super().__init__("scout", ledger)
        self._client: AsyncOpenAI | None = None

    @property
    def client(self) -> AsyncOpenAI:
        if self._client is None:
            self._client = AsyncOpenAI(api_key=META_API_KEY, base_url=META_API_BASE_URL)
        return self._client

    async def run(self, code: str, language: str, transfer_id: str) -> tuple[AttackSurface, dict]:
        log.info(f"[Scout] Mapping attack surface — audit {transfer_id}")

        resp = await self.client.chat.completions.create(
            model=MUSE_SPARK_MODEL,
            messages=[
                {"role": "system", "content": _SYSTEM},
                {"role": "user",   "content": f"Language: {language}\n\n```{language}\n{code}\n```\n\nReturn only valid JSON."},
            ],
            temperature=0.1,
            max_tokens=2048,
        )

        raw  = resp.choices[0].message.content or ""
        data = self._parse_obj(raw, "Scout")

        patterns = [
            AttackVector(
                function_name=p.get("function_name", "unknown"),
                vector_type=p.get("vector_type", "other"),
                description=p.get("description", ""),
                line_numbers=p.get("line_numbers"),
                confidence=float(p.get("confidence", 0.5)),
            )
            for p in data.get("suspicious_patterns", [])
        ]

        surface = AttackSurface(
            entry_points=data.get("entry_points", []),
            state_changing_functions=data.get("state_changing_functions", []),
            external_calls=data.get("external_calls", []),
            suspicious_patterns=patterns,
            language=data.get("language", language),
            summary=data.get("summary", ""),
        )

        envelope = self._sign_to("hunter", surface.model_dump(), transfer_id)
        log.info(f"[Scout] {len(patterns)} suspicious pattern(s) found. Handoff signed → Hunter.")
        return surface, envelope
