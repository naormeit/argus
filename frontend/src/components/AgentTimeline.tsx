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
    <div className="flex flex-col gap-0">
      {AGENTS.map((agent, i) => {
        const state = stepState(agent, agentStatus)
        const meta  = AGENT_META[agent]
        const secs  = agentTimes[agent]

        return (
          <div key={agent}>
            <div className={`flex items-center gap-3 py-2.5 rounded-lg px-1 transition-all duration-300 ${
              state === 'active' ? 'bg-blue-900/10' : ''
            }`}>
              {/* Icon circle */}
              <div className="relative flex-shrink-0">
                {/* Outer pulse rings for active */}
                {state === 'active' && (
                  <>
                    <span className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-30" style={{ animationDuration: '1.2s' }} />
                    <span className="absolute inset-[-4px] rounded-full border border-blue-500/20 animate-ping opacity-20" style={{ animationDuration: '1.8s' }} />
                  </>
                )}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all duration-500 border-2 ${
                  state === 'done'
                    ? 'border-green-500 bg-green-900/40 text-green-300 shadow-md shadow-green-900/30'
                    : state === 'active'
                    ? 'border-blue-400 bg-blue-900/40 text-blue-200 shadow-md shadow-blue-900/40'
                    : 'border-argus-border/60 bg-argus-panel text-argus-muted/40'
                }`}>
                  {state === 'done' ? (
                    <span className="animate-fade-in text-green-300 font-bold">✓</span>
                  ) : (
                    <span className={state === 'active' ? 'animate-pulse' : ''}>{meta.icon}</span>
                  )}
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                  state === 'done'   ? 'text-green-300' :
                  state === 'active' ? 'text-blue-200' :
                                       'text-argus-muted/50'
                }`}>
                  {meta.label}
                  {secs !== undefined && (
                    <span className="animate-fade-in text-[10px] font-normal text-argus-muted bg-black/30 px-1 py-0.5 rounded">{secs}s</span>
                  )}
                </div>
                <div className={`text-[11px] mt-0.5 transition-colors duration-300 ${
                  state === 'active' ? 'text-argus-muted' : 'text-argus-muted/40'
                }`}>{meta.description}</div>
              </div>

              {/* Status dot */}
              <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-all duration-500 ${
                state === 'done'   ? 'bg-green-400 shadow-sm shadow-green-500/50' :
                state === 'active' ? 'bg-blue-400 animate-pulse shadow-sm shadow-blue-500/50' :
                                     'bg-argus-border/40'
              }`} />
            </div>

            {/* Animated connector line */}
            {i < AGENTS.length - 1 && (
              <div className="ml-5 flex items-stretch gap-0 h-5">
                <div className="w-0.5 bg-argus-border/30 rounded-full overflow-hidden relative">
                  {state === 'done' && (
                    <div className="connector-fill absolute top-0 left-0 w-full bg-green-500/50 rounded-full" />
                  )}
                  {state === 'active' && (
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-blue-400/40 rounded-full" />
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Progress bar */}
      {agentStatus && agentStatus.status !== 'started' && (
        <div className="mt-4 pt-3 border-t border-argus-border/50">
          <div className="flex items-center justify-between text-[10px] text-argus-muted mb-2">
            <span>Progress</span>
            <span className={`font-semibold transition-colors ${
              agentStatus.status === 'complete' ? 'text-green-400' : 'text-blue-400'
            }`}>{agentStatus.progress}%</span>
          </div>
          <div className="h-1.5 bg-argus-border/40 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${agentStatus.progress}%`,
                background: agentStatus.status === 'complete'
                  ? 'linear-gradient(90deg, #16a34a, #22c55e)'
                  : 'linear-gradient(90deg, #2563eb, #7c3aed, #2563eb)',
                backgroundSize: '200% 100%',
                animation: agentStatus.status !== 'complete' ? 'shimmer 1.5s linear infinite' : 'none',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
