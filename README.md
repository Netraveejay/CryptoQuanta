# CryptoQuanta (Quantum Visual Simulator)

**React + Vite + Tailwind + Framer Motion** frontend: classical vs quantum MITM demo, Bloch sphere, probability history, learning explanations.

**Optional:** FastAPI + Qiskit backend (`backend/`) for real `Statevector` simulation.

```bash
npm install
npm run dev
```

### Backend (`backend/`)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Create `.env` in the project root (match port if you change it):

```
VITE_API_URL=http://127.0.0.1:8000
```

Without the backend, the UI uses **conceptual fallback** math.
