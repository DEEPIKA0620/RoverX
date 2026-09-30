# ROVERX

**Adaptive Autonomous Rover Path Planning & Dynamic Replanning Simulator**

> *"The rover doesn't just find a path. It adapts when the path changes."*

---

## 📌 Problem Statement (AI-PS-05)

Rovers operating in unknown, hostile planetary or terrestrial environments need to navigate safely while responding to dynamically changing terrain conditions and newly emerging obstacles. Traditional pathfinding algorithms compute a static route once at mission start; if an unmapped obstacle appears along the trajectory, conventional systems fail or reset completely back to the initial launch point.

---

## 💡 Solution

**ROVERX** is an interactive, real-time autonomous robotics control simulator. It combines **weighted terrain cost maps**, **A* path planning**, and **autonomous real-time route replanning**. 

When a dynamic obstacle blocks the rover during transit, ROVERX halts the rover, updates the environment cost matrix, recalculates a new optimal A* route starting from the rover's **CURRENT POSITION**, and seamlessly resumes navigation to the destination.

---

## 🔥 Key Features

- **Interactive 20x20 Terrain Grid**: Paint custom terrain types and place static obstacles directly on the interactive grid.
- **Weighted Cost Map**: 
  - 🟩 **NORMAL**: Cost = 1
  - 🟨 **ROUGH**: Cost = 3
  - 🟧 **DIFFICULT**: Cost = 7
  - 🟥 **HIGH RISK**: Cost = 15
  - 🟪 **RESTRICTED**: Cost = ∞
  - ⬛ **OBSTACLE**: Cost = ∞
- **Multi-Strategy Navigation Modes**:
  - **FASTEST**: Prioritizes physical Euclidean / Manhattan distance.
  - **BALANCED**: Balances travel distance and terrain traversal penalties.
  - **SAFEST**: Heavily penalizes high-risk terrain to maximize vehicle longevity.
- **Weighted A* Pathfinding Engine**: Calculates optimal paths based on accumulated cell traversal costs $f(n) = g(n) + h(n)$.
- **Autonomous Rover Movement Simulation**: Step-by-step visual animation along the planned path.
- **Dynamic Obstacle Injection & Detection**: Inject dynamic obstacles in real time while the rover is moving.
- **Automatic Path Replanning**: Instantly recalculates a new route from the rover's **current position** without restarting the mission.
- **Real-Time Telemetry & Analytics**: Measures distance planned vs. travelled, step count, terrain cost, planning time, replanning time, and safety cell breakdown.
- **One-Click Demo Mode (Judge Presentation Flow)**: Deterministic, automated scenario demonstrating the full PLAN → NAVIGATE → DETECT → REPLAN → RESUME → COMPLETE cycle in 30 seconds.

---

## 🏗️ Architecture & Core Navigation Cycle

```
React (Frontend UI)
       ↓  (REST API / Fallback Engine)
FastAPI (Python Engine)
       ↓
Path Planning Engine (Weighted Cost Map + A*)
       ↓
Dynamic Replanning & Rover Simulation
```

### The Autonomous Cycle
```
PLAN → NAVIGATE → DETECT → STOP → UPDATE MAP → REPLAN (from current pos) → RESUME → COMPLETE
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.9+)

### 1. Backend Setup (FastAPI Engine)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
*API will run at http://localhost:8000*

### 2. Frontend Setup (React + Vite + TailwindCSS)
```bash
cd frontend
npm install
npm run dev
```
*Application will run at http://localhost:5173*

---

## 🧪 Testing

### Backend Engine Verification
```bash
python backend/test_backend.py
```
Validates A* pathfinding on demo scenarios, navigation modes, safety metrics, and dynamic replanning logic.

---

## 📜 License

MIT License. Developed for AI-PS-05 Autonomous Robotics Path Planning.
