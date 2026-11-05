"""
Argus signing layer — Loom-Protocol implemented with Python hmac/hashlib.

Maps Argus agent handoff fields onto the ATP packet schema:
  agent_id    ← from_agent (the sender)
  intent      ← to_agent   (the intended receiver)
  intent_hash ← SHA-256 hash of the serialized payload
  expiry      ← 300 000 ms (5-minute TTL)
"""
import hashlib
import hmac
import json
import time
import uuid
from typing import Any


_EXPIRY_MS = 300_000   # 5-minute TTL for handoff envelopes


def _compute_signature(packet: dict, secret: str) -> str:
    """Hash all fields except 'signature' so signing and verification agree."""
    signable = {k: v for k, v in packet.items() if k != "signature"}
    canonical = json.dumps(signable, sort_keys=True)
    return hmac.new(secret.encode(), canonical.encode(), hashlib.sha256).hexdigest()


def attach_signature(packet: dict, secret: str) -> dict:
    signed = dict(packet)
    signed["nonce"] = str(uuid.uuid4())
    signed["timestamp"] = time.time()
    signed["signature"] = _compute_signature(signed, secret)
    return signed


def verify_signature(packet: dict, secret: str) -> bool:
    expected = packet.get("signature", "")
    actual = _compute_signature(packet, secret)
    return hmac.compare_digest(expected, actual)


class ArgusLedger:
    """Atomic ledger for signed agent handoffs via Loom-Protocol."""

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
        signed = attach_signature(packet, self._secret)
        signed["from"]        = from_agent
        signed["to"]          = to_agent
        signed["transfer_id"] = transfer_id
        return signed

    def verify_handoff(self, envelope: dict, payload: Any) -> bool:
        ts = envelope.get("timestamp", 0)
        if time.time() - ts > _EXPIRY_MS / 1000:
            return False
        # Reconstruct the packet as it was when signed (without from/to/transfer_id)
        packet = {
            "agent_id":    envelope.get("agent_id", envelope.get("from", "")),
            "intent":      envelope.get("intent",    envelope.get("to", "")),
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
