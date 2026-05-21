import threading
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from simulator import create_simulator

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

simulator = create_simulator()

simulation_thread = threading.Thread(
    target=simulator.replay_simulation,
    daemon=True
)
simulation_thread.start()


@app.post("/start")
def start_simulation():
    simulator.start()

    return {
        "status": "started" if simulator.running else "paused",
        "running": simulator.running,
        "current_index": simulator.current_index
    }

@app.post("/pause")
def pause_simulation():
    simulator.pause()

    return {
        "status": "paused",
        "running": simulator.running,
        "current_index": simulator.current_index
    }

@app.post("/stop")
def stop_simulation():
    simulator.stop()

    return {
        "status": "stopped",
        "running": simulator.running,
        "current_index": simulator.current_index
    }

@app.get("/first-spectrum")
def get_first_spectrum():
    return {
        "current_index": 0,
        "spectrum": simulator.first_spectrum.tolist()
    }

@app.get("/last-spectrum")
def get_last_spectrum():
    return {
        "current_index": len(simulator.timestamps) - 1,
        "spectrum": simulator.last_spectrum.tolist()
    }

@app.get("/current-spectrum")
def get_current_spectrum():
    return {
        "current_index": simulator.current_index,
        "pause_time": simulator.pause_time,
        "spectrum": simulator.current_spectrum.tolist(),
        "wavenumbers": simulator.wavenumbers.tolist(),
        "min_limit": simulator.min_limit,
        "max_limit": simulator.max_limit,
        "first_timestamp": simulator.first_timestamp,
        "end_timestamp": simulator.end_timestamp,
        "current_timestamp": simulator.current_timestamp
    }

@app.put("/set-simulation-time/{timestamp}")
def set_simulation_time(timestamp):
    try:
        simulator.set_simulation_time(timestamp)

        return {
            "status": "simulation time updated",
            "current_index": simulator.current_index,
            "spectrum": simulator.current_spectrum.tolist()
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))