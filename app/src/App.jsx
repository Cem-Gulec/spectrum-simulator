import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas"; 
import "./App.css";

import SidePanel from "./components/SidePanel";
import ControlButton from "./components/ControlButton";
import SpectrumChart from "./components/SpectrumChart";
import { 
  getCurrentSpectrum, 
  formatSpectrum, 
  startSimulation,
  stopSimulation,
  setSimulationTime
} from "./api";

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
  const [everyTimestamp, setEveryTimestamp] = useState([]);
  const [selectedTimestampIndex, setSelectedTimestampIndex] = useState("");
  const [pauseTime, setPauseTime] = useState(null);
  const [timerAnchor, setTimerAnchor] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const chartRef = useRef(null);

  const timerText = formatTimestamp(currentTimestamp);

  
  async function handleTakeScreenshot() {
    if (!chartRef.current) return;

    const canvas = await html2canvas(chartRef.current, {
      backgroundColor: null,
    });

    const image = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = image;
    link.download = `spectrum-${Date.now()}.png`;
    link.click();
  }

  async function handleTimestampSelect(event) {
    const index = event.target.value;
    const selectedTimestamp = everyTimestamp[index];

    setSelectedTimestampIndex(index);
    setCurrentTimestamp(selectedTimestamp);
    setTimerAnchor(null);
    setIsRunning(false);

    try {
      setErrorMessage("");

      await setSimulationTime(selectedTimestamp);
      await fetchSpectrum();

      setCurrentTimestamp(selectedTimestamp);
      setTimerAnchor(null);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function fetchSpectrum() {
      try {
        setErrorMessage("");

        const apiData = await getCurrentSpectrum();
        const chartData = formatSpectrum(apiData);

        setSpectrumData(chartData);
        setMinLimit(apiData.min_limit);
        setMaxLimit(apiData.max_limit);
        setCurrentTimestamp(apiData.current_timestamp);
        setEveryTimestamp(Object.values(apiData.every_timestamp)); // convert to array 
        setPauseTime(apiData.pause_time);

        setTimerAnchor({
          apiTimestamp: apiData.current_timestamp,
          browserTime: Date.now(),
        });
      } catch (error) {
        setErrorMessage(error.message);
      }
    }

  async function handleStart() {
    await startSimulation();
    setIsRunning((current) => !current);
  }

  async function handleStop() {
    await stopSimulation();

    setIsRunning(false);
    setTimerAnchor(null);

    await fetchSpectrum();
  }

  // For fetching spectrum data
  useEffect(() => {
    // Initial fetch
    fetchSpectrum();

    // If stopped, do not create interval
    if (!isRunning) return;

    const intervalId = setInterval(fetchSpectrum, pauseTime * 1000);

    return () => {
      clearInterval(intervalId);
    };

  }, [isRunning, pauseTime]);

  // For setting smooth transition on timer
  useEffect(() => {
    if (!timerAnchor || !isRunning) return;

    const timerIntervalId = setInterval(() => {
      const apiTime = new Date(timerAnchor.apiTimestamp).getTime();
      const elapsedBrowserTime = Date.now() - timerAnchor.browserTime;

      const smoothTime = apiTime + elapsedBrowserTime;

      setCurrentTimestamp(new Date(smoothTime).toISOString());
    }, 50);

    return () => {
      clearInterval(timerIntervalId);
    };
  }, [timerAnchor, isRunning]);

  return (
    <main className="app">
      {errorMessage && <p>{errorMessage}</p>}

      {!errorMessage && (
        <>
          <section className="timer">
            <h1>{timerText}</h1>
            <select
              value={selectedTimestampIndex}
              onChange={handleTimestampSelect}
            >
              <option value="">Select timestamp</option>

              {everyTimestamp.map((timestamp, index) => (
                <option key={index} value={index}>
                  {index} - {formatTimestamp(timestamp)}
                </option>
              ))}
            </select>
          </section>

          <section className="dashboard">
            <div className="left-column">
              <div ref={chartRef}>
                <SpectrumChart 
                  data={spectrumData}
                  minLimit={minLimit}
                  maxLimit={maxLimit}
                />
              </div>
              <div className="controls">
                <ControlButton
                  icon={isRunning ? "||" : "▷"}
                  variant="start"
                  onClick={handleStart}
                />

                <ControlButton
                  icon="▫"
                  variant="stop"
                  onClick={handleStop}
                />
              </div>
            </div>
          
          <SidePanel onTakeScreenshot={handleTakeScreenshot} />
          </section>
        </>
      )}
    </main>
  );
}

export default App;