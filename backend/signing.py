"""
Argus signing layer — wraps Loom-Protocol's HMAC-SHA256 handoff model.

To swap in the real SDK once installed:
    pip install loom-protocol
    from loom_protocol import LoomClient
    loom = LoomClient(secret_key=LOOM_SECRET)
"""
import hmac
import hashlib
import json
import time
import uuid
from typing import Any


class ArgusLedger:
    """Atomic ledger for signed agent handoffs, inspired by Loom-Protocol."""

    def __init__(self, secret_key: str):
        self._key = secret_key.encode()
        self._nonces: set[str] = set()

    def _payload_hash(self, payload: Any) -> str:
        serialized = json.dumps(payload, sort_keys=True, default=str)
        return hashlib.sha256(serialized.encode()).hexdigest()

    def sign_handoff(self, from_agent: str, to_agent: str, payload: Any, transfer_id: str) -> dict:
        nonce = str(uuid.uuid4())
        ts    = int(time.time())

        message = json.dumps({
            "from":         from_agent,
            "to":           to_agent,
            "transfer_id":  transfer_id,
            "nonce":        nonce,
            "timestamp":    ts,
            "payload_hash": self._payload_hash(payload),
        }, sort_keys=True)

        sig = hmac.new(self._key, message.encode(), hashlib.sha256).hexdigest()
        self._nonces.add(nonce)

        return {"signature": sig, "nonce": nonce, "timestamp": ts,
                "from": from_agent, "to": to_agent, "transfer_id": transfer_id}

    def verify_handoff(self, envelope: dict, payload: Any) -> bool:
        if time.time() - envelope["timestamp"] > 300:   # 5-min TTL
            return False

        message = json.dumps({
            "from":         envelope["from"],
            "to":           envelope["to"],
            "transfer_id":  envelope["transfer_id"],
            "nonce":        envelope["nonce"],
            "timestamp":    envelope["timestamp"],
            "payload_hash": self._payload_hash(payload),
        }, sort_keys=True)

        expected = hmac.new(self._key, message.encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, envelope["signature"])

    def sign_report(self, report_data: dict) -> str:
        message = json.dumps(report_data, sort_keys=True, default=str)
        return hmac.new(self._key, message.encode(), hashlib.sha256).hexdigest()
