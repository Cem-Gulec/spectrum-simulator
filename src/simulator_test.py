import matplotlib.pyplot as plt
import pandas as pd
import time
from matplotlib.widgets import Button
from pathlib import Path


### -> This was the initial file that I started working on
### -> which allowed me to test every function in Part 1 and 2 with matplotlib elements.
### -> However, since the task requires a backend running indepedently from matplotlib
### -> and that can be manipulated easily and flexibly, later this code base is transfered
### -> into simulator.py.



# Parse different kinds of information inside the dataset
def parse_data(df):
    timestamps = df.iloc[:, 0]
    spectra = df.iloc[:, 1:]
    wavenumbers = spectra.columns.astype(int)

    return timestamps, spectra, wavenumbers

class SpectrumSimulator:
    def __init__(self, timestamps, spectra, wavenumbers):
        self.timestamps = timestamps
        self.spectra = spectra
        self.wavenumbers = wavenumbers

        # Control states
        self.running = False
        self.restart = False

        self.fig = None
        self.ax = None
        self.line = None

        self.start_button = None
        self.stop_button = None

        self.first_timestamp = pd.to_datetime(self.timestamps.iloc[0].strip())
        self.end_timestamp = pd.to_datetime("2026-04-10T14:17:10.000")

    def setup_plot(self):
        # Interactive mode on
        plt.ion()
        
        # Creating initial figure and a set of subplots
        self.fig, self.ax = plt.subplots()
        plt.subplots_adjust(bottom=0.25) # Leaving space for buttons

        # Configurations arranged for the plot
        self.ax.set_xlabel("Wavenumber (cm^-1)")
        self.ax.set_ylabel("Absorbance")
        
        # Putting a limitation on y axis 
        # based on the min, max among the spectra values
        self.ax.set_ylim(self.spectra.min().min(), self.spectra.max().max())

        # Plotting initial spectrum
        self.line, = self.ax.plot(self.wavenumbers, self.spectra.iloc[0])
        self.ax.set_title(f"Spectrum at t={str(self.timestamps.iloc[0])}")

    def setup_buttons(self):
        start_ax = plt.axes([0.45, 0.05, 0.05, 0.075])
        stop_ax = plt.axes([0.55, 0.05, 0.05, 0.075])

        self.start_button = Button(start_ax, "▶")
        self.stop_button = Button(stop_ax, "■")

        self.start_button.on_clicked(self.toggle_start)
        self.stop_button.on_clicked(self.stop)

    def toggle_start(self, event):
        self.running = not self.running

        if self.running:
            self.start_button.label.set_text("||")
        else:
            self.start_button.label.set_text("▶")

        self.fig.canvas.draw_idle()
    
    def stop(self, event):
        self.running = False
        self.restart = True

        self.start_button.label.set_text("▶")

        # Reset plot visually
        self.line.set_ydata(self.spectra.iloc[0])
        self.ax.set_title(f"Spectrum at t={str(self.timestamps.iloc[0])}")
        self.fig.canvas.draw_idle()

    def wait_until_running(self):
        while not self.running:
            plt.pause(0.05)
    
    # Plot consecutive spectrum values on each timestamp 
    def replay_simulation(self):
        self.setup_plot()
        self.setup_buttons()

        # Replay the simulation from the start 
        while True:
            self.wait_until_running()

            # Iterating over each timestamp
            for i in range(len(self.spectra)):
                
                # If restarted
                if self.restart:
                    self.restart = False
                    break
                
                # If paused, wait here
                pause_start = None

                while not self.running:
                    if self.restart:
                        self.restart = False
                        break

                    if pause_start is None:
                        pause_start = time.time()

                    plt.pause(0.05)
                
                if not self.running:
                    break
                
                # If we were paused, remove paused duration from timing
                if pause_start is not None:
                    paused_duration = time.time() - pause_start
                    start_time += paused_duration
                
                spectrum = self.spectra.iloc[i]
                timestamp = pd.to_datetime(self.timestamps.iloc[i].strip())

                # Updating the values for the current spectrum
                self.line.set_ydata(spectrum)
                self.ax.set_title(f"Spectrum at t={str(timestamp)}")

                if i == 0:
                    start_time = time.time()
                
                if i + 1 < len(self.spectra):
                    next_timestamp = pd.to_datetime(self.timestamps.iloc[i + 1].strip())
                
                # Set the timestamp for the end of the simulation
                else:
                    next_timestamp = self.end_timestamp
                
                # Computing the time to pause on the current timestamp
                # to match the simulation time
                real_time = (next_timestamp - self.first_timestamp).total_seconds()
                elapsed_time = time.time() - start_time
                
                # to avoid negative values
                pause_time = max(real_time - elapsed_time, 0)

                plt.pause(pause_time)

                if self.restart:
                    self.restart = False
                    break      
                                                                        

def main():
    data_path = Path("./../data/spectra.csv")

    df = pd.read_csv(data_path)
    timestamps, spectra, wavenumbers = parse_data(df)

    simulator = SpectrumSimulator(
        timestamps  = timestamps,
        spectra     = spectra,
        wavenumbers = wavenumbers
    )

    simulator.replay_simulation()


if __name__ == "__main__":
    main()