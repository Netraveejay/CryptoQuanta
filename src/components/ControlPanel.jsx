import { motion } from 'framer-motion'

function ExplainIcon({ onClick, label = 'Explain' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neon-cyan/30 bg-void-950/45 text-sm text-neon-cyan transition hover:bg-neon-cyan/10"
    >
      i
    </button>
  )
}

function ControlButton({ tone = 'cyan', disabled = false, onClick, children }) {
  const toneStyles =
    tone === 'purple'
      ? 'border-neon-purple/50 hover:border-neon-purple text-neon-purple'
      : tone === 'red'
        ? 'border-neon-red/50 hover:border-neon-red text-neon-red'
        : 'border-neon-cyan/50 hover:border-neon-cyan text-neon-cyan'

  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.01 }}
      whileTap={disabled ? undefined : { scale: 0.99 }}
      disabled={disabled}
      onClick={onClick}
      className={[
        'w-full rounded-xl border bg-void-900/60 px-3 py-2 text-left text-sm',
        'shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_10px_30px_rgba(0,0,0,0.35)]',
        'transition duration-200',
        'hover:bg-void-800/70',
        'focus:outline-none focus:ring-2 focus:ring-neon-cyan/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        toneStyles,
      ].join(' ')}
    >
      <span className="font-medium tracking-wide">{children}</span>
    </motion.button>
  )
}

