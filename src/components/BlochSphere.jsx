import { motion } from 'framer-motion'

function ExplainIcon({ onClick, label = 'Explain' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neon-purple/35 bg-void-950/45 text-sm text-neon-purple transition hover:bg-neon-purple/10"
    >
      i
    </button>
  )
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x))
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

export default function BlochSphere({
  mode,
  thetaDeg,
  phiDeg,
  p0,
  p1,
  isAttacked,
  attackVisual,
  showAttacker,
  transmitTick,
  onExplain,
  classicalBits = '',
  snr = 0,
  ber = 0,
}) {
  const isClassical = mode === 'classical'
  const p0c = clamp01(p0)
  const p1c = clamp01(p1)
  const certainty = Math.abs(p0c - p1c)
  const arrowLen = lerp(86, 118, certainty)

  if (isClassical) {
    return (
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-neon-purple/20 bg-void-900/35 shadow-glowPurple backdrop-blur sm:rounded-2xl">
        <div className="relative flex min-h-0 flex-1 flex-col p-4">
          <div className="mb-3 flex shrink-0 items-end justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-neon-purple/80">Visualization</div>
              <div className="mt-1 text-lg font-semibold text-slate-100">
                Classical Channel (ECC Conceptual)
              </div>
            </div>
            <div className="flex items-center gap-2 text-right text-xs text-slate-400">
              <div>
                SNR {snr.toFixed(1)} dB · BER {ber.toFixed(3)}
              </div>
              <ExplainIcon onClick={() => onExplain?.('bloch')} label="Explain classical channel" />
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-void-950/35 p-4">
            <div className="rounded-xl border border-white/10 bg-void-950/30 p-3">
              <div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">Bit Stream</div>
              <div className="font-mono text-sm text-slate-100 break-all">
                {classicalBits || '0100100001000101010011000100110001001111'}
              </div>
            </div>

            <div className="my-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:my-4 sm:gap-3">
              <div className="rounded-xl border border-neon-cyan/25 bg-void-950/35 px-3 py-2 text-center text-xs text-slate-200">
                Sender
              </div>
              <motion.div
                key={transmitTick}
                className="h-1 w-24 rounded-full bg-gradient-to-r from-neon-cyan to-neon-blue"
                initial={{ opacity: 0.4, scaleX: 0.8 }}
                animate={{ opacity: [0.4, 1, 0.4], scaleX: [0.8, 1, 0.8] }}
                transition={{ duration: 1.1 }}
              />
              <div className="rounded-xl border border-neon-blue/25 bg-void-950/35 px-3 py-2 text-center text-xs text-slate-200">
                Receiver
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-void-950/30 p-3">
              <div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">Signal Waveform</div>
              <div className="relative h-12 overflow-hidden rounded-lg border border-white/10 bg-black/20">
                <motion.div
                  key={transmitTick}
                  className="absolute inset-y-0 left-0 w-[160%] bg-[repeating-linear-gradient(90deg,rgba(34,211,238,0.9)_0_8px,rgba(34,211,238,0.15)_8px_16px)]"
                  animate={{ x: ['-35%', '0%'] }}
                  transition={{ duration: 1.4, ease: 'linear' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-neon-purple/20 bg-void-900/35 shadow-glowPurple backdrop-blur sm:rounded-2xl">
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        animate={
          attackVisual
            ? {
                backgroundColor: [
                  'rgba(251, 113, 133, 0.00)',
                  'rgba(251, 113, 133, 0.14)',
                  'rgba(251, 113, 133, 0.00)',
                ],
              }
            : { backgroundColor: 'rgba(0,0,0,0)' }
        }
        transition={{ duration: 0.45 }}
      />

      <div className="relative flex min-h-0 flex-1 flex-col p-4">
        <div className="mb-3 flex shrink-0 items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.22em] text-neon-purple/80">Visualization</div>
            <div className="mt-1 text-lg font-semibold text-slate-100">Bloch Sphere (Conceptual)</div>
          </div>
          <div className="flex items-center gap-2 text-right text-xs text-slate-400">
            <div>
              θ {Math.round(thetaDeg)}° · φ {Math.round(phiDeg)}°
            </div>
            <ExplainIcon onClick={() => onExplain?.('bloch')} label="Explain Bloch sphere" />
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center">
          <div className="pointer-events-none absolute inset-0 opacity-60">
            <div className="absolute inset-0 bg-neon-grid [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]" />
          </div>

          <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2">
            <div className="rounded-xl border border-neon-cyan/25 bg-void-950/40 px-3 py-2 text-xs text-slate-200 shadow-glowCyan">
              Sender
            </div>
          </div>

          <motion.div
            className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2"
            animate={attackVisual ? { x: [0, -2, 2, -1, 1, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="rounded-xl border border-neon-blue/25 bg-void-950/40 px-3 py-2 text-xs text-slate-200 shadow-glowBlue">
              Receiver
            </div>
          </motion.div>

          {showAttacker ? (
            <motion.div
              className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <div className="rounded-xl border border-neon-red/35 bg-void-950/55 px-3 py-2 text-xs font-semibold text-neon-red shadow-[0_0_24px_rgba(251,113,133,0.25)]">
                Attacker (MITM)
              </div>
            </motion.div>
          ) : null}

          <motion.div
            key={transmitTick}
            className="pointer-events-none absolute left-[110px] top-1/2 -translate-y-1/2"
            initial={{ x: 0, opacity: 0 }}
            animate={{ x: 'calc(100% - 260px)', opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.25, ease: 'easeInOut' }}
          >
            <div className="h-2.5 w-2.5 rounded-full bg-neon-cyan shadow-glowCyan" />
          </motion.div>

          <motion.div
            className="relative grid place-items-center"
            animate={attackVisual ? { rotate: [0, -1.2, 1.2, -0.6, 0.6, 0] } : { rotate: 0 }}
            transition={{ duration: 0.45 }}
          >
            <motion.div
              className={[
                'relative h-[min(300px,min(40svh,85vw))] w-[min(300px,min(40svh,85vw))] max-w-[min(320px,90vw)] rounded-full md:h-[min(320px,42svh)] md:w-[min(320px,42svh)]',
                'border border-white/10',
                'bg-gradient-to-br from-void-800/60 via-void-900/50 to-void-950/60',
                'shadow-[0_0_0_1px_rgba(168,85,247,0.14),0_0_80px_rgba(168,85,247,0.16)]',
                'before:absolute before:inset-0 before:rounded-full',
                'before:bg-[radial-gradient(circle_at_30%_25%,rgba(34,211,238,0.22),transparent_45%)]',
                'after:absolute after:inset-[22px] after:rounded-full',
                'after:border after:border-white/10 after:bg-[radial-gradient(circle_at_70%_75%,rgba(59,130,246,0.18),transparent_55%)]',
              ].join(' ')}
              animate={{
                boxShadow: [
                  '0 0 70px rgba(168,85,247,0.14)',
                  '0 0 90px rgba(34,211,238,0.12)',
                  '0 0 70px rgba(168,85,247,0.14)',
                ],
              }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="absolute left-1/2 top-1/2 h-[1px] w-[84%] -translate-x-1/2 -translate-y-1/2 bg-white/10" />
              <div className="absolute left-1/2 top-1/2 h-[84%] w-[1px] -translate-x-1/2 -translate-y-1/2 bg-white/10" />

              <motion.div
                className="absolute left-1/2 top-1/2"
                style={{ transformOrigin: '0px 0px' }}
                animate={{ rotate: phiDeg }}
                transition={{ type: 'spring', stiffness: 140, damping: 18 }}
              >
                <motion.div
                  className="absolute"
                  style={{ transformOrigin: '0px 0px' }}
                  animate={{ rotate: -thetaDeg }}
                  transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                >
                  <div
                    className="h-[2px] rounded-full bg-neon-cyan shadow-glowCyan"
                    style={{ width: `${arrowLen}px` }}
                  />
                  <div
                    className="absolute -right-1.5 -top-2 h-4 w-4 rotate-45 rounded-sm bg-neon-cyan shadow-glowCyan"
                    style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%, 20% 50%)' }}
                  />
                </motion.div>
              </motion.div>

              <div className="absolute bottom-4 left-1/2 w-[88%] -translate-x-1/2 rounded-2xl border border-white/10 bg-void-950/35 px-3 py-2 text-xs text-slate-300 backdrop-blur">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">Vector length</span>
                  <span className="font-mono text-slate-200">{(arrowLen / 118).toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
