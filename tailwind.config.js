/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: {
          800: '#0f172a',
          900: '#0b0f1a',
          950: '#05050a',
        },
        neon: {
          cyan: '#22d3ee',
          purple: '#a855f7',
          blue: '#3b82f6',
          red: '#fb7185',
        },
      },
      boxShadow: {
        glowCyan: '0 0 20px rgba(34, 211, 238, 0.35)',
        glowPurple: '0 0 20px rgba(168, 85, 247, 0.35)',
        glowBlue: '0 0 20px rgba(59, 130, 246, 0.35)',
      },
    },
  },
  plugins: [],
}
