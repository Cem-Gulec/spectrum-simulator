import pandas as pd
import time
from pathlib import Path

# Parse different kinds of information inside the dataset
def parse_data(df):
    timestamps = pd.to_datetime(df.iloc[:, 0].str.strip())
    spectra = df.iloc[:, 1:]
    wavenumbers = spectra.columns.astype(int)

    return timestamps, spectra, wavenumbers

# Initializer function for SpectrumSimulator class
def create_simulator():
    data_path = Path("./../data/spectra.csv")

    df = pd.read_csv(data_path)
    timestamps, spectra, wavenumbers = parse_data(df)

    return SpectrumSimulator(
        timestamps=timestamps,
        spectra=spectra,
        wavenumbers=wavenumbers
    )

class SpectrumSimulator:
    def __init__(self, timestamps, spectra, wavenumbers):
        self.timestamps = timestamps
        self.spectra = spectra
        self.wavenumbers = wavenumbers

        self.first_timestamp = self.timestamps.iloc[0]
        self.end_timestamp = pd.to_datetime("2026-04-10T14:17:10.000")

        # Control states
        self.running = False
        self.restart = False
        self.time_changed = False

        self.pause_time = 0
        self.current_index = 0
        self.current_spectrum = self.spectra.iloc[0]
        self.current_timestamp = self.timestamps.iloc[0]
        
        self.first_spectrum = self.spectra.iloc[0]
        self.last_spectrum = self.spectra.iloc[-1]
        self.min_limit = self.spectra.min().min()
        self.max_limit = self.spectra.max().max()
        
    def start(self):
        # This allows us to both start and pause the simulation from start function
        self.running = not self.running
        
        if self.running:
            print("[START] Simulation started\n")
        else:
            print("[PAUSE] Simulation paused\n")

    def pause(self):
        self.running = False
        print("[PAUSE] Simulation paused\n")

    def stop(self):
        self.running = False
        self.restart = True
        print("[STOP] Simulation stopped and restart requested\n")

    def set_simulation_time(self, target_timestamp):
        # When the simulation time is set to a different timestamp
        # I allow user to decide on next action by pausing the simulation
        self.running = False

        target_timestamp = pd.to_datetime(target_timestamp)
        target_index = self.timestamps[self.timestamps == target_timestamp].index[0]

        # Setting target values
        self.current_index = target_index
        self.current_spectrum = self.spectra.iloc[target_index]
        self.time_changed = True

        print(f"[SET TIME] Simulation moved to index={target_index}")

    # Plot consecutive spectrum values on each timestamp
    def replay_simulation(self):
        print("[REPLAY] Replay loop started\n")
        
        # Replay the simulation from the start
        while True:
            print("[WAIT] Waiting for simulation to start\n")

            # Wait until simulation starts
            while not self.running:
                time.sleep(0.01)

            print("[RUNNING] Simulation is running\n")

            start_time = time.time()

            # Iterating from the current_index
            i = self.current_index

            while i < len(self.spectra):

                # If restart requested
                if self.restart:
                    self.restart = False
                    self.current_index = 0
                    self.current_spectrum = self.spectra.iloc[0]
                    self.current_timestamp = self.timestamps.iloc[0]

                    print("[RESTART] Resetting simulation to first spectrum\n")
                    break

                # Pause handling
                pause_start = None

                while not self.running:

                    if self.restart:
                        break

                    if pause_start is None:
                        pause_start = time.time()

                    time.sleep(0.01)

                if self.restart:
                    self.restart = False
                    self.current_index = 0
                    self.current_spectrum = self.spectra.iloc[0]
                    self.current_timestamp = self.timestamps.iloc[0]
                    break

                # If set_simulation_time done
                if self.time_changed:
                    i = self.current_index
                    self.time_changed = False

                # Compensate paused duration, if it is paused
                if pause_start is not None:
                    paused_duration = time.time() - pause_start
                    start_time += paused_duration

                # Next index and related spectrum values are set
                self.current_index = i
                self.current_spectrum = self.spectra.iloc[i]
                self.current_timestamp = self.timestamps.iloc[i]

                timestamp = self.timestamps.iloc[i]

                print(f"[FRAME] index={i}, timestamp={timestamp}")

                # Determine next timestamp
                if i + 1 < len(self.timestamps):
                    next_timestamp = self.timestamps.iloc[i + 1]
                
                # Set the timestamp for the end of the simulation
                else:
                    next_timestamp = self.end_timestamp

                #real_time = (next_timestamp - self.first_timestamp).total_seconds()
                #elapsed_time = time.time() - start_time
                #pause_time = max(real_time - elapsed_time, 0)

                # Computing the time to pause on the current timestamp
                # to match the simulation time
                self.pause_time = (next_timestamp - timestamp).total_seconds()
                
                # to avoid negative values
                self.pause_time = max(self.pause_time, 0)

                '''print(
                    f"[TIMING] real_time={real_time:.4f}, "
                    f"elapsed_time={elapsed_time:.4f}, "
                    f"pause_time={pause_time:.4f}\n"
                )'''

                print(f"[INFO] Simulation starting from the beginning as it reached the timestamp= {self.end_timestamp}\n")
                print(f"[TIMING] pause_time={self.pause_time:.4f}\n")

                # Pausing the simulation with the pause_time calculated
                time.sleep(self.pause_time)

                i += 1

            # Resetting automatically after reaching end
            self.current_index = 0
            self.current_spectrum = self.spectra.iloc[0]       
            self.current_timestamp = self.timestamps.iloc[0]                                                             


def main():
    simulator = create_simulator()

    simulator.start()
    simulator.replay_simulation()

if __name__ == "__main__":
    main()