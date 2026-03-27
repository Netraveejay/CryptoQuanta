import { motion } from 'framer-motion'
import ProbabilityHistoryPlot from './ProbabilityHistoryPlot.jsx'

function ExplainIcon({ onClick, label = 'Explain' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-neon-blue/35 bg-void-950/45 text-xs text-neon-blue transition hover:bg-neon-blue/10"
    >
      i
    </button>
  )
}

function Bar({ label, value, tone = 'cyan' }) {
  const color =
    tone === 'purple'
      ? 'bg-neon-purple shadow-glowPurple'
      : tone === 'blue'
        ? 'bg-neon-blue shadow-glowBlue'
        : 'bg-neon-cyan shadow-glowCyan'

  const pct = Math.max(0, Math.min(1, value)) * 100

  return (
    <div className="w-full text-left">
      <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
        <span className="tracking-wide">{label}</span>
        <span className="font-mono text-slate-200">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={['h-full rounded-full', color].join(' ')}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
        />
      </div>
    </div>
  )
}

export default function InfoPanel({
  mode,
  p0,
  p1,
  status,
  plaintext,
  ciphertext,
  qubitEncoding,
  isAttacked,
  deterministicBits,
  receivedCiphertext,
  decryptedMessage,
  probHistory = [],
  onExplain,
}) {
  const attackDetected = mode === 'quantum' && isAttacked

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-neon-blue/20 bg-void-900/45 p-4 shadow-glowBlue backdrop-blur">
      <div className="mb-4 shrink-0">
        <div className="text-xs uppercase tracking-[0.22em] text-neon-blue/80">Info + Output</div>
        <div className="mt-1 text-lg font-semibold text-slate-100">Transmission Monitor</div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-0.5 [-webkit-overflow-scrolling:touch]">
        {mode === 'quantum' ? (
          <div className="space-y-3 rounded-2xl border border-white/10 bg-void-950/30 p-3">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Probabilities</div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Bar label="P(0)" value={p0} tone="cyan" />
              </div>
              <ExplainIcon onClick={() => onExplain?.('prob0')} label="Explain P(0)" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Bar label="P(1)" value={p1} tone="purple" />
              </div>
              <ExplainIcon onClick={() => onExplain?.('prob1')} label="Explain P(1)" />
            </div>
            <ProbabilityHistoryPlot history={probHistory} onExplain={onExplain} />
          </div>
        ) : (
          <div className="space-y-3 rounded-2xl border border-white/10 bg-void-950/30 p-3">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Deterministic Bits</div>
            <div className="max-h-20 overflow-y-auto rounded-lg border border-white/10 bg-void-950/25 px-2 py-1.5 font-mono text-[10px] text-slate-100 break-all sm:max-h-24 sm:px-3 sm:py-2 sm:text-xs">
              {deterministicBits || '0100100001000101'}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-void-950/30 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Status</div>
            <div className="text-xs text-slate-400">
              Mode: <span className="font-semibold text-slate-200">{mode}</span>
            </div>
          </div>

          <motion.div
            className={[
              'mt-2 rounded-xl border px-3 py-2 text-sm font-semibold',
              attackDetected
                ? 'border-neon-red/40 bg-neon-red/10 text-neon-red'
                : 'border-neon-cyan/20 bg-neon-cyan/5 text-neon-cyan',
            ].join(' ')}
            animate={attackDetected ? { x: [0, -2, 2, -1, 1, 0] } : { x: 0 }}
            transition={{ duration: 0.35 }}
          >
            {attackDetected ? '⚠️ Attack Detected' : status || 'Normal Transmission'}
            {mode === 'classical' && isAttacked ? (
              <div className="mt-1 text-xs font-medium text-slate-400">
                Classical mode cannot reliably detect disturbance.
              </div>
            ) : null}
          </motion.div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-void-950/30 p-3">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Message flow</div>

          <div className="mt-2 space-y-2 text-sm">
            <div className="rounded-xl border border-white/10 bg-void-950/25 px-3 py-2">
              <div className="text-xs text-slate-400">Plaintext</div>
              <div className="mt-0.5 max-h-24 overflow-y-auto font-mono text-slate-100">{plaintext}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-void-950/25 px-3 py-2">
              <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                <span>{mode === 'classical' ? 'Ciphertext (ECC encrypted)' : 'Ciphertext (mock)'}</span>
                <ExplainIcon onClick={() => onExplain?.('ciphertext')} label="Explain ciphertext" />
              </div>
              <div className="mt-0.5 max-h-24 overflow-y-auto font-mono text-slate-100 break-all">{ciphertext}</div>
            </div>
            {mode === 'classical' ? (
              <>
                <div className="rounded-xl border border-white/10 bg-void-950/25 px-3 py-2">
                  <div className="text-xs text-slate-400">Received Ciphertext</div>
                  <div className="mt-0.5 max-h-24 overflow-y-auto font-mono text-slate-100">
                    {receivedCiphertext || '—'}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-void-950/25 px-3 py-2">
                  <div className="text-xs text-slate-400">Decrypted Output</div>
                  <div className="mt-0.5 max-h-24 overflow-y-auto font-mono text-slate-100">
                    {decryptedMessage || '—'}
                  </div>
                </div>
              </>
            ) : null}
            <div className="rounded-xl border border-white/10 bg-void-950/25 px-3 py-2">
              <div className="text-xs text-slate-400">
                {mode === 'classical' ? 'Classical encoding' : 'Qubit encoding'}
              </div>
              <div className="mt-0.5 max-h-24 overflow-y-auto font-mono text-slate-100">{qubitEncoding}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
