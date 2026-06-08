## Problem Definition

A **spectrometer** is a sensor that uses a light source and a light detector to measure how much light an examined sample absorbs at specific wavenumbers. The output at a point in time is called a **spectrum**. Here, a **spectrum** is a **1-dimensional array of 800 float values**, each describing the amount of light absorbed at a specific wavenumber.

Here is an example of a spectrum:

![Spectrum](./docs/example-spectrum.png)

A file with pre-recorded spectra can be found [Here](./data/spectra.csv). The first column contains **timestamps**, all other columns are **spectral absorbance values** at specific wavenumbers (1000-1799 cm^-1). Each row is a **timestamp-spectrum pair**. Rows are ordered by timestamp.

**Replay simulation** functionality is implemented for iterating over the data points from the CSV file in real-time speed (using the same time resolution as in the CSV data). The simulation runs in a continuous cycle, i.e the simulation time resets to the first timestamp after reaching `2026-04-10T14:17:10.000`.

Furthermore, spectrometer simulation have **control functionality** to start/continue and stop.

### How to Run

This project contains:
- Simulator running in **Python**
- **FastAPI** Backend: that exposes the **control functionality**, as well as the ability to **get the latest spectrum** and to **set the simulation time**.
- **React** Frontend

> [!NOTE]
> If another dataset needs to be run, its location should be at spectrum-simulator/data to work properly.
---

#### 4.1. Installation

```bash
# Go to the backend folder located at:
cd spectrum-simulator/src

# Create an environment
python -m venv spectrum-simulator
spectrum-simulator\Scripts\activate

# For linux:
source spectrum-simulator/bin/activate

# Install dependencies for Python
pip install -r ./../requirements.txt
```

```bash
# Go to the frontend folder located at:
cd ./../app

# Install React dependencies
npm install
```

#### 4.2. Running the Backend

```bash
# spectrum-simulator/src
cd ./../src
uvicorn api:app --reload
```

The backend API will start at:
```bash
http://127.0.0.1:8000
```

You can also see the documentation at:
```bash
http://127.0.0.1:8000/docs
```

#### 4.3. Running the Frontend

```bash
cd spectrum-simulator/app/src
npm run dev
```

React application will start at:
```bash
http://localhost:5173
```
