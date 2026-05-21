const API_BASE_URL = "http://127.0.0.1:8000";

export async function getCurrentSpectrum() {
  const response = await fetch(`${API_BASE_URL}/current-spectrum`);

  if (!response.ok) {
    throw new Error("Failed to fetch current spectrum");
  }

  return response.json();
}

export async function startSimulation() {
  const response = await fetch(`${API_BASE_URL}/start`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to start simulation");
  }

  return response.json();
}

export async function stopSimulation() {
  const response = await fetch(`${API_BASE_URL}/stop`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to stop simulation");
  }

  return response.json();
}

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

export function formatSpectrum(apiData) {
  return apiData.wavenumbers.map((wavenumber, index) => ({
    wavenumber,
    absorbance: apiData.spectrum[index],
  }));
}
