export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface Finding {
  vulnerability: string
  severity: Severity
  description: string
  poc_code: string | null
  remediation: string
  confidence: number
}

export interface AuditReport {
  audit_id: string
  timestamp: string
  code_hash: string
  findings: Finding[]
  overall_risk: Severity
  signature: string
  summary: string
}

export interface AgentStatus {
  audit_id: string
  status: 'running' | 'complete' | 'error' | 'started'
  current_agent?: 'scout' | 'hunter' | 'forge' | 'arbiter'
  progress: number
  report?: AuditReport
}

export const AGENTS = ['scout', 'hunter', 'forge', 'arbiter'] as const
export type AgentName = (typeof AGENTS)[number]

export const AGENT_META: Record<AgentName, { label: string; description: string; icon: string }> = {
  scout:   { label: 'Scout',   description: 'Attack surface mapping',        icon: '🔍' },
  hunter:  { label: 'Hunter',  description: 'Exploit path reasoning',        icon: '🎯' },
  forge:   { label: 'Forge',   description: 'PoC exploit generation',        icon: '⚒️' },
  arbiter: { label: 'Arbiter', description: 'Verification & signing',        icon: '🔏' },
}

export const SEVERITY_COLOR: Record<Severity, string> = {
  critical: 'text-red-400 bg-red-900/30 border-red-500/50',
  high:     'text-orange-400 bg-orange-900/30 border-orange-500/50',
  medium:   'text-yellow-400 bg-yellow-900/30 border-yellow-500/50',
  low:      'text-blue-400 bg-blue-900/30 border-blue-500/50',
  info:     'text-gray-400 bg-gray-900/30 border-gray-500/50',
}
