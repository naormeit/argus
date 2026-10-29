from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH     = "high"
    MEDIUM   = "medium"
    LOW      = "low"
    INFO     = "info"


class AttackVector(BaseModel):
    function_name: str
    vector_type:   str        # reentrancy | access_control | integer_overflow | unchecked_return | front_running | other
    description:   str
    line_numbers:  Optional[list[int]] = None
    confidence:    float = Field(ge=0.0, le=1.0)


class AttackSurface(BaseModel):
    entry_points:              list[str]
    state_changing_functions:  list[str]
    external_calls:            list[str]
    suspicious_patterns:       list[AttackVector]
    language:                  str
    summary:                   str


class ExploitPath(BaseModel):
    vulnerability:  AttackVector
    exploit_chain:  list[str]
    preconditions:  list[str]
    impact:         str
    severity:       Severity


class ProofOfConcept(BaseModel):
    exploit_path: ExploitPath
    poc_code:     str
    language:     str
    verified:     bool = False
    explanation:  str


class Finding(BaseModel):
    vulnerability: str
    severity:      Severity
    description:   str
    poc_code:      Optional[str] = None
    remediation:   str
    confidence:    float = Field(ge=0.0, le=1.0)


class AuditReport(BaseModel):
    audit_id:     str
    timestamp:    str
    code_hash:    str
    findings:     list[Finding]
    overall_risk: Severity
    signature:    str
    summary:      str


class AuditRequest(BaseModel):
    code:      str
    language:  str = "solidity"
    audit_id:  Optional[str] = None


class AuditStatus(BaseModel):
    audit_id:      str
    status:        str   # running | completed | failed
    current_agent: Optional[str] = None
    progress:      int = 0
    report:        Optional[AuditReport] = None
