import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'

/* ── SVG icons ──────────────────────────────────────────────── */
const IconSearch = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const IconTarget = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
const IconCode   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
const IconShield = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const IconLock   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const IconZap    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
const IconFile   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
const IconCheck  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconArrow  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
const IconGithub = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12"/></svg>

/* ── Cursor glow ────────────────────────────────────────────── */
function CursorGlow() {
  const [pos, setPos] = useState({ x: -999, y: -999 })
  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <div
        className="absolute rounded-full"
        style={{
          left: pos.x, top: pos.y,
          width: 900, height: 900,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(212,160,82,0.07) 0%, rgba(35,79,96,0.04) 40%, transparent 65%)',
          transition: 'left 0.08s linear, top 0.08s linear',
        }}
      />
    </div>
  )
}

/* ── Floating particles ─────────────────────────────────────── */
function Particles() {
  const items = Array.from({ length: 14 }, (_, i) => ({
    left: `${5 + (i * 6.8) % 90}%`,
    size: 1 + (i % 3),
    duration: 10 + (i % 6) * 2.5,
    delay: i * 1.1,
    opacity: 0.15 + (i % 4) * 0.07,
  }))
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {items.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-lux-gold"
          style={{
            left: p.left, bottom: -4,
            width: p.size, height: p.size,
            opacity: p.opacity,
            animation: `float-up ${p.duration}s ${p.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  )
}

/* ── useInView ──────────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.unobserve(el) }
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView] as const
}

/* ── useTilt ────────────────────────────────────────────────── */
function useTilt() {
  const ref = useRef<HTMLDivElement>(null)
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width  - 0.5
    const y = (e.clientY - r.top)  / r.height - 0.5
    el.style.transform  = `perspective(700px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) scale3d(1.015,1.015,1.015)`
    el.style.transition = 'transform 0.1s ease'
  }, [])
  const onMouseLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.transform  = 'perspective(700px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)'
    ref.current.style.transition = 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1)'
  }, [])
  return { ref, onMouseMove, onMouseLeave }
}

/* ── Magnetic button ────────────────────────────────────────── */
function MagneticLink({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const onMouseMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width  / 2) * 0.25
    const y = (e.clientY - r.top  - r.height / 2) * 0.25
    el.style.transform  = `translate(${x}px, ${y}px)`
    el.style.transition = 'transform 0.15s ease'
  }
  const onMouseLeave = () => {
    if (!ref.current) return
    ref.current.style.transform  = 'translate(0,0)'
    ref.current.style.transition = 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1)'
  }
  return (
    <Link ref={ref} to={to} className={className} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      {children}
    </Link>
  )
}

/* ── Animated terminal ──────────────────────────────────────── */
function AnimatedTerminal() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const delays = [350, 800, 1400, 2050, 2750, 3500, 4300]
    const timers = delays.map((d, i) => setTimeout(() => setStep(i + 1), d))
    return () => timers.forEach(clearTimeout)
  }, [])

  const agents = [
    { name: 'Scout',   time: '8s',  show: step >= 2 },
    { name: 'Hunter',  time: '14s', show: step >= 3 },
    { name: 'Forge',   time: '22s', show: step >= 4 },
    { name: 'Arbiter', time: '6s',  show: step >= 5 },
  ]

  return (
    <div className="relative">
      <div className="absolute -inset-6 bg-lux-gold/4  blur-3xl rounded-3xl -z-10" />
      <div className="absolute -inset-3 bg-lux-sapphire/8 blur-2xl rounded-3xl -z-10" />

      <div className="rounded-2xl border border-lux-gold/15 bg-lux-black overflow-hidden shadow-2xl" style={{ willChange: 'transform' }}>
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6 bg-lux-sapphire/10">
          <div className="flex gap-1.5">
            {['bg-red-500/40','bg-yellow-500/40','bg-green-500/40'].map(c => (
              <div key={c} className={`w-3 h-3 rounded-full ${c}`} />
            ))}
          </div>
          <span className="text-xs text-lux-ice/25 font-mono ml-2">argus — audit session</span>
          <div className="ml-auto flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${step >= 5 ? 'bg-lux-gold/60' : 'bg-white/10'}`} />
          </div>
        </div>

        <div className="p-5 font-mono text-sm space-y-4" style={{ minHeight: 300 }}>
          {/* Command line */}
          {step >= 1 && (
            <div className="term-line flex gap-1 items-center">
              <span className="text-lux-ice/20">$&nbsp;</span>
              <span className="text-lux-ice/45">argus audit</span>
              <span className="text-lux-gold/80">&nbsp;VulnerableBank.sol</span>
              {step === 1 && <span className="cursor-blink text-lux-gold ml-0.5">▋</span>}
            </div>
          )}

          {/* Agent rows */}
          <div className="space-y-2.5">
            {agents.map(({ name, time, show }) => show && (
              <div key={name} className="term-line flex items-center gap-3">
                <span className="text-lux-ice/15 text-xs w-4">↳</span>
                <span className="text-lux-silver/45 w-14 text-xs">{name}</span>
                <div className="flex-1 h-px bg-white/6 relative overflow-hidden rounded-full">
                  <div className="absolute top-0 left-0 h-full bg-lux-gold/50 progress-run rounded-full" />
                </div>
                <span className="text-lux-ice/20 text-[10px] w-6 text-right tabular-nums">{time}</span>
                <span className="text-lux-gold/65 text-xs">✓</span>
              </div>
            ))}
          </div>

          {step >= 5 && <div className="border-t border-white/5" />}

          {/* Critical finding */}
          {step >= 6 && (
            <div className="term-line rounded-lg border border-red-500/20 bg-red-900/8 p-3 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-500/10 px-2 py-0.5 rounded">CRITICAL</span>
                <span className="text-lux-silver/65 text-xs">Reentrancy in withdraw()</span>
              </div>
              <div className="text-lux-ice/25 text-xs">confidence 97% · PoC exploit attached</div>
              <div className="text-[11px] text-lux-gold/55">+ 2 HIGH · 1 MEDIUM findings</div>
            </div>
          )}

          {/* Signature */}
          {step >= 7 && (
            <div className="term-line flex items-center gap-2 text-xs text-lux-ice/15">
              <span className="text-lux-gold/45">✓</span>
              <span>HMAC-SHA256 verified</span>
              <span className="ml-auto text-lux-ice/10 truncate">sig: a1b2c3d4e5f6789a…</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── TiltCard ───────────────────────────────────────────────── */
function TiltCard({ n, icon, name, title, desc }: { n: string; icon: React.ReactNode; name: string; title: string; desc: string }) {
  const tilt = useTilt()
  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className="group bg-lux-black p-6 cursor-default"
      style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="w-9 h-9 rounded-lg border border-lux-gold/20 bg-lux-gold/5
          flex items-center justify-center text-lux-gold/55
          group-hover:border-lux-gold/45 group-hover:bg-lux-gold/10 group-hover:text-lux-gold
          transition-all duration-300">
          {icon}
        </div>
        <span className="text-xs font-mono text-lux-white/12 group-hover:text-lux-gold/30 transition-colors">{n}</span>
      </div>
      <div className="text-[10px] font-mono text-lux-gold/45 uppercase tracking-widest mb-1.5 group-hover:text-lux-gold/65 transition-colors">{name}</div>
      <h3 className="text-sm font-semibold text-lux-white/75 mb-2 leading-snug group-hover:text-lux-white transition-colors font-display">{title}</h3>
      <p className="text-xs text-lux-ice/28 leading-relaxed">{desc}</p>
    </div>
  )
}

/* ── Section wrapper with scroll reveal ─────────────────────── */
function Reveal({ children, delay = 'd-0', className = '' }: { children: React.ReactNode; delay?: string; className?: string }) {
  const [ref, inView] = useInView()
  return (
    <div ref={ref} className={`${inView ? `reveal-up ${delay}` : 'opacity-0'} ${className}`}>
      {children}
    </div>
  )
}

/* ── Main page ──────────────────────────────────────────────── */
export default function Landing() {
  const [heroRef, heroInView] = useInView(0.05)

  return (
    <div className="min-h-screen bg-lux-black text-lux-white overflow-x-hidden">
      <CursorGlow />
      <Particles />

      {/* Animated background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute blob-a"
          style={{ top: '-10%', left: '20%', width: 600, height: 600, borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%',
            background: 'radial-gradient(circle, rgba(35,79,96,0.12) 0%, transparent 70%)' }}
        />
        <div
          className="absolute blob-b"
          style={{ top: '30%', right: '10%', width: 500, height: 500, borderRadius: '40% 60% 30% 70% / 60% 40% 60% 40%',
            background: 'radial-gradient(circle, rgba(212,160,82,0.06) 0%, transparent 70%)' }}
        />
        <div
          className="absolute blob-a"
          style={{ bottom: '10%', left: '40%', width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(35,79,96,0.08) 0%, transparent 70%)' }}
        />
      </div>

      {/* Subtle texture */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0,
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(212,160,82,0.035) 1px, transparent 0)',
        backgroundSize: '40px 40px' }} />

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center" style={{ zIndex: 2 }}>
        <div ref={heroRef}>
          {/* Eyebrow */}
          <div className={`flex items-center gap-3 mb-8 ${heroInView ? 'reveal-up d-0' : 'opacity-0'}`}>
            <span className={`h-px bg-lux-gold/40 line-grow ${heroInView ? 'line-grow' : ''}`} style={{ width: heroInView ? '1.5rem' : 0, transition: 'width 0.6s ease 0.2s' }} />
            <span className="text-xs font-mono uppercase tracking-widest text-lux-gold/60">Multi-Agent Security Auditor</span>
            <span className="h-px bg-lux-gold/40" style={{ width: heroInView ? '1.5rem' : 0, transition: 'width 0.6s ease 0.4s' }} />
          </div>

          {/* Headline — Syne font */}
          <h1 className={`font-display text-5xl sm:text-[62px] font-extrabold tracking-tight leading-[1.03] mb-6 ${heroInView ? 'reveal-up d-1' : 'opacity-0'}`}>
            <span className="text-lux-white">Find</span>{' '}
            <span className="text-lux-white">vulnerabilities</span>
            <br />
            <span className="text-lux-ice/20">before attackers do.</span>
          </h1>

          <p className={`text-base text-lux-ice/50 leading-relaxed mb-10 max-w-lg ${heroInView ? 'reveal-up d-2' : 'opacity-0'}`}>
            Argus runs a four-agent AI pipeline — Scout, Hunter, Forge, and Arbiter —
            to analyse your smart contracts and produce a cryptographically signed
            security report in under 90 seconds.
          </p>

          {/* CTAs */}
          <div className={`flex items-center gap-4 flex-wrap ${heroInView ? 'reveal-up d-3' : 'opacity-0'}`}>
            <MagneticLink
              to="/audit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm
                gold-shimmer shadow-xl shadow-lux-gold/25 gold-glow"
            >
              Run an Audit <IconArrow />
            </MagneticLink>
            <a
              href="https://github.com/naormeit/argus"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-lux-white/8
                text-lux-ice/40 hover:border-lux-gold/30 hover:text-lux-gold/70 transition-all duration-300 text-sm"
            >
              <IconGithub /> View on GitHub
            </a>
          </div>

          {/* Trust */}
          <div className={`mt-10 flex items-center gap-6 flex-wrap ${heroInView ? 'reveal-up d-4' : 'opacity-0'}`}>
            {['No sign-up required', 'Open source', 'HMAC-signed reports'].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-lux-ice/30">
                <span className="text-lux-gold/60"><IconCheck /></span> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Right — animated terminal */}
        <div className="relative" style={{ zIndex: 2 }}>
          <AnimatedTerminal />
        </div>
      </section>

      {/* ── Divider ──────────────────────────────────────── */}
      <div className="border-t border-lux-white/5 max-w-7xl mx-auto" style={{ zIndex: 2, position: 'relative' }} />

      {/* ── Pipeline ─────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 py-24" style={{ zIndex: 2 }}>
        <Reveal className="mb-16">
          <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-lux-gold/55 mb-4">
            <span className="w-6 h-px bg-lux-gold/30" /> The Pipeline
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-lux-white">
            Four agents. One signed report.
          </h2>
          <p className="text-lux-ice/40 mt-3 max-w-xl text-sm leading-relaxed">
            Each agent owns one phase of the audit. Results are passed via HMAC-signed
            handoffs — creating an unbroken chain of custody.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-lux-white/5 rounded-2xl overflow-hidden border border-lux-white/6">
          {[
            { n: '01', icon: <IconSearch />, name: 'Scout',   title: 'Attack surface mapping',  desc: 'Parses every function, modifier, and state variable. Builds a complete call graph and flags all external interactions.' },
            { n: '02', icon: <IconTarget />, name: 'Hunter',  title: 'Exploit path reasoning',  desc: 'Traces data-flow and control-flow to discover reentrancy loops, integer overflows, and access control gaps.' },
            { n: '03', icon: <IconCode />,   name: 'Forge',   title: 'PoC exploit generation',  desc: 'Writes working proof-of-concept exploit code for each confirmed vulnerability with step-by-step attack narration.' },
            { n: '04', icon: <IconShield />, name: 'Arbiter', title: 'Verification & signing',  desc: 'Cross-validates all findings, assigns confidence scores, and seals the report with HMAC-SHA256 via Loom-Protocol.' },
          ].map((card, i) => (
            <Reveal key={card.n} delay={`d-${i}`}>
              <TiltCard {...card} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Divider ──────────────────────────────────────── */}
      <div className="border-t border-lux-white/5 max-w-7xl mx-auto" style={{ zIndex: 2, position: 'relative' }} />

      {/* ── Features ─────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 py-24" style={{ zIndex: 2 }}>
        <Reveal className="mb-16">
          <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-lux-gold/55 mb-4">
            <span className="w-6 h-px bg-lux-gold/30" /> Why Argus
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-lux-white">
            Built for serious security work.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: <IconZap />,    title: 'Results in under 90 seconds',  desc: 'The full four-agent pipeline runs concurrently. A complete report before you finish reading the imports.' },
            { icon: <IconCode />,   title: 'Working PoC exploits',         desc: "Forge doesn't just flag issues — it writes the exploit. You see exactly how an attacker would drain your contract." },
            { icon: <IconFile />,   title: 'Tamper-evident reports',       desc: 'Every report is sealed with HMAC-SHA256. The signature proves the findings were generated by this exact pipeline.' },
            { icon: <IconShield />, title: 'Multi-language support',       desc: 'Solidity, Python, TypeScript, JavaScript, Rust, and Go. The same pipeline handles every language.' },
            { icon: <IconLock />,   title: 'Chain of custody',             desc: 'Each agent-to-agent handoff is signed. Tamper with any step and the final Arbiter signature fails.' },
            { icon: <IconSearch />, title: 'Open source',                  desc: "The full pipeline is on GitHub. Audit the auditor. Understand exactly what's analysing your code." },
          ].map(({ icon, title, desc }, i) => (
            <Reveal key={title} delay={`d-${i % 3}`}>
              <div className="group p-5 rounded-xl border border-lux-white/6 hover:border-lux-gold/20 hover:bg-lux-sapphire/8 transition-all duration-400 h-full"
                style={{ transition: 'border-color 0.3s, background 0.3s, transform 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
              >
                <div className="w-8 h-8 rounded-lg border border-lux-gold/20 bg-lux-gold/5
                  flex items-center justify-center text-lux-gold/50 mb-4
                  group-hover:border-lux-gold/40 group-hover:text-lux-gold/80 transition-all duration-300">
                  {icon}
                </div>
                <h3 className="text-sm font-semibold text-lux-white/75 mb-2 group-hover:text-lux-white transition-colors font-display">{title}</h3>
                <p className="text-xs text-lux-ice/28 leading-relaxed">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Divider ──────────────────────────────────────── */}
      <div className="border-t border-lux-white/5 max-w-7xl mx-auto" style={{ zIndex: 2, position: 'relative' }} />

      {/* ── Loom-Protocol ────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center" style={{ zIndex: 2 }}>
        <Reveal>
          <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-lux-gold/55 mb-4">
            <span className="w-6 h-px bg-lux-gold/30" /> Loom-Protocol
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-lux-white mb-4">
            Cryptographic chain of custody.
          </h2>
          <p className="text-lux-ice/42 text-sm leading-relaxed mb-8">
            Most AI tools produce outputs with no provenance. Argus uses Loom-Protocol to
            sign every inter-agent message with HMAC-SHA256. The final report's signature
            proves the findings came from this exact pipeline, in this exact order, on this exact code.
          </p>
          <div className="space-y-3">
            {[
              'Every handoff between agents is individually signed',
              'The final signature chains all intermediate signatures',
              'Verification requires only the report and the secret key',
            ].map((item, i) => (
              <div key={item} className="flex items-start gap-3 text-sm text-lux-ice/38" style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="text-lux-gold/55 mt-0.5 flex-shrink-0"><IconCheck /></span>
                {item}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay="d-1">
          <div className="rounded-xl border border-lux-sapphire/40 bg-lux-sapphire/6 p-6 font-mono text-xs space-y-3">
            <div className="text-lux-ice/25 mb-2 text-[10px] uppercase tracking-wider">Signature chain · audit_id: a1b2c3d4</div>
            {[
              { label: 'scout → hunter',   sig: 'hmac:2f8a1b4c9d3e7f0a…', delay: 0 },
              { label: 'hunter → forge',   sig: 'hmac:9c4d2a7e1b6f3c8d…', delay: 100 },
              { label: 'forge → arbiter',  sig: 'hmac:7e3c9a2f4b1d8e6c…', delay: 200 },
              { label: 'arbiter → report', sig: 'hmac:1a6f3c8d2e7b4a9c…', delay: 300 },
            ].map(({ label, sig }) => (
              <div key={label} className="flex items-center gap-3 group">
                <span className="text-lux-gold/45 flex-shrink-0 group-hover:text-lux-gold/70 transition-colors">✓</span>
                <span className="text-lux-ice/28 w-28">{label}</span>
                <span className="text-lux-ice/15 truncate group-hover:text-lux-ice/30 transition-colors">{sig}</span>
              </div>
            ))}
            <div className="border-t border-lux-gold/10 pt-3">
              <div className="flex items-center gap-2">
                <span className="text-lux-gold/65">✓</span>
                <span className="text-lux-silver/45">chain verified</span>
                <span className="ml-auto text-lux-ice/15">50ms</span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="border-t border-lux-white/5 relative" style={{ zIndex: 2 }}>
        <Reveal>
          <div className="max-w-3xl mx-auto px-6 py-28 text-center">
            <div className="flex items-center justify-center gap-3 text-xs font-mono uppercase tracking-widest text-lux-gold/45 mb-6">
              <span className="w-8 h-px bg-lux-gold/20" /> Get started <span className="w-8 h-px bg-lux-gold/20" />
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-lux-white mb-5">
              Ready to audit?
            </h2>
            <p className="text-lux-ice/38 mb-12 text-sm leading-relaxed max-w-md mx-auto">
              No account. No waiting list. Paste your contract and get a full
              report with working PoC exploits in under 90 seconds.
            </p>
            <MagneticLink
              to="/audit"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base
                gold-shimmer shadow-2xl shadow-lux-gold/30 gold-glow"
            >
              Start free audit <IconArrow />
            </MagneticLink>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-lux-white/5 relative" style={{ zIndex: 2 }}>
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md border border-lux-gold/30 bg-lux-gold/10 flex items-center justify-center">
                <span className="text-[10px] font-bold font-display text-lux-gold">A</span>
              </div>
              <span className="text-sm font-bold font-display text-lux-white">Argus</span>
            </div>
            <p className="text-xs text-lux-ice/22 leading-relaxed">
              Multi-agent AI security auditor for smart contracts.
            </p>
          </div>
          <div>
            <div className="text-[10px] font-mono text-lux-gold/35 mb-4 uppercase tracking-widest">Product</div>
            <div className="space-y-2.5">
              {[['Audit', '/audit'], ['Pricing', '/pricing'], ['Home', '/']].map(([label, to]) => (
                <Link key={label} to={to} className="block text-xs text-lux-ice/25 hover:text-lux-gold/65 transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-lux-gold/35 mb-4 uppercase tracking-widest">Pipeline</div>
            <div className="space-y-2.5">
              {['Scout', 'Hunter', 'Forge', 'Arbiter'].map(a => (
                <div key={a} className="text-xs text-lux-ice/22">{a}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-lux-gold/35 mb-4 uppercase tracking-widest">Legal</div>
            <div className="space-y-2.5">
              <Link to="/privacy" className="block text-xs text-lux-ice/25 hover:text-lux-gold/65 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="block text-xs text-lux-ice/25 hover:text-lux-gold/65 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-lux-white/4 max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xs text-lux-ice/12">© 2026 Argus</span>
          <div className="flex items-center gap-4">
            <a href="https://github.com/naormeit/argus" target="_blank" rel="noopener noreferrer"
              className="text-xs text-lux-ice/12 hover:text-lux-ice/30 transition-colors flex items-center gap-1.5">
              <IconGithub /> GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
