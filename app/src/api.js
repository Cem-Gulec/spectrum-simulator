const API_BASE_URL = "http://127.0.0.1:8000";

export async function getCurrentSpectrum() {
  const response = await fetch(`${API_BASE_URL}/current-spectrum`);

  if (!response.ok) {
    throw new Error("Failed to fetch current spectrum");
  }

  return response.json();
}

export function formatSpectrum(apiData) {
  return apiData.wavenumbers.map((wavenumber, index) => ({
    wavenumber,
    absorbance: apiData.spectrum[index],
  }));
}
