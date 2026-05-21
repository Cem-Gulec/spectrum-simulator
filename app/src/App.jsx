import { useMemo } from "react";
import "./App.css";

import SpectrumChart from "./components/SpectrumChart";
import { generateMockSpectrum } from "./data/mockSpectrum";

function App() {
  const spectrumData = useMemo(() => generateMockSpectrum(), []);

  return (
    <main className="app">
      <SpectrumChart data={spectrumData} />
    </main>
  );
}

export default App;