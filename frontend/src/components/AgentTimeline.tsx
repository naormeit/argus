import { AgentName, AGENTS, AGENT_META, AgentStatus } from '../types'

interface Props {
  agentStatus: AgentStatus | null
  agentTimes: Record<string, number>
}

type StepState = 'done' | 'active' | 'pending'

function stepState(agent: AgentName, current: AgentStatus | null): StepState {
  if (!current || current.status === 'started') return 'pending'
  const idx    = AGENTS.indexOf(agent)
  const curIdx = current.current_agent ? AGENTS.indexOf(current.current_agent) : -1

  if (current.status === 'complete') return 'done'
  if (current.status === 'error') return idx <= curIdx ? 'done' : 'pending'
  if (idx < curIdx) return 'done'
  if (idx === curIdx) return 'active'
  return 'pending'
}

export default function AgentTimeline({ agentStatus, agentTimes }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {AGENTS.map((agent, i) => {
        const state = stepState(agent, agentStatus)
        const meta  = AGENT_META[agent]
        const secs  = agentTimes[agent]

        return (
          <div key={agent}>
            <div className="flex items-center gap-3 py-2">
              {/* Icon circle */}
              <div className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm flex-shrink-0 transition-all duration-500 ${
                state === 'done'   ? 'border-green-500 bg-green-900/30 text-green-400' :
                state === 'active' ? 'border-blue-400 bg-blue-900/30 text-blue-300' :
                                     'border-argus-border bg-argus-panel text-argus-muted/50'
              }`}>
                {state === 'active' && (
                  <span className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-40" />
                )}
                {state === 'done' ? '✓' : meta.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold transition-colors duration-300 ${
                  state === 'done'   ? 'text-green-400' :
                  state === 'active' ? 'text-blue-300' :
                                       'text-argus-muted/60'
                }`}>
                  {meta.label}
                  {secs !== undefined && (
                    <span className="ml-1.5 text-[10px] font-normal text-argus-muted">{secs}s</span>
                  )}
                </div>
                <div className={`text-xs mt-0.5 transition-colors ${
                  state === 'active' ? 'text-argus-muted' : 'text-argus-muted/50'
                }`}>{meta.description}</div>
              </div>

              {/* Status dot */}
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                state === 'done'   ? 'bg-green-500' :
                state === 'active' ? 'bg-blue-400 animate-pulse' :
                                     'bg-argus-border'
              }`} />
            </div>

            {/* Connector */}
            {i < AGENTS.length - 1 && (
              <div className="ml-4 flex items-center gap-1 mb-1">
                <div className={`w-0.5 h-4 rounded-full transition-colors duration-500 ${
                  state === 'done' ? 'bg-green-500/40' : 'bg-argus-border/40'
                }`} />
              </div>
            )}
          </div>
        )
      })}

      {/* Progress bar */}
      {agentStatus && agentStatus.status !== 'started' && (
        <div className="mt-3 pt-3 border-t border-argus-border">
          <div className="flex items-center justify-between text-[10px] text-argus-muted mb-1.5">
            <span>Progress</span>
            <span>{agentStatus.progress}%</span>
          </div>
          <div className="h-1 bg-argus-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${agentStatus.progress}%`,
                background: agentStatus.status === 'complete'
                  ? '#22c55e'
                  : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
