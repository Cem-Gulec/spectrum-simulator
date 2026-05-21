import matplotlib.pyplot as plt
import pandas as pd
from pathlib import Path

# Parse different kinds of information inside the dataset
# such as timestamp, spectra values and wavenumbers
def parse_data(df):
    timestamps = df.iloc[:, 0]
    spectra = df.iloc[:, 1:]
    wavenumbers = spectra.columns.astype(int)

    return timestamps, spectra, wavenumbers

def plot_spectrum(timestamps, spectra, wavenumbers, row_index):
    spectrum = spectra.iloc[row_index]
    timestamp = timestamps.iloc[row_index]
    
    plt.plot(wavenumbers, spectrum)

    plt.xlabel("Wavenumber (cm^-1)")
    plt.ylabel("Absorbance")
    plt.title(f"Spectrum at t={timestamp}")
    plt.show()

def main():
    data_path = Path("./../data/spectra.csv")

    df = pd.read_csv(data_path)
    timestamps, spectra, wavenumbers = parse_data(df)

    plot_spectrum(
        timestamps=timestamps,
        spectra=spectra,
        wavenumbers=wavenumbers,
        row_index=1,
    )


if __name__ == "__main__":
    main()