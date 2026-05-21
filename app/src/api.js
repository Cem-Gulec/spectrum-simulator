const API_BASE_URL = "http://127.0.0.1:8000";

// Current spectrum always being updated by the simulator 
// So, its one of the most important request being done, directly used to chart live data
export async function getCurrentSpectrum() {
  const response = await fetch(`${API_BASE_URL}/current-spectrum`);

  if (!response.ok) {
    throw new Error("Failed to fetch current spectrum");
  }

  return response.json();
}

// Triggers the start function inside the simulator.py to change the running state
// This endpoint has the ability to both start and pause the simulation
export async function startSimulation() {
  const response = await fetch(`${API_BASE_URL}/start`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to start simulation");
  }

  return response.json();
}

// Triggers the stop function which resets the simulation to its first timestamp
export async function stopSimulation() {
  const response = await fetch(`${API_BASE_URL}/stop`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to stop simulation");
  }

  return response.json();
}

// For a given timestamp parameter, this endpoint is able to set the time there immediately
export async function setSimulationTime(timestamp) {
  const encodedTimestamp = encodeURIComponent(timestamp);

  const response = await fetch(
    `${API_BASE_URL}/set-simulation-time/${encodedTimestamp}`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to set simulation time");
  }

  return response.json();
}

// For parsing wavenumber and absorbance out of the api request made
export function formatSpectrum(apiData) {
  return apiData.wavenumbers.map((wavenumber, index) => ({
    wavenumber,
    absorbance: apiData.spectrum[index],
  }));
}