export default function ControlPanel({
  mode,
  setMode,
  currentStateLabel,
  lastMeasurement,
  isAttacked,
  onInit0,
  onInit1,
  onSuperposition,
  onH,
  onX,
  onZ,
  onMeasure,
  onAttack,
  onGenerateKeys,
  onEncrypt,
  onDecrypt,
  onSendClassical,
  onReceiveClassical,
  onExplain,
  ryAngleDeg = 45,
  setRyAngleDeg,
  onApplyRy,
  onAlgorithmBell,
  onAlgorithmDeutschConst,
  onAlgorithmDeutschBal,
  onClearProbHistory,
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-neon-cyan/20 bg-void-900/50 p-4 shadow-glowCyan backdrop-blur">
      <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-neon-cyan/80">Controls</div>
          <div className="mt-1 text-lg font-semibold text-slate-100">Quantum Visual Simulator</div>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-neon-purple/25 bg-void-950/40 p-1">
          <button
            onClick={() => setMode('classical')}
            className={[
              'rounded-lg px-2.5 py-1 text-xs font-medium transition',
              mode === 'classical'
                ? 'bg-neon-purple/20 text-neon-purple shadow-glowPurple'
                : 'text-slate-300 hover:text-slate-100',
            ].join(' ')}
          >
            Classical
          </button>
          <button
            onClick={() => setMode('quantum')}
            className={[
              'rounded-lg px-2.5 py-1 text-xs font-medium transition',
              mode === 'quantum'
                ? 'bg-neon-cyan/15 text-neon-cyan shadow-glowCyan'
                : 'text-slate-300 hover:text-slate-100',
            ].join(' ')}
          >
            Quantum
          </button>
        </div>
      </div>

      {mode === 'quantum' ? (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5 [-webkit-overflow-scrolling:touch]">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ControlButton tone="cyan" onClick={onInit0}>
                  Initialize |0⟩
                </ControlButton>
              </div>
              <ExplainIcon onClick={() => onExplain?.('init0')} label="Explain Initialize |0⟩" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ControlButton tone="cyan" onClick={onInit1}>
                  Initialize |1⟩
                </ControlButton>
              </div>
              <ExplainIcon onClick={() => onExplain?.('init1')} label="Explain Initialize |1⟩" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ControlButton tone="purple" onClick={onSuperposition}>
                  Initialize Superposition
                </ControlButton>
              </div>
              <ExplainIcon onClick={() => onExplain?.('superposition')} label="Explain Superposition" />
            </div>
            <div className="my-1 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ControlButton onClick={onH}>Apply Hadamard (H)</ControlButton>
              </div>
              <ExplainIcon onClick={() => onExplain?.('gateH')} label="Explain Hadamard gate" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ControlButton onClick={onX}>Apply Pauli-X (X)</ControlButton>
              </div>
              <ExplainIcon onClick={() => onExplain?.('gateX')} label="Explain Pauli-X gate" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ControlButton onClick={onZ}>Apply Pauli-Z (Z)</ControlButton>
              </div>
              <ExplainIcon onClick={() => onExplain?.('gateZ')} label="Explain Pauli-Z gate" />
            </div>
            <div className="my-1 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ControlButton onClick={onMeasure}>Measure Qubit</ControlButton>
              </div>
              <ExplainIcon onClick={() => onExplain?.('measure')} label="Explain Measurement" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ControlButton tone="red" onClick={onAttack}>
                  Simulate MITM Attack
                </ControlButton>
              </div>
              <ExplainIcon onClick={() => onExplain?.('mitm')} label="Explain MITM attack" />
            </div>

            <div className="my-1 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Algorithms &amp; Ry (extras)
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ControlButton tone="purple" onClick={onAlgorithmBell}>
                  Bell prep: H|0⟩
                </ControlButton>
              </div>
              <ExplainIcon onClick={() => onExplain?.('algoBell')} label="Explain Bell prep" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ControlButton tone="purple" onClick={onAlgorithmDeutschConst}>
                  DJ constant: H·H
                </ControlButton>
              </div>
              <ExplainIcon onClick={() => onExplain?.('algoDeutschConst')} label="Explain DJ constant" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ControlButton tone="purple" onClick={onAlgorithmDeutschBal}>
                  DJ balanced: H·Z·H
                </ControlButton>
              </div>
              <ExplainIcon onClick={() => onExplain?.('algoDeutschBal')} label="Explain DJ balanced" />
            </div>
            <div className="rounded-xl border border-white/10 bg-void-950/35 px-3 py-2">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="text-xs text-slate-400">
                  Ry(θ) angle: <span className="font-mono text-neon-cyan">{ryAngleDeg}°</span>
                </div>
                <ExplainIcon onClick={() => onExplain?.('ryGate')} label="Explain Ry gate" />
              </div>
              <input
                type="range"
                min={0}
                max={180}
                step={1}
                value={ryAngleDeg}
                onChange={(e) => setRyAngleDeg?.(Number(e.target.value))}
                className="mb-2 w-full accent-neon-cyan"
              />
              <ControlButton onClick={onApplyRy}>Apply Ry(θ)</ControlButton>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ControlButton tone="cyan" onClick={onClearProbHistory}>
                  Clear probability history
                </ControlButton>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ControlButton tone="cyan" onClick={onGenerateKeys}>
                  Generate ECC Keys
                </ControlButton>
              </div>
              <ExplainIcon onClick={() => onExplain?.('classicalKeys')} label="Explain ECC keys" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ControlButton tone="purple" onClick={onEncrypt}>
                  Encrypt
                </ControlButton>
              </div>
              <ExplainIcon onClick={() => onExplain?.('classicalEncrypt')} label="Explain Encrypt" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ControlButton tone="cyan" onClick={onDecrypt}>
                  Decrypt
                </ControlButton>
              </div>
              <ExplainIcon onClick={() => onExplain?.('classicalDecrypt')} label="Explain Decrypt" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ControlButton onClick={onSendClassical}>Send</ControlButton>
              </div>
              <ExplainIcon onClick={() => onExplain?.('classicalSend')} label="Explain Send" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ControlButton onClick={onReceiveClassical}>Receive</ControlButton>
              </div>
              <ExplainIcon onClick={() => onExplain?.('classicalReceive')} label="Explain Receive" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ControlButton tone="red" onClick={onAttack}>
                  Simulate MITM Attack
                </ControlButton>
              </div>
              <ExplainIcon onClick={() => onExplain?.('mitm')} label="Explain MITM attack" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ControlButton tone="purple" onClick={() => setMode('quantum')}>
                  Switch to Quantum Mode
                </ControlButton>
              </div>
              <ExplainIcon onClick={() => onExplain?.('modeQuantum')} label="Explain Quantum mode" />
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 shrink-0 rounded-2xl border border-white/10 bg-void-950/30 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Current state</div>
            <div className="mt-1 text-sm font-medium text-slate-100">{currentStateLabel}</div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Measurement</div>
            <div className="mt-1 text-sm font-medium text-slate-100">{lastMeasurement ?? '—'}</div>
          </div>
        </div>

        {mode === 'quantum' && isAttacked ? (
          <div className="mt-2 text-sm font-semibold text-neon-red">⚠️ State Disturbed</div>
        ) : (
          <div className="mt-2 text-sm text-slate-400">
            {mode === 'classical'
              ? 'Classical mode: deterministic bits and ECC-style flow.'
              : 'Tip: try H then Measure.'}
          </div>
        )}
      </div>
    </div>
  )
}
