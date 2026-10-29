"""
Argus signing layer — powered by the loom-protocol SDK.

Maps Argus agent handoff fields onto loom-protocol's ATP packet schema:
  agent_id    ← from_agent (the sender)
  intent      ← to_agent   (the intended receiver)
  intent_hash ← SHA-256 hash of the serialized payload
  expiry      ← 300 000 ms (5-minute TTL)
"""
import hashlib
import json
import time
from typing import Any

from core.security.signing import attach_signature, verify_signature


_EXPIRY_MS = 300_000   # 5-minute TTL for handoff envelopes


class ArgusLedger:
    """Atomic ledger for signed agent handoffs via loom-protocol."""

    def __init__(self, secret_key: str):
        self._secret = secret_key

    def _payload_hash(self, payload: Any) -> str:
        serialized = json.dumps(payload, sort_keys=True, default=str)
        return hashlib.sha256(serialized.encode()).hexdigest()

    def sign_handoff(self, from_agent: str, to_agent: str, payload: Any, transfer_id: str) -> dict:
        packet = {
            "agent_id":    from_agent,
            "intent":      to_agent,
            "intent_hash": self._payload_hash(payload),
            "expiry":      _EXPIRY_MS,
        }
        # attach_signature (loom-protocol SDK) adds nonce, timestamp, signature
        signed = attach_signature(packet, self._secret)
        # keep original agent names for routing
        signed["from"]        = from_agent
        signed["to"]          = to_agent
        signed["transfer_id"] = transfer_id
        return signed

    def verify_handoff(self, envelope: dict, payload: Any) -> bool:
        ts = envelope.get("timestamp", 0)
        if time.time() - ts > _EXPIRY_MS / 1000:
            return False
        # Reconstruct the canonical ATP packet that was signed
        packet = {
            "agent_id":    envelope.get("from", ""),
            "intent":      envelope.get("to", ""),
            "intent_hash": self._payload_hash(payload),
            "expiry":      envelope.get("expiry", _EXPIRY_MS),
            "nonce":       envelope.get("nonce", ""),
            "timestamp":   ts,
            "signature":   envelope.get("signature", ""),
        }
        return verify_signature(packet, self._secret)

    def sign_report(self, report_data: dict) -> str:
        packet = {
            "agent_id":    "arbiter",
            "intent":      "report",
            "intent_hash": self._payload_hash(report_data),
            "expiry":      _EXPIRY_MS,
        }
        signed = attach_signature(packet, self._secret)
        return signed["signature"]
