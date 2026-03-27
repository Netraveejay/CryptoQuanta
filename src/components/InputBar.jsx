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

export default function InputBar({ draft, setDraft, onSend, isAttacked, onExplain }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-void-900/40 p-4 backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="w-full">
          <div className="mb-1 flex items-center gap-2">
            <label className="block text-xs uppercase tracking-[0.22em] text-slate-400">Enter Message</label>
            <ExplainIcon onClick={() => onExplain?.('sendMessage')} label="Explain Send Message" />
          </div>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={[
              'w-full rounded-xl border border-white/10 bg-void-950/40 px-3 py-2 text-sm text-slate-100',
              'placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan/35',
              isAttacked ? 'ring-1 ring-neon-red/25' : '',
            ].join(' ')}
            placeholder="HELLO"
            spellCheck={false}
          />
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onSend}
            className={[
              'inline-flex items-center justify-center rounded-xl border border-neon-cyan/35',
              'bg-neon-cyan/10 px-4 py-2 text-sm font-semibold text-neon-cyan shadow-glowCyan',
              'transition hover:bg-neon-cyan/15 focus:outline-none focus:ring-2 focus:ring-neon-cyan/35',
            ].join(' ')}
          >
            Send Message
          </motion.button>
          <ExplainIcon onClick={() => onExplain?.('sendMessage')} label="Explain Send Message" />
        </div>
      </div>
    </div>
  )
}
