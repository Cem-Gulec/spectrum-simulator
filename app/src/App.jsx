import { useEffect, useState } from "react";
import "./App.css";

import SpectrumChart from "./components/SpectrumChart";
import { getCurrentSpectrum, formatSpectrum } from "./api";

function App() {
  const [spectrumData, setSpectrumData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchSpectrum() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const apiData = await getCurrentSpectrum();
        const chartData = formatSpectrum(apiData);

        setSpectrumData(chartData);
        setCurrentIndex(apiData.current_index);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSpectrum();
  }, []);

  return (
    <main className="app">
      {isLoading && <p>Loading spectrum...</p>}

      {errorMessage && <p>{errorMessage}</p>}

      {!isLoading && !errorMessage && (
        <>
          <SpectrumChart data={spectrumData} />
        </>
      )}
    </main>
  );
}

export default App;