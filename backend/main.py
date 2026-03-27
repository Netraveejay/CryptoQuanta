from __future__ import annotations

import math
import random
from typing import Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector


app = FastAPI(title="Quantum Visual Simulator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SessionRequest(BaseModel):
    session_id: str


class InitRequest(SessionRequest):
    state: str  # "0" | "1" | "superposition"


class GateRequest(SessionRequest):
    gate: str  # "H" | "X" | "Z"


class MitmRequest(SessionRequest):
    mode: str  # "classical" | "quantum"


class RyRequest(SessionRequest):
    angle_deg: float


SESSIONS: Dict[str, Statevector] = {}


def get_or_create_state(session_id: str) -> Statevector:
    if session_id not in SESSIONS:
        SESSIONS[session_id] = Statevector.from_label("0")
    return SESSIONS[session_id]


def set_state(session_id: str, state: Statevector) -> Statevector:
    SESSIONS[session_id] = state
    return state


def apply_gate(state: Statevector, gate: str) -> Statevector:
    qc = QuantumCircuit(1)
    g = gate.upper()
    if g == "H":
        qc.h(0)
    elif g == "X":
        qc.x(0)
    elif g == "Z":
        qc.z(0)
    else:
        raise ValueError(f"Unsupported gate {gate}")
    return state.evolve(qc)


def to_response_payload(state: Statevector, **extra):
    alpha = complex(state.data[0])
    beta = complex(state.data[1])

    p0 = abs(alpha) ** 2
    p1 = abs(beta) ** 2

    ab = alpha * beta.conjugate()
    x = 2 * ab.real
    y = 2 * ab.imag
    z = p0 - p1

    z_clamped = max(-1.0, min(1.0, z))
    theta = math.degrees(math.acos(z_clamped))
    phi = (math.degrees(math.atan2(y, x)) + 360.0) % 360.0

    if abs(p0 - 1.0) < 1e-9:
        state_label = "|0⟩"
    elif abs(p1 - 1.0) < 1e-9:
        state_label = "|1⟩"
    elif abs(p0 - 0.5) < 1e-9 and abs(p1 - 0.5) < 1e-9:
        state_label = "Superposition (|0⟩ + |1⟩)"
    else:
        state_label = f"Mixed (P0={p0:.2f}, P1={p1:.2f})"

    payload = {
        "p0": p0,
        "p1": p1,
        "theta_deg": theta,
        "phi_deg": phi,
        "state_label": state_label,
    }
    payload.update(extra)
    return payload


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/quantum/init")
def quantum_init(req: InitRequest):
    if req.state == "0":
        sv = Statevector.from_label("0")
    elif req.state == "1":
        sv = Statevector.from_label("1")
    elif req.state == "superposition":
        qc = QuantumCircuit(1)
        qc.h(0)
        sv = Statevector.from_label("0").evolve(qc)
    else:
        sv = Statevector.from_label("0")

    set_state(req.session_id, sv)
    return to_response_payload(sv)


@app.post("/quantum/gate")
def quantum_gate(req: GateRequest):
    state = get_or_create_state(req.session_id)
    next_state = apply_gate(state, req.gate)
    set_state(req.session_id, next_state)
    return to_response_payload(next_state, gate=req.gate.upper())


@app.post("/quantum/ry")
def quantum_ry(req: RyRequest):
    """Single-qubit rotation Ry(θ) — θ in degrees."""
    state = get_or_create_state(req.session_id)
    qc = QuantumCircuit(1)
    qc.ry(math.radians(req.angle_deg), 0)
    next_state = state.evolve(qc)
    set_state(req.session_id, next_state)
    return to_response_payload(next_state, gate="RY", angle_deg=req.angle_deg)


@app.post("/quantum/measure")
def quantum_measure(req: SessionRequest):
    state = get_or_create_state(req.session_id)
    alpha = complex(state.data[0])
    p0 = abs(alpha) ** 2

    result = 0 if random.random() < p0 else 1
    collapsed = Statevector.from_label("0" if result == 0 else "1")
    set_state(req.session_id, collapsed)

    return to_response_payload(collapsed, measurement=result)


@app.post("/quantum/mitm")
def quantum_mitm(req: MitmRequest):
    state = get_or_create_state(req.session_id)
    before = to_response_payload(state)

    if req.mode == "classical":
        return {
            **before,
            "detected": False,
            "disturbed": False,
            "mode": "classical",
        }

    alpha = complex(state.data[0])
    p0 = abs(alpha) ** 2
    eve_result = 0 if random.random() < p0 else 1
    collapsed = Statevector.from_label("0" if eve_result == 0 else "1")
    set_state(req.session_id, collapsed)
    after = to_response_payload(collapsed)

    disturbed = (
        abs(before["p0"] - after["p0"]) > 1e-9
        or abs(before["p1"] - after["p1"]) > 1e-9
    )
    return {
        **after,
        "detected": True,
        "disturbed": disturbed,
        "mode": "quantum",
    }


@app.post("/quantum/plot-data")
def quantum_plot_data(req: SessionRequest):
    state = get_or_create_state(req.session_id)
    payload = to_response_payload(state)
    return {
        "bloch_vector": {
            "theta_deg": payload["theta_deg"],
            "phi_deg": payload["phi_deg"],
            "length": 1.0,
        },
        "probabilities": {"p0": payload["p0"], "p1": payload["p1"]},
    }
