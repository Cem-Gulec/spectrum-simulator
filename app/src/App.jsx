import { useEffect, useState } from "react";
import "./App.css";

import SpectrumChart from "./components/SpectrumChart";
import { getCurrentSpectrum, formatSpectrum } from "./api";

function formatTimestamp(timestamp) {
  if (!timestamp) {
    return "--:--:--.---";
  }

  const date = new Date(timestamp);

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

function App() {
  const [spectrumData, setSpectrumData] = useState([]);
  const [minLimit, setMinLimit] = useState(null);
  const [maxLimit, setMaxLimit] = useState(null);
  const [currentTimestamp, setCurrentTimestamp] = useState(null);
  const [pauseTime, setPauseTime] = useState(null);
  const [timerAnchor, setTimerAnchor] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const timerText = formatTimestamp(currentTimestamp);

  useEffect(() => {
    let isMounted = true;

    async function fetchSpectrum() {
      try {
        setErrorMessage("");

        const apiData = await getCurrentSpectrum();
        const chartData = formatSpectrum(apiData);

        if (!isMounted) return;

        setSpectrumData(chartData);
        setMinLimit(apiData.min_limit);
        setMaxLimit(apiData.max_limit);
        setCurrentTimestamp(apiData.current_timestamp);
        setPauseTime(apiData.pause_time);

        setTimerAnchor({
          apiTimestamp: apiData.current_timestamp,
          browserTime: Date.now(),
        });
      } catch (error) {
        if (!isMounted) return;

        setErrorMessage(error.message);
      } finally {
      }
    }

    fetchSpectrum();

    const intervalId = setInterval(fetchSpectrum, pauseTime * 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };

  }, []);

  useEffect(() => {
    if (!timerAnchor) return;

    const timerIntervalId = setInterval(() => {
      const apiTime = new Date(timerAnchor.apiTimestamp).getTime();
      const elapsedBrowserTime = Date.now() - timerAnchor.browserTime;

      const smoothTime = apiTime + elapsedBrowserTime;

      setCurrentTimestamp(new Date(smoothTime).toISOString());
    }, 50);

    return () => {
      clearInterval(timerIntervalId);
    };
  }, [timerAnchor]);

  return (
    <main className="app">
      {errorMessage && <p>{errorMessage}</p>}

      {!errorMessage && (
        <>
          <section className="timer">
            <h1>{timerText}</h1>
          </section>
          <SpectrumChart 
            data={spectrumData}
            minLimit={minLimit}
            maxLimit={maxLimit}
          />
        </>
      )}
    </main>
  );
}

export default App;