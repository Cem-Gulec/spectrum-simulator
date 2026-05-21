import matplotlib.pyplot as plt
import pandas as pd
from pathlib import Path
import time

# Parse different kinds of information inside the dataset
def parse_data(df):
    timestamps = df.iloc[:, 0]
    spectra = df.iloc[:, 1:]
    wavenumbers = spectra.columns.astype(int)

    return timestamps, spectra, wavenumbers

# Plot consecutive spectrum values on each timestamp 
def plot_spectra(timestamps, spectra, wavenumbers):
    # Interactive mode on
    plt.ion()

    # Creating initial figure and a set of subplots
    fig, ax = plt.subplots()
    
    # Configurations arranged for the plot
    ax.set_xlabel("Wavenumber (cm^-1)")
    ax.set_ylabel("Absorbance")
    
    # Putting a limitation on y axis 
    # based on the min, max among the spectra values
    ax.set_ylim(spectra.min().min(), spectra.max().max())
    
    # Initial values are obtained to plot first format of the plot
    spectrum = spectra.iloc[0]
    first_timestamp = pd.to_datetime(timestamps.iloc[0].strip())
    
    line, = ax.plot(wavenumbers, spectrum)
    
    # Replay the simulation from the start 
    while True:
        # Iterating over each timestamp
        for i in range(0, len(spectra)):
            spectrum = spectra.iloc[i]
            timestamp = pd.to_datetime(timestamps.iloc[i].strip())
            
            if i == 0:
                start_time = time.time()
            
            # Updating the values for the current spectrum
            line.set_ydata(spectrum)
                
            if i + 1 < len(spectra): 
                next_timestamp = pd.to_datetime(timestamps.iloc[i+1].strip())
            
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

    plt.ioff()
    plt.show()

def main():
    data_path = Path("./../data/spectra.csv")

    df = pd.read_csv(data_path)
    timestamps, spectra, wavenumbers = parse_data(df)

    plot_spectra(
        timestamps  = timestamps,
        spectra     = spectra,
        wavenumbers = wavenumbers
    )


if __name__ == "__main__":
    main()