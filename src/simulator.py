import matplotlib.pyplot as plt
import pandas as pd
import time
from matplotlib.widgets import Button
from pathlib import Path

# Parse different kinds of information inside the dataset
def parse_data(df):
    timestamps = df.iloc[:, 0]
    spectra = df.iloc[:, 1:]
    wavenumbers = spectra.columns.astype(int)

    return timestamps, spectra, wavenumbers

# Plot consecutive spectrum values on each timestamp 
def replay_simulation(timestamps, spectra, wavenumbers):
    # Interactive mode on
    plt.ion()

    # Creating initial figure and a set of subplots
    fig, ax = plt.subplots()
    plt.subplots_adjust(bottom = 0.25) # Leaving space for buttons

    # Configurations arranged for the plot
    ax.set_xlabel("Wavenumber (cm^-1)")
    ax.set_ylabel("Absorbance")
    
    # Putting a limitation on y axis 
    # based on the min, max among the spectra values
    ax.set_ylim(spectra.min().min(), spectra.max().max())
    
    # Initial values are obtained to plot first format of the plot
    first_timestamp = pd.to_datetime(timestamps.iloc[0].strip())    
    line, = ax.plot(wavenumbers, spectra.iloc[0])

    # Control State
    running = {"value": False}
    restart = {"value": False}

    # Buttons
    start_ax = plt.axes([0.45, 0.05, 0.05, 0.075])
    stop_ax = plt.axes([0.55, 0.05, 0.05, 0.075])

    start_button = Button(start_ax, " ▶")
    stop_button = Button(stop_ax, "■")

    def start(event):
        running["value"] = not running["value"]

        if running["value"]:
            start_button.label.set_text("||")
        else:
            start_button.label.set_text("▶")

        fig.canvas.draw_idle()

    def stop(event):
        running["value"] = False
        restart["value"] = True

        start_button.label.set_text("▶")

        # Reset plot visually
        line.set_ydata(spectra.iloc[0])
        ax.set_title(f"Spectrum at t={str(timestamps.iloc[0])}")
        fig.canvas.draw_idle()


    start_button.on_clicked(start)
    stop_button.on_clicked(stop)
    
    # Replay the simulation from the start 
    while True:
        # Wait until start/continue button is pressed
        while not running["value"]:
            plt.pause(0.05)

        # Iterating over each timestamp
        for i in range(0, len(spectra)):
            
            # If restarted
            if restart["value"]:
                restart["value"] = False
                break

            # If paused, wait here
            pause_start = None
            while not running["value"]:
                if restart["value"]:
                    restart["value"] = False
                    break

                if pause_start is None:
                    pause_start = time.time()

                plt.pause(0.05)

            if not running["value"]:
                break
            
            # If we were paused, remove paused duration from timing
            if pause_start is not None:
                paused_duration = time.time() - pause_start
                start_time += paused_duration
            
            spectrum = spectra.iloc[i]
            timestamp = pd.to_datetime(timestamps.iloc[i].strip())
            
            if i == 0:
                start_time = time.time()
            
            # Updating the values for the current spectrum
            line.set_ydata(spectrum)
                
            if i + 1 < len(spectra): 
                next_timestamp = pd.to_datetime(timestamps.iloc[i + 1].strip())
            
            # Set the timestamp for the end of the simulation
            else:
                next_timestamp = pd.to_datetime("2026-04-10T14:17:10.000")

            # Computing the time to pause on the current timestamp
            # to match the simulation time
            real_time = (next_timestamp - first_timestamp).total_seconds()
            elapsed_time = time.time() - start_time

            # to avoid negative values
            pause_time = max(real_time - elapsed_time, 0)
            
            ax.set_title(f"Spectrum at t={str(timestamp)}")

            plt.pause(pause_time)

            if restart["value"]:
                restart["value"] = False
                break

    plt.ioff()
    plt.show()

def main():
    data_path = Path("./../data/spectra.csv")

    df = pd.read_csv(data_path)
    timestamps, spectra, wavenumbers = parse_data(df)

    replay_simulation(
        timestamps  = timestamps,
        spectra     = spectra,
        wavenumbers = wavenumbers
    )


if __name__ == "__main__":
    main()