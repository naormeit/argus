"""
Lightweight Solidity static scanner — zero deps, runs before the AI pipeline.
Finds common vulnerability patterns via regex/heuristics and feeds them to Scout.
"""
import re
import logging
from dataclasses import dataclass, field

log = logging.getLogger(__name__)


@dataclass
class StaticFinding:
    detector:    str
    severity:    str   # high | medium | low | informational
    description: str
    lines:       list[int] = field(default_factory=list)


def scan_solidity(source: str) -> list[StaticFinding]:
    if not source.strip():
        return []

    findings: list[StaticFinding] = []
    lines = source.splitlines()

    def match_lines(pattern: str, flags: int = re.IGNORECASE) -> list[int]:
        return [i + 1 for i, ln in enumerate(lines) if re.search(pattern, ln, flags)]

    # 1. tx.origin auth
    if hits := match_lines(r'\btx\.origin\b'):
        findings.append(StaticFinding(
            detector='tx-origin',
            severity='medium',
            description='tx.origin used for authorization — susceptible to phishing; use msg.sender instead.',
            lines=hits,
        ))

    # 2. selfdestruct / suicide
    if hits := match_lines(r'\b(selfdestruct|suicide)\s*\('):
        findings.append(StaticFinding(
            detector='suicidal',
            severity='high',
            description='selfdestruct present — can permanently destroy the contract and drain all ETH.',
            lines=hits,
        ))

    # 3. delegatecall
    if hits := match_lines(r'\.delegatecall\s*\('):
        findings.append(StaticFinding(
            detector='controlled-delegatecall',
            severity='high',
            description='delegatecall detected — if target is user-controlled this allows arbitrary code execution in caller context.',
            lines=hits,
        ))

    # 4. Unchecked low-level call return value
    unchecked = [
        i + 1 for i, ln in enumerate(lines)
        if re.search(r'\.call\s*[\({]', ln)
        and not re.search(r'\(bool\s', ln)
        and not re.search(r'bool\s+\w+\s*[,=]', ln)
    ]
    if unchecked:
        findings.append(StaticFinding(
            detector='unchecked-low-level-calls',
            severity='medium',
            description='Return value of low-level .call() not captured — failed calls silently ignored.',
            lines=unchecked,
        ))

    # 5. Reentrancy heuristic: state write AFTER external call in same function
    _detect_reentrancy(lines, findings)

    # 6. block.timestamp for critical logic
    if hits := match_lines(r'\bblock\.timestamp\b'):
        findings.append(StaticFinding(
            detector='timestamp-dependency',
            severity='low',
            description='block.timestamp can be manipulated by miners by ~15 s — avoid for randomness or critical deadlines.',
            lines=hits,
        ))

    # 7. Integer overflow on old Solidity (< 0.8) without SafeMath
    _detect_overflow(lines, findings)

    # 8. Arbitrary send (transfer to user-controlled address without access check)
    if hits := match_lines(r'\b(transfer|send)\s*\('):
        findings.append(StaticFinding(
            detector='arbitrary-send-eth',
            severity='informational',
            description='ETH transfer detected — verify recipient cannot be controlled by an attacker.',
            lines=hits,
        ))

    log.info(f"[StaticScanner] {len(findings)} pattern(s) found.")
    return findings


def _detect_reentrancy(lines: list[str], findings: list[StaticFinding]) -> None:
    reentrancy_hits = []
    saw_external = False
    external_line = -1
    brace_depth = 0
    in_func = False

    for i, ln in enumerate(lines):
        opens  = ln.count('{')
        closes = ln.count('}')

        if re.search(r'\bfunction\b', ln):
            in_func = True
            saw_external = False
            brace_depth = 0

        if in_func:
            brace_depth += opens - closes

            if re.search(r'\.(call|transfer|send)\s*[\({]', ln):
                saw_external = True
                external_line = i + 1

            if saw_external and re.search(r'\b\w[\w\[\].]*\s*[+\-*]?=\s*', ln):
                if not re.search(r'(bool|uint|int|address)\s+\w+\s*=', ln):
                    reentrancy_hits.append(external_line)
                    saw_external = False

            if brace_depth <= 0 and i > 0:
                in_func = False
                saw_external = False

    if reentrancy_hits:
        findings.append(StaticFinding(
            detector='reentrancy',
            severity='high',
            description='State variable modified after external call — potential reentrancy (CEI pattern violation).',
            lines=list(dict.fromkeys(reentrancy_hits)),
        ))


def _detect_overflow(lines: list[str], findings: list[StaticFinding]) -> None:
    old_solidity = False
    for ln in lines:
        m = re.search(r'pragma solidity\s+[^0-9]*(\d+)\.(\d+)', ln)
        if m and int(m.group(2)) < 8:
            old_solidity = True
            break

    if not old_solidity:
        return

    has_safemath = any('SafeMath' in ln for ln in lines)
    if has_safemath:
        return

    hits = [
        i + 1 for i, ln in enumerate(lines)
        if re.search(r'\b\w+\s*[\+\-\*]\s*\w+', ln)
        and not re.search(r'^\s*//', ln)
    ]
    if hits:
        findings.append(StaticFinding(
            detector='integer-overflow',
            severity='high',
            description='Solidity <0.8.0 without SafeMath — arithmetic operations may silently overflow/underflow.',
            lines=hits[:5],
        ))
