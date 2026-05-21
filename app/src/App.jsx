import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas"; 
import "./App.css";

import ControlButton from "./components/ControlButton";
import SpectrumChart from "./components/SpectrumChart";
import { 
  getCurrentSpectrum, 
  formatSpectrum, 
  startSimulation,
  stopSimulation,
  setSimulationTime
} from "./api";

// Originally an example timestamp looks like: 2026-04-10T14:17:01.817
// This function's goal is to format it into: 14:16:16.689
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
 
  // Function that saves the image of the current spectrum
  async function handleTakeScreenshot() {
    // chartRef is directly attached to the Spectrum Chart
    // which allows us to take a screenshot of it on a specific time
    if (!chartRef.current) return;

    // Taking a screenshot of the HTML element referenced by chartRef.current
    const canvas = await html2canvas(chartRef.current, {
      backgroundColor: null,
    });

    // Converting the canvas content into a PNG image encoded as a Base64 data URL
    const image = canvas.toDataURL("image/png");
    // Creating a temporary invisible anchor element that will be used to trigger the download
    const link = document.createElement("a");

    link.href = image;
    link.download = `spectrum-${currentTimestamp}.png`;
    
    // Finally programmatically clicking the link to start downloading
    link.click();
  }

  // This function is used on the dropdown element for timestamp selection
  async function handleTimestampSelect(event) {
    // index amongst the timestamps array
    const index = event.target.value;
    const selectedTimestamp = everyTimestamp[index];

    // After the selection is done, assigning values to necessary variables
    // Also pausing for a while to decide on whether to continue from here or reset the simulation
    setSelectedTimestampIndex(index);
    setCurrentTimestamp(selectedTimestamp);
    setTimerAnchor(null);
    setIsRunning(false);

    try {
      setErrorMessage("");

      // set-simulation-time endpoint is being triggered here to 
      // set the selected timestamp in the backend as well
      await setSimulationTime(selectedTimestamp);

      // then fetching the data from the simulator.py again
      await fetchSpectrum();

      // setting the timestamp being used in the UI with the new data
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

        // formatSpectrum function returns us with 
        // both wavenumber and absorvance values
        const chartData = formatSpectrum(apiData);

        // After successfull fetching the request, assigning values no related variables
        setSpectrumData(chartData);
        setMinLimit(apiData.min_limit);
        setMaxLimit(apiData.max_limit);
        setCurrentTimestamp(apiData.current_timestamp);
        setEveryTimestamp(Object.values(apiData.every_timestamp)); // convert to array 
        setPauseTime(apiData.pause_time);

        // also, finally handling the time transition to iterate the timer
        if (isRunning) {
          setTimerAnchor({
            apiTimestamp: apiData.current_timestamp,
            browserTime: Date.now(),
          });
        }
      } catch (error) {
        setErrorMessage(error.message);
      }
    }
  
  // When start button pressed
  async function handleStart() {
    await startSimulation();

    // to have the functionality of having both start and pause
    setIsRunning((current) => !current);
  }

  // When stop button pressed
  async function handleStop() {
    await stopSimulation();

    // change running state to false to wait for further action
    setIsRunning(false);
    setTimerAnchor(null);
    setSelectedTimestampIndex("");

    // Immediate visual reset in spectrum chart
    setSpectrumData([]);
    setCurrentTimestamp(everyTimestamp[0] ?? null);

    try {
      setErrorMessage("");

      if (everyTimestamp.length > 0) {
        await setSimulationTime(everyTimestamp[0]);
      }

      await fetchSpectrum();
    } catch (error) {
      setErrorMessage(error.message);
    }
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
      <div className="app-container">
        {errorMessage && <p>{errorMessage}</p>}

        {!errorMessage && (
          <>
            <section className="dashboard">
              <div className="left-column">
                <div ref={chartRef}>
                  <SpectrumChart 
                    data={spectrumData}
                    minLimit={minLimit}
                    maxLimit={maxLimit}
                  />
                </div>
              </div>
              <div className="right-column">
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
                
                <div className="controls">
                  <ControlButton
                    icon={isRunning ? "||" : "▷"}
                    variant="start"
                    onClick={handleStart}
                  />

                  <ControlButton
                    icon="■"
                    variant="stop"
                    onClick={handleStop}
                  />

                  <ControlButton
                    icon="⤓"
                    variant="start"
                    onClick={handleTakeScreenshot}
                  />
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default App;