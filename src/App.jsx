import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import BlochSphere from './components/BlochSphere.jsx'
import ControlPanel from './components/ControlPanel.jsx'
import InfoPanel from './components/InfoPanel.jsx'
import InputBar from './components/InputBar.jsx'
import ExplanationPanel from './components/ExplanationPanel.jsx'

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x))
}

function mockCiphertext(len = 5) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < len; i++) out += alphabet[randInt(0, alphabet.length - 1)]
  return out
}

function toBinaryString(message) {
  return Array.from(message || '')
    .map((ch) => ch.charCodeAt(0).toString(2).padStart(8, '0'))
    .join(' ')
}

function mockEccEncrypt(message) {
  if (!message) return ''
  return Array.from(message)
    .map((ch) => (ch.charCodeAt(0) + 7).toString(16).toUpperCase().padStart(2, '0'))
    .join('')
}

function mockEccDecrypt(cipher) {
  if (!cipher || cipher.length % 2 !== 0) return ''
  try {
    const out = []
    for (let i = 0; i < cipher.length; i += 2) {
      const code = parseInt(cipher.slice(i, i + 2), 16) - 7
      out.push(String.fromCharCode(code))
    }
    return out.join('')
  } catch {
    return ''
  }
}

function corruptCiphertext(ct) {
  if (!ct) return ct
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const i = randInt(0, Math.max(0, ct.length - 1))
  const ch = alphabet[randInt(0, alphabet.length - 1)]
  return ct.slice(0, i) + ch + ct.slice(i + 1)
}

function stateLabelFromProb(p0, p1) {
  if (p0 === 1 && p1 === 0) return '|0⟩'
  if (p0 === 0 && p1 === 1) return '|1⟩'
  if (p0 === 0.5 && p1 === 0.5) return 'Superposition (|0⟩ + |1⟩)'
  return `Mixed (P0=${p0.toFixed(2)}, P1=${p1.toFixed(2)})`
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

function makeSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

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

export default function App() {
  const sessionIdRef = useRef(makeSessionId())
  const modeRef = useRef('quantum')
  const [mode, setMode] = useState('quantum')
  const [draftMessage, setDraftMessage] = useState('HELLO')
  const [sentMessage, setSentMessage] = useState('HELLO')
  const [ciphertext, setCiphertext] = useState(() => mockCiphertext(5))
  const [learningMode, setLearningMode] = useState(true)
  const [explainOpen, setExplainOpen] = useState(false)
  const [explainKey, setExplainKey] = useState(null)

  const [p0, setP0] = useState(1)
  const [p1, setP1] = useState(0)
  const [thetaDeg, setThetaDeg] = useState(0)
  const [phiDeg, setPhiDeg] = useState(0)

  const [status, setStatus] = useState('Normal Transmission')
  const [lastMeasurement, setLastMeasurement] = useState(null)

  const [isAttacked, setIsAttacked] = useState(false)
  const [showAttacker, setShowAttacker] = useState(false)
  const [transmitTick, setTransmitTick] = useState(0)
  const [backendConnected, setBackendConnected] = useState(false)
  const [deterministicBits, setDeterministicBits] = useState(toBinaryString('HELLO'))
  const [eccPublicKey, setEccPublicKey] = useState('—')
  const [eccPrivateKey, setEccPrivateKey] = useState('—')
  const [receivedCiphertext, setReceivedCiphertext] = useState('')
  const [decryptedMessage, setDecryptedMessage] = useState('')
  const [snrDb, setSnrDb] = useState(30)
  const [ber, setBer] = useState(0.0)

  const [probHistory, setProbHistory] = useState([])
  const [ryAngleDeg, setRyAngleDeg] = useState(45)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  const attackVisual = mode === 'quantum' && isAttacked

  const explanationContent = useMemo(() => {
    const commonNote =
      'This simulator is conceptual: it focuses on intuition and visualization, not full quantum math or real ECC.'
    const map = {
      modeClassical: {
        title: 'Classical Mode (Conceptual ECC)',
        definition: 'A traditional communication model where security is based on mathematical hardness (conceptually like ECC).',
        whatItDoes: 'Shows a transmission that can be intercepted without an automatic “physics-based” alarm.',
        howItWorks:
          'We simulate ciphertext as a protected-looking string.\nA MITM may cause subtle corruption, but the system does not inherently detect interception.',
        note: commonNote,
      },
      modeQuantum: {
        title: 'Quantum Mode (Qubit Transmission)',
        definition: 'A communication model where information is represented as a qubit state (visualized on the sphere).',
        whatItDoes: 'Shows how interception/measurement can disturb the state and reveal an attack.',
        howItWorks:
          'A MITM “measures” the qubit → the state collapses/changes → probabilities and the arrow jump → we flag detection.',
        note: commonNote,
      },
      learningMode: {
        title: 'Learning Mode',
        definition: 'An interactive help system for this simulator.',
        whatItDoes: 'When ON, you can click UI elements to open a detailed explanation panel.',
        howItWorks: 'We store the selected topic key in state and render an animated panel with Definition / What / How sections.',
        note: commonNote,
      },
      sendMessage: {
        title: 'Send Message',
        definition: 'Starts a new conceptual “transmission.”',
        whatItDoes: 'Locks in the plaintext, generates a new mock ciphertext, and animates sender → receiver.',
        howItWorks: 'We set “sent message” state and generate a random-looking ciphertext string. No real ECC is performed.',
        note: commonNote,
      },
      classicalKeys: {
        title: 'Generate ECC Keys',
        definition: 'Creates a public/private key pair for classical encryption.',
        whatItDoes: 'Generates conceptual ECC-style keys for sender/receiver operations.',
        howItWorks: 'This simulator creates mock key IDs (not real cryptographic keys) to visualize key lifecycle.',
        note: commonNote,
      },
      classicalEncrypt: {
        title: 'Encrypt (Classical)',
        definition: 'Transforms plaintext into ciphertext using a classical scheme.',
        whatItDoes: 'Protects message readability during transmission.',
        howItWorks: 'Simulator uses a mock ECC-like transform from plaintext bytes to encrypted-looking hex text.',
        note: commonNote,
      },
      classicalDecrypt: {
        title: 'Decrypt (Classical)',
        definition: 'Converts received ciphertext back to plaintext.',
        whatItDoes: 'Recovers the original message when data is intact and key flow is correct.',
        howItWorks: 'Simulator reverses the mock encrypt transform; tampering can cause decrypt failure.',
        note: commonNote,
      },
      classicalSend: {
        title: 'Send (Classical)',
        definition: 'Transmits encrypted data through the classical channel.',
        whatItDoes: 'Starts sender-to-receiver flow animation and updates transmission status.',
        howItWorks: 'Ciphertext is pushed into the channel model; receiver can later fetch it.',
        note: commonNote,
      },
      classicalReceive: {
        title: 'Receive (Classical)',
        definition: 'Receives the transmitted ciphertext on the receiver side.',
        whatItDoes: 'Moves incoming ciphertext into receiver buffer for verification/decryption.',
        howItWorks: 'If MITM is active, ciphertext may be altered in transit before receiver stores it.',
        note: commonNote,
      },
      init0: {
        title: 'Initialize |0⟩',
        definition: 'A qubit prepared in the “0” basis state.',
        whatItDoes: 'Sets the state to a definite 0 outcome: P(0)=1, P(1)=0.',
        howItWorks: 'We directly set probabilities to P(0)=1 and P(1)=0, and point the vector “up” on the sphere.',
        note: commonNote,
      },
      init1: {
        title: 'Initialize |1⟩',
        definition: 'A qubit prepared in the “1” basis state.',
        whatItDoes: 'Sets the state to a definite 1 outcome: P(0)=0, P(1)=1.',
        howItWorks: 'We set probabilities to P(0)=0 and P(1)=1, and point the vector “down” on the sphere.',
        note: commonNote,
      },
      superposition: {
        title: 'Initialize Superposition',
        definition: 'A balanced mixture of |0⟩ and |1⟩ (50/50).',
        whatItDoes: 'Creates uncertainty: measuring can produce 0 or 1 with equal chance.',
        howItWorks: '|0⟩ or |1⟩ → set P(0)=0.5 and P(1)=0.5. The vector moves to the equator.',
        note: commonNote,
      },
      gateH: {
        title: 'Hadamard Gate (H)',
        definition: 'A quantum gate that creates superposition.',
        whatItDoes: 'Converts a definite state into a mix of 0 and 1.',
        howItWorks: '|0⟩ → 50% |0⟩ + 50% |1⟩\nP(0)=0.5, P(1)=0.5 (conceptual mapping used here).',
        note: commonNote,
      },
      gateX: {
        title: 'Pauli-X Gate (X)',
        definition: 'A quantum “bit-flip” operation.',
        whatItDoes: 'Swaps |0⟩ and |1⟩ (flips outcomes).',
        howItWorks: 'If state is definite: |0⟩ ↔ |1⟩.\nIn this simulator we flip P(0) and P(1) when they are 0/1.',
        note: commonNote,
      },
      gateZ: {
        title: 'Pauli-Z Gate (Z)',
        definition: 'A quantum “phase-flip” operation.',
        whatItDoes: 'Changes phase without changing measurement probabilities in the same basis.',
        howItWorks: 'We keep P(0), P(1) the same but rotate the arrow visually (a phase rotation).',
        note: commonNote,
      },
      measure: {
        title: 'Measurement',
        definition: 'Observation of a qubit state.',
        whatItDoes: 'Collapses superposition/mixed states into a definite 0 or 1 outcome.',
        howItWorks:
          'We sample a random number r.\nIf r < P(0) → result=0, else result=1.\nThen we set P(result)=1 and the other to 0.',
        note: commonNote,
      },
      mitm: {
        title: 'MITM Attack (Meet-in-the-Middle)',
        definition: 'An attacker sits between sender and receiver and intercepts traffic.',
        whatItDoes: 'Attempts to read or modify the transmitted information in transit.',
        howItWorks:
          'Classical mode: interception may corrupt data but does not inherently trigger detection.\nQuantum mode: attacker “measures” the qubit → state is disturbed → receiver can detect disturbance.',
        note: commonNote,
      },
      bloch: {
        title: 'Bloch Sphere (Conceptual)',
        definition: 'A visual way to represent a single qubit state as a direction (an arrow) on/in a sphere.',
        whatItDoes: 'Helps you “see” how gates change the state via rotations, and how measurement collapses it.',
        howItWorks:
          'This simulator maps states to angles (θ, φ) for smooth rotation.\nProbabilities are simplified (|0⟩, |1⟩, 50/50 superposition).',
        note: commonNote,
      },
      prob0: {
        title: 'Probability P(0)',
        definition: 'The chance of measuring 0.',
        whatItDoes: 'Controls how often measurement collapses to 0 in repeated trials.',
        howItWorks: 'If P(0)=1 → always 0.\nIf P(0)=0.5 → 0 about half the time.\nSampling rule: r < P(0) → 0.',
        note: commonNote,
      },
      prob1: {
        title: 'Probability P(1)',
        definition: 'The chance of measuring 1.',
        whatItDoes: 'Controls how often measurement collapses to 1 in repeated trials.',
        howItWorks: 'P(1)=1−P(0) in this simplified model.\nIf r ≥ P(0) → 1.',
        note: commonNote,
      },
      ciphertext: {
        title: 'Ciphertext (Mock Encryption)',
        definition: 'An encrypted-looking version of the plaintext message.',
        whatItDoes: 'Represents “protected data” being transmitted (conceptually like ECC-based encryption).',
        howItWorks:
          'Plaintext → (mock encryption) → random-looking ciphertext.\nIn this simulator it is not real ECC; it’s a visual placeholder.',
        note: commonNote,
      },
      probHistory: {
        title: 'Probability vs step (plot)',
        definition: 'A simple time-series of P(0) and P(1) after each operation.',
        whatItDoes: 'Shows how measurement probabilities evolve as you apply gates or algorithms.',
        howItWorks: 'Each row appends the current P(0), P(1) from the simulator state (Qiskit when connected).',
        note: commonNote,
      },
      algoBell: {
        title: 'Algorithm: Bell |Φ⁺⟩ prep (qubit A)',
        definition: 'First step of a Bell pair: prepare one qubit in the |+⟩ = (|0⟩+|1⟩)/√2 state.',
        whatItDoes: 'Demonstrates a standard subroutine used before two-qubit entangling gates.',
        howItWorks: 'Sequence: |0⟩ → H. Full Bell |Φ⁺⟩ needs two qubits + CNOT; this demo shows the single-qubit half.',
        note: commonNote,
      },
      algoDeutschConst: {
        title: 'Algorithm: Deutsch–Jozsa (constant oracle, 1-qubit)',
        definition: 'Toy Deutsch–Jozsa: constant oracle leaves balanced superposition distinguishable.',
        whatItDoes: 'Runs H · H on |0⟩ so the final state returns toward |0⟩ (conceptual constant function).',
        howItWorks: 'Sequence: |0⟩ → H → H. Compare with the balanced preset (uses Z between H’s).',
        note: commonNote,
      },
      algoDeutschBal: {
        title: 'Algorithm: Deutsch–Jozsa (balanced oracle, 1-qubit)',
        definition: 'Toy Deutsch–Jozsa: balanced oracle flips phase so H restores |1⟩.',
        whatItDoes: 'Runs H · Z · H on |0⟩ to illustrate oracle-dependent phase.',
        howItWorks: 'Sequence: |0⟩ → H → Z → H. Outcome differs from the constant sequence.',
        note: commonNote,
      },
      ryGate: {
        title: 'Ry(θ) rotation',
        definition: 'Rotates the qubit state in the Bloch Y plane by angle θ.',
        whatItDoes: 'Lets you vary a physical parameter and see P(0), P(1) and the Bloch vector respond.',
        howItWorks: 'Backend applies Ry(θ) in radians from your angle in degrees; fallback uses the same trig on |0⟩.',
        note: commonNote,
      },
    }
    return map[explainKey] || map.bloch
  }, [explainKey])

  function explain(nextKey) {
    if (!learningMode) return
    if (!nextKey) return
    setExplainOpen(true)
    setExplainKey(nextKey)
  }

  const qubitEncoding = useMemo(() => {
    if (mode === 'classical') {
      const decidedBit = p0 >= p1 ? 0 : 1
      return `Bit=${decidedBit} · confidence=${Math.max(p0, p1).toFixed(2)} · ECC-style`
    }
    const lbl = stateLabelFromProb(p0, p1)
    return `${lbl} · θ=${Math.round(thetaDeg)}° · φ=${Math.round(phiDeg)}°`
  }, [mode, p0, p1, thetaDeg, phiDeg])

  const currentStateLabel = useMemo(() => stateLabelFromProb(p0, p1), [p0, p1])

  function appendProbHistoryLocal(p0v, p1v, label) {
    if (modeRef.current !== 'quantum') return
    setProbHistory((h) => [...h, { step: h.length, p0: p0v, p1: p1v, label }].slice(-48))
  }

  function syncQuantumState(data, stepLabel = '') {
    if (!data) return
    setP0(data.p0 ?? 1)
    setP1(data.p1 ?? 0)
    setThetaDeg(data.theta_deg ?? 0)
    setPhiDeg(data.phi_deg ?? 0)
    if (modeRef.current === 'quantum') {
      setProbHistory((h) =>
        [...h, { step: h.length, p0: data.p0, p1: data.p1, label: stepLabel }].slice(-48)
      )
    }
  }

  async function postQuantum(path, payload) {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionIdRef.current,
        ...payload,
      }),
    })
    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status}`)
    }
    return response.json()
  }

  useEffect(() => {
    let cancelled = false

    async function bootstrapQuantum() {
      try {
        const data = await postQuantum('/quantum/init', { state: '0' })
        if (cancelled) return
        syncQuantumState(data, 'Boot |0⟩')
        setBackendConnected(true)
      } catch {
        if (!cancelled) {
          setBackendConnected(false)
          appendProbHistoryLocal(1, 0, 'Boot |0⟩ (fallback)')
        }
      }
    }

    bootstrapQuantum()
    return () => {
      cancelled = true
    }
  }, [])

  function transmit() {
    setTransmitTick((t) => t + 1)
    setStatus('Normal Transmission')
  }

  function sendMessage() {
    const next = (draftMessage || 'HELLO').toUpperCase()
    setSentMessage(next)
    if (mode === 'classical') {
      setDeterministicBits(toBinaryString(next))
      setStatus('Normal Transmission')
      setIsAttacked(false)
      setShowAttacker(false)
      setLastMeasurement('—')
      setSnrDb(30 + Math.random() * 6)
      setBer(0)
      transmit()
      return
    }
    setCiphertext(mockCiphertext(5))
    setIsAttacked(false)
    setShowAttacker(false)
    setLastMeasurement(null)
    transmit()
  }

  function generateEccKeys() {
    const pub = `PUB-${Math.random().toString(16).slice(2, 10).toUpperCase()}`
    const prv = `PRV-${Math.random().toString(16).slice(2, 10).toUpperCase()}`
    setEccPublicKey(pub)
    setEccPrivateKey(prv)
    setStatus('ECC key pair generated')
  }

  function encryptClassical() {
    const source = (draftMessage || sentMessage || 'HELLO').toUpperCase()
    const encrypted = mockEccEncrypt(source)
    setSentMessage(source)
    setCiphertext(encrypted)
    setDeterministicBits(toBinaryString(source))
    setStatus('Message encrypted using ECC (conceptual)')
  }

  function decryptClassical() {
    const target = receivedCiphertext || ciphertext
    const decrypted = mockEccDecrypt(target)
    setDecryptedMessage(decrypted || 'DECRYPTION_FAILED')
    setStatus(decrypted ? 'Message decrypted' : 'Decrypt failed (tampered data)')
  }

  function sendClassical() {
    if (!ciphertext) encryptClassical()
    setTransmitTick((t) => t + 1)
    setStatus('Normal Transmission')
  }

  function receiveClassical() {
    const incoming = isAttacked ? corruptCiphertext(ciphertext) : ciphertext
    setReceivedCiphertext(incoming)
    setStatus('Normal Transmission')
  }

  async function init0() {
    setIsAttacked(false)
    setShowAttacker(false)
    setLastMeasurement(null)
    try {
      const data = await postQuantum('/quantum/init', { state: '0' })
      syncQuantumState(data, 'Init |0⟩')
      setBackendConnected(true)
    } catch {
      setBackendConnected(false)
      setP0(1)
      setP1(0)
      setThetaDeg(0)
      setPhiDeg(0)
      appendProbHistoryLocal(1, 0, 'Init |0⟩ (fallback)')
    }
    transmit()
  }

  async function init1() {
    setIsAttacked(false)
    setShowAttacker(false)
    setLastMeasurement(null)
    try {
      const data = await postQuantum('/quantum/init', { state: '1' })
      syncQuantumState(data, 'Init |1⟩')
      setBackendConnected(true)
    } catch {
      setBackendConnected(false)
      setP0(0)
      setP1(1)
      setThetaDeg(180)
      setPhiDeg(0)
      appendProbHistoryLocal(0, 1, 'Init |1⟩ (fallback)')
    }
    transmit()
  }

  async function initSuperposition() {
    setIsAttacked(false)
    setShowAttacker(false)
    setLastMeasurement(null)
    try {
      const data = await postQuantum('/quantum/init', { state: 'superposition' })
      syncQuantumState(data, 'Superposition')
      setBackendConnected(true)
    } catch {
      setBackendConnected(false)
      setP0(0.5)
      setP1(0.5)
      setThetaDeg(90)
      setPhiDeg(45)
      appendProbHistoryLocal(0.5, 0.5, 'Superposition (fallback)')
    }
    transmit()
  }

  async function applyH() {
    if (mode === 'classical') {
      setIsAttacked(false)
      setP0(0.5)
      setP1(0.5)
      setThetaDeg(90)
      setPhiDeg(0)
      setStatus('Classical transform: balanced signal mix')
      return
    }
    setIsAttacked(false)
    try {
      const data = await postQuantum('/quantum/gate', { gate: 'H' })
      syncQuantumState(data, 'H')
      setBackendConnected(true)
    } catch {
      setBackendConnected(false)
      setP0(0.5)
      setP1(0.5)
      setThetaDeg(90)
      setPhiDeg((d) => d + 25)
      appendProbHistoryLocal(0.5, 0.5, 'H (fallback)')
    }
    setStatus('Gate applied: H')
  }

  async function applyX() {
    if (mode === 'classical') {
      setIsAttacked(false)
      setP0((v) => 1 - v)
      setP1((v) => 1 - v)
      setThetaDeg((t) => (t + 180) % 360)
      setStatus('Classical transform: bit inversion')
      return
    }
    setIsAttacked(false)
    const prevP0 = p0
    const prevP1 = p1
    try {
      const data = await postQuantum('/quantum/gate', { gate: 'X' })
      syncQuantumState(data, 'X')
      setBackendConnected(true)
    } catch {
      setBackendConnected(false)
      setP0((v) => (v === 1 ? 0 : v === 0 ? 1 : v))
      setP1((v) => (v === 1 ? 0 : v === 0 ? 1 : v))
      setThetaDeg((t) => (t + 180) % 360)
      const n0 = prevP0 === 1 ? 0 : prevP0 === 0 ? 1 : prevP0
      const n1 = prevP1 === 1 ? 0 : prevP1 === 0 ? 1 : prevP1
      appendProbHistoryLocal(n0, n1, 'X (fallback)')
    }
    setStatus('Gate applied: X')
  }

  async function applyZ() {
    if (mode === 'classical') {
      setIsAttacked(false)
      setPhiDeg((d) => (d + 45) % 360)
      setStatus('Classical transform: phase/tag update')
      return
    }
    setIsAttacked(false)
    const p0b = p0
    const p1b = p1
    try {
      const data = await postQuantum('/quantum/gate', { gate: 'Z' })
      syncQuantumState(data, 'Z')
      setBackendConnected(true)
    } catch {
      setBackendConnected(false)
      setPhiDeg((d) => (d + 90) % 360)
      appendProbHistoryLocal(p0b, p1b, 'Z (fallback)')
    }
    setStatus('Gate applied: Z (phase)')
  }

  async function measure() {
    if (mode === 'classical') {
      const result = p0 === p1 ? (Math.random() < 0.5 ? 0 : 1) : p0 > p1 ? 0 : 1
      setLastMeasurement(result === 0 ? '0' : '1')
      setP0(result === 0 ? 1 : 0)
      setP1(result === 1 ? 1 : 0)
      setThetaDeg(result === 0 ? 0 : 180)
      setStatus(`Classical decode output: ${result}`)
      transmit()
      return
    }
    let result = null
    try {
      const data = await postQuantum('/quantum/measure', {})
      syncQuantumState(data, 'Measure')
      result = data.measurement
      setBackendConnected(true)
    } catch {
      setBackendConnected(false)
      const r = Math.random()
      result = r < clamp01(p0) ? 0 : 1
      if (result === 0) {
        setP0(1)
        setP1(0)
        setThetaDeg(0)
        appendProbHistoryLocal(1, 0, 'Measure (fallback)')
      } else {
        setP0(0)
        setP1(1)
        setThetaDeg(180)
        appendProbHistoryLocal(0, 1, 'Measure (fallback)')
      }
    }
    setLastMeasurement(result === 0 ? '0' : '1')
    setStatus(`Measured: ${result}`)
    transmit()
  }

  async function simulateAttack() {
    setShowAttacker(true)

    if (mode === 'classical') {
      setIsAttacked(true)
      setStatus('Normal Transmission')
      setCiphertext((ct) => corruptCiphertext(ct || ''))
      setBer(Math.min(1, ber + 0.08))
      setSnrDb(Math.max(8, snrDb - 6))
      setTransmitTick((t) => t + 1)

      window.setTimeout(() => setShowAttacker(false), 1100)
      return
    }

    try {
      const data = await postQuantum('/quantum/mitm', { mode: 'quantum' })
      syncQuantumState(data, 'MITM')
      setIsAttacked(!!data.detected)
      setStatus(data.detected ? '⚠️ MITM Attack Detected' : 'Transmission Completed')
      setBackendConnected(true)
    } catch {
      setBackendConnected(false)
      setIsAttacked(true)
      setStatus('⚠️ MITM Attack Detected')
      const disturbed = randInt(0, 2)
      if (disturbed === 0) {
        setP0(1)
        setP1(0)
        setThetaDeg(0)
        appendProbHistoryLocal(1, 0, 'MITM (fallback)')
      } else if (disturbed === 1) {
        setP0(0)
        setP1(1)
        setThetaDeg(180)
        appendProbHistoryLocal(0, 1, 'MITM (fallback)')
      } else {
        setP0(0.5)
        setP1(0.5)
        setThetaDeg(90)
        appendProbHistoryLocal(0.5, 0.5, 'MITM (fallback)')
      }
      setPhiDeg((d) => (d + randInt(40, 140)) % 360)
    }
    setTransmitTick((t) => t + 1)

    window.setTimeout(() => setShowAttacker(false), 1300)
  }

  function clearProbHistory() {
    setProbHistory([])
  }

  async function applyRyQuantum() {
    if (mode !== 'quantum') return
    setIsAttacked(false)
    try {
      const data = await postQuantum('/quantum/ry', { angle_deg: ryAngleDeg })
      syncQuantumState(data, `Ry(${ryAngleDeg}°)`)
      setBackendConnected(true)
    } catch {
      setBackendConnected(false)
      const rad = (ryAngleDeg * Math.PI) / 180
      const p0v = Math.cos(rad / 2) ** 2
      const p1v = Math.sin(rad / 2) ** 2
      const z = p0v - p1v
      const zc = Math.max(-1, Math.min(1, z))
      const theta = (Math.acos(zc) * 180) / Math.PI
      setP0(p0v)
      setP1(p1v)
      setThetaDeg(theta)
      setPhiDeg(0)
      appendProbHistoryLocal(p0v, p1v, `Ry(${ryAngleDeg}°) (fallback)`)
    }
    setStatus(`Ry(${ryAngleDeg}°) applied`)
    transmit()
  }

  async function runAlgorithmBellPrep() {
    if (mode !== 'quantum') return
    setIsAttacked(false)
    setShowAttacker(false)
    setLastMeasurement(null)
    try {
      let data = await postQuantum('/quantum/init', { state: '0' })
      syncQuantumState(data, 'Bell: |0⟩')
      data = await postQuantum('/quantum/gate', { gate: 'H' })
      syncQuantumState(data, 'Bell: H')
      setBackendConnected(true)
    } catch {
      setBackendConnected(false)
      setP0(0.5)
      setP1(0.5)
      setThetaDeg(90)
      setPhiDeg(0)
      appendProbHistoryLocal(0.5, 0.5, 'Bell prep (fallback)')
    }
    transmit()
    setStatus('Algorithm: Bell prep (|0⟩→H)')
  }

  async function runAlgorithmDeutschConstant() {
    if (mode !== 'quantum') return
    setIsAttacked(false)
    setShowAttacker(false)
    setLastMeasurement(null)
    try {
      let data = await postQuantum('/quantum/init', { state: '0' })
      syncQuantumState(data, 'DJ const: |0⟩')
      data = await postQuantum('/quantum/gate', { gate: 'H' })
      syncQuantumState(data, 'DJ const: H')
      data = await postQuantum('/quantum/gate', { gate: 'H' })
      syncQuantumState(data, 'DJ const: H')
      setBackendConnected(true)
    } catch {
      setBackendConnected(false)
      setP0(1)
      setP1(0)
      setThetaDeg(0)
      setPhiDeg(0)
      appendProbHistoryLocal(1, 0, 'DJ const (fallback)')
    }
    transmit()
    setStatus('Algorithm: Deutsch–Jozsa constant (H·H)')
  }

  async function runAlgorithmDeutschBalanced() {
    if (mode !== 'quantum') return
    setIsAttacked(false)
    setShowAttacker(false)
    setLastMeasurement(null)
    try {
      let data = await postQuantum('/quantum/init', { state: '0' })
      syncQuantumState(data, 'DJ bal: |0⟩')
      data = await postQuantum('/quantum/gate', { gate: 'H' })
      syncQuantumState(data, 'DJ bal: H')
      data = await postQuantum('/quantum/gate', { gate: 'Z' })
      syncQuantumState(data, 'DJ bal: Z')
      data = await postQuantum('/quantum/gate', { gate: 'H' })
      syncQuantumState(data, 'DJ bal: H')
      setBackendConnected(true)
    } catch {
      setBackendConnected(false)
      setP0(0)
      setP1(1)
      setThetaDeg(180)
      setPhiDeg(0)
      appendProbHistoryLocal(0, 1, 'DJ balanced (fallback)')
    }
    transmit()
    setStatus('Algorithm: Deutsch–Jozsa balanced (H·Z·H)')
  }

  return (
    <div className="relative flex min-h-svh flex-col overflow-y-auto lg:h-svh lg:max-h-svh lg:overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-neon-purple/10 blur-3xl" />
          <div className="absolute right-8 top-32 h-72 w-72 rounded-full bg-neon-cyan/10 blur-3xl" />
          <div className="absolute left-1/3 bottom-10 h-72 w-72 rounded-full bg-neon-blue/10 blur-3xl" />
          <div className="absolute inset-0 bg-neon-grid opacity-40 [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]" />
        </div>

        <div className="relative mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6">
          <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.35em] text-slate-400">
                Quantum Visual Simulator
              </div>
              <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-100">
                MITM Attack Detection (Conceptual)
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="hidden rounded-full border border-neon-cyan/20 bg-void-950/35 px-3 py-1 text-xs text-slate-300 md:inline">
                Classical ECC: conceptual · Quantum: qubit disturbance
              </div>
              <div
                className={[
                  'rounded-full border px-3 py-1 text-xs',
                  backendConnected
                    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                    : 'border-amber-400/30 bg-amber-400/10 text-amber-300',
                ].join(' ')}
              >
                {backendConnected ? 'Qiskit backend connected' : 'Conceptual fallback mode'}
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
                  Classical Mode
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
                  Quantum Mode
                </button>
                <ExplainIcon
                  onClick={() => explain(mode === 'classical' ? 'modeClassical' : 'modeQuantum')}
                  label="Explain current mode"
                />
              </div>

              <button
                onClick={() => setLearningMode((v) => !v)}
                className={[
                  'rounded-xl border px-3 py-1 text-xs font-semibold transition',
                  learningMode
                    ? 'border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan shadow-glowCyan'
                    : 'border-white/10 bg-void-950/30 text-slate-300 hover:text-slate-100',
                ].join(' ')}
                title="Toggle learning mode"
              >
                Learning Mode {learningMode ? 'ON' : 'OFF'}
              </button>
              <ExplainIcon onClick={() => explain('learningMode')} label="Explain learning mode" />
            </div>
          </div>

          <div className="mb-4 shrink-0">
            <InputBar
              draft={draftMessage}
              setDraft={setDraftMessage}
              onSend={sendMessage}
              isAttacked={isAttacked}
              onExplain={explain}
            />
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-4 lg:[grid-template-rows:minmax(0,1fr)]">
            <div className="flex min-h-0 flex-col lg:col-span-3">
              <ControlPanel
                mode={mode}
                setMode={setMode}
                currentStateLabel={currentStateLabel}
                lastMeasurement={lastMeasurement}
                isAttacked={isAttacked}
                onExplain={explain}
                onInit0={init0}
                onInit1={init1}
                onSuperposition={initSuperposition}
                onH={applyH}
                onX={applyX}
                onZ={applyZ}
                onMeasure={measure}
                onAttack={simulateAttack}
                onGenerateKeys={generateEccKeys}
                onEncrypt={encryptClassical}
                onDecrypt={decryptClassical}
                onSendClassical={sendClassical}
                onReceiveClassical={receiveClassical}
                ryAngleDeg={ryAngleDeg}
                setRyAngleDeg={setRyAngleDeg}
                onApplyRy={applyRyQuantum}
                onAlgorithmBell={runAlgorithmBellPrep}
                onAlgorithmDeutschConst={runAlgorithmDeutschConstant}
                onAlgorithmDeutschBal={runAlgorithmDeutschBalanced}
                onClearProbHistory={clearProbHistory}
              />
            </div>

            <div className="flex min-h-[200px] flex-col lg:col-span-6 lg:min-h-0">
              <BlochSphere
                mode={mode}
                thetaDeg={thetaDeg}
                phiDeg={phiDeg}
                p0={p0}
                p1={p1}
                isAttacked={isAttacked}
                attackVisual={attackVisual}
                showAttacker={showAttacker}
                transmitTick={transmitTick}
                onExplain={(k) => (k ? explain(k) : null)}
                classicalBits={deterministicBits}
                snr={snrDb}
                ber={ber}
              />
            </div>

            <div className="flex min-h-0 flex-col lg:col-span-3">
              <InfoPanel
                mode={mode}
                p0={p0}
                p1={p1}
                status={status}
                plaintext={sentMessage || '—'}
                ciphertext={ciphertext}
                qubitEncoding={qubitEncoding}
                isAttacked={isAttacked}
                deterministicBits={deterministicBits}
                receivedCiphertext={receivedCiphertext}
                decryptedMessage={decryptedMessage}
                probHistory={probHistory}
                onExplain={(k) => (k ? explain(k) : null)}
              />
            </div>
          </div>

          <div className="mt-4 shrink-0 text-xs text-slate-500">
            Visualization-only simulator (not real cryptography or quantum physics).
            {!backendConnected ? ' Start backend API to enable Qiskit simulation.' : ''}
          </div>
        </div>

        <AnimatePresence>
          {mode === 'quantum' && isAttacked ? (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2"
            >
              <div className="rounded-2xl border border-neon-red/40 bg-void-950/70 px-4 py-2 text-sm font-semibold text-neon-red shadow-[0_0_30px_rgba(251,113,133,0.25)] backdrop-blur">
                ⚠️ MITM Attack Detected (quantum disturbance)
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <ExplanationPanel
          open={explainOpen}
          learningMode={learningMode}
          topic={explanationContent}
          onClose={() => setExplainOpen(false)}
        />
      </div>
  )
}
