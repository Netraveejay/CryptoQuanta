import { AnimatePresence, motion } from 'framer-motion'

export default function ExplanationPanel({ open = false, learningMode = true, topic, onClose }) {
  const t = topic || {}
  return (
    <AnimatePresence>
      {open && learningMode ? (
        <>
          <motion.button
            type="button"
            aria-label="Close explanation panel"
            className="fixed inset-0 z-[60] cursor-pointer bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-neon-cyan/20 bg-void-950/95 shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="text-sm font-semibold text-neon-cyan">{t.title || 'Topic'}</div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-300 hover:bg-white/5"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 text-sm text-slate-200">
              <div className="mb-3 rounded-xl border border-white/10 bg-void-900/40 p-3">
                <div className="text-[10px] uppercase tracking-widest text-slate-500">Definition</div>
                <p className="mt-1 leading-relaxed">{t.definition}</p>
              </div>
              <div className="mb-3 rounded-xl border border-white/10 bg-void-900/40 p-3">
                <div className="text-[10px] uppercase tracking-widest text-slate-500">What it does</div>
                <p className="mt-1 whitespace-pre-wrap leading-relaxed">{t.whatItDoes}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-void-900/40 p-3">
                <div className="text-[10px] uppercase tracking-widest text-slate-500">How it works</div>
                <p className="mt-1 whitespace-pre-wrap leading-relaxed">{t.howItWorks}</p>
              </div>
              {t.note ? (
                <p className="mt-3 text-xs text-slate-500">{t.note}</p>
              ) : null}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}
