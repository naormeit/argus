import { Link } from 'react-router-dom'
import { GITHUB_REPO, LEGAL_LOCATION, LEGAL_NAME } from '../lib/site'

const AGENTS = [
  {
    name: 'Scout',
    role: 'Triage',
    body: 'Maps the contract surface, identifies external entry points and decides where deeper analysis is worth spending tokens.',
  },
  {
    name: 'Hunter',
    role: 'Detection',
    body: 'Looks for reentrancy, access-control gaps, oracle manipulation, arithmetic issues and protocol-specific attack paths.',
  },
  {
    name: 'Forge',
    role: 'Exploitation',
    body: 'Writes proof-of-concept exploit steps for the findings it can substantiate, so you can verify instead of guessing.',
  },
  {
    name: 'Arbiter',
    role: 'Adjudication',
    body: 'Filters false positives, assigns severity, and assembles the final report with remediation guidance.',
  },
]

export default function About() {
  return (
    <div className="min-h-screen bg-lux-black text-lux-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="text-xs text-lux-ice/40 hover:text-lux-ice/70 transition-colors mb-10 inline-block">
          ← Back to home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold font-display text-white mb-4 tracking-tight">About Argus</h1>
        <p className="text-sm text-lux-ice/60 leading-relaxed mb-10 max-w-2xl">
          Argus is an independent security tool for Ethereum and EVM smart contracts. It coordinates four
          specialised AI agents into one audit pipeline, so a developer can get a structured, reproducible
          first-pass review before a manual audit or a mainnet deployment.
        </p>

        <div className="space-y-10 text-sm text-lux-ice/70 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-white mb-3">Why it exists</h2>
            <p>
              Professional audits are essential but slow and expensive, and most teams deploy long before they can
              book one. Argus is not a replacement for that work. It is a fast, affordable way to surface obvious
              classes of bugs, document what was checked, and arrive at a manual audit with fewer unknowns.
            </p>
            <p className="mt-3">
              Every report is explicit about being AI-assisted. Findings can be wrong in both directions, which is
              why each one includes severity, reasoning and, where possible, a proof-of-concept path you can test.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-4">The pipeline</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {AGENTS.map(agent => (
                <div key={agent.name} className="rounded-xl border border-lux-white/10 bg-lux-white/5 p-4">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-display font-semibold text-lux-white">{agent.name}</span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-lux-gold/70">{agent.role}</span>
                  </div>
                  <p className="text-xs text-lux-ice/50 leading-relaxed">{agent.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">Principles</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>Your submitted code is used to produce your report — not to train models.</li>
              <li>Reports are signed so a shared link can be checked for tampering.</li>
              <li>Pricing is published up front: credits never expire, and Pro can be cancelled at any time.</li>
              <li>If an audit fails before a report is produced, the credit is refunded automatically.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">Who runs it</h2>
            <p>
              Argus is built and operated by {LEGAL_NAME}, based in {LEGAL_LOCATION}. The source for the frontend
              and backend is public on{' '}
              <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer" className="text-lux-gold hover:underline">
                GitHub
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-lux-white/5 flex flex-wrap gap-6 text-xs text-lux-ice/40">
          <Link to="/contact" className="hover:text-lux-gold/70 transition-colors">Contact us</Link>
          <Link to="/pricing" className="hover:text-lux-gold/70 transition-colors">Pricing</Link>
          <Link to="/audit" className="hover:text-lux-gold/70 transition-colors">Run an audit</Link>
        </div>
      </div>
    </div>
  )
}
