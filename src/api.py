import threading
from fastapi import FastAPI
from simulator import create_simulator

app = FastAPI()
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
        "status": "started",
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
        "spectrum": simulator.current_spectrum.tolist()
    }