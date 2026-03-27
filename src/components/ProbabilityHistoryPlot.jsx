import { motion } from 'framer-motion'

export default function ProbabilityHistoryPlot({ history = [], onExplain }) {
  if (!history.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-void-950/25 px-3 py-2 text-xs text-slate-500">
        Run gates or algorithms to build probability history.
      </div>
    )
  }

  const w = 240
  const h = 52
  const pad = 6
  const maxStep = Math.max(1, history.length - 1)
  const ptsP0 = history.map((p, i) => {
    const x = pad + (i / maxStep) * (w - pad * 2)
    const y = pad + (1 - p.p0) * (h - pad * 2)
    return `${x},${y}`
  })
  const ptsP1 = history.map((p, i) => {
    const x = pad + (i / maxStep) * (w - pad * 2)
    const y = pad + (1 - p.p1) * (h - pad * 2)
    return `${x},${y}`
  })
  const pointsP0 = ptsP0.join(' ')
  const pointsP1 = ptsP1.join(' ')

  return (
    <div className="rounded-xl border border-white/10 bg-void-950/25 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-400">P vs step (plot)</div>
        {onExplain ? (
          <button
            type="button"
            title="Explain"
            onClick={() => onExplain('probHistory')}
            className="inline-flex h-6 w-6 items-center justify-center rounded border border-neon-blue/35 text-[10px] text-neon-blue"
          >
            i
          </button>
        ) : null}
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full max-w-full" role="img" aria-label="P vs step">
        <rect x={0} y={0} width={w} height={h} fill="rgba(0,0,0,0.2)" rx={6} />
        <polyline
          fill="none"
          stroke="rgba(168,85,247,0.9)"
          strokeWidth="1.5"
          points={pointsP1}
        />
        <motion.polyline
          fill="none"
          stroke="rgba(34,211,238,0.95)"
          strokeWidth="2"
          points={pointsP0}
          initial={false}
          animate={{ opacity: 1 }}
        />
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-slate-500">
        <span className="text-neon-cyan">P(0)</span>
        <span className="text-neon-purple">P(1)</span>
      </div>
    </div>
  )
}
