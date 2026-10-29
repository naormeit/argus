import json
import logging
from abc import ABC, abstractmethod
from typing import Any
from signing import ArgusLedger

log = logging.getLogger(__name__)


class BaseAgent(ABC):
    def __init__(self, name: str, ledger: ArgusLedger):
        self.name   = name
        self.ledger = ledger

    @abstractmethod
    async def run(self, *args, **kwargs): ...

    def _sign_to(self, to_agent: str, payload: Any, transfer_id: str) -> dict:
        data = payload if isinstance(payload, (dict, list)) else payload.model_dump()
        return self.ledger.sign_handoff(self.name, to_agent, data, transfer_id)

    def _parse_obj(self, raw: str, agent: str) -> dict:
        """Extract and parse a JSON object from LLM output, stripping fences."""
        # strip markdown code fences
        for fence in ("```json", "```"):
            if fence in raw:
                raw = raw.split(fence, 1)[-1].rsplit("```", 1)[0]
        start = raw.find("{")
        end   = raw.rfind("}") + 1
        if start == -1 or end <= start:
            log.warning(f"[{agent}] No JSON object found in response; using empty dict")
            return {}
        try:
            return json.loads(raw[start:end])
        except json.JSONDecodeError as e:
            log.warning(f"[{agent}] JSON parse error: {e}; using empty dict")
            return {}

    def _parse_arr(self, raw: str, agent: str) -> list:
        """Extract and parse a JSON array from LLM output, stripping fences."""
        for fence in ("```json", "```"):
            if fence in raw:
                raw = raw.split(fence, 1)[-1].rsplit("```", 1)[0]
        start = raw.find("[")
        end   = raw.rfind("]") + 1
        if start == -1 or end <= start:
            log.warning(f"[{agent}] No JSON array found in response; using empty list")
            return []
        try:
            return json.loads(raw[start:end])
        except json.JSONDecodeError as e:
            log.warning(f"[{agent}] JSON parse error: {e}; using empty list")
            return []

    def _verify_from(self, expected_from: str, envelope: dict, payload: Any) -> None:
        if envelope.get("from") != expected_from:
            raise ValueError(f"Expected handoff from {expected_from}, got {envelope.get('from')}")
        data = payload if isinstance(payload, (dict, list)) else payload.model_dump()
        if not self.ledger.verify_handoff(envelope, data):
            raise ValueError(f"Invalid HMAC signature on handoff from {expected_from}")
