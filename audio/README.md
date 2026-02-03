# RIPPLES Audio Architecture

This directory contains the tools for integrating RIPPLES with the Hundredrabbits livecoding ecosystem.

## Components

### 1. Repositories
- **Orca** (`audio/orca/`): Procedural sequencer.
- **Pilot** (`audio/pilot/`): UDP Synthesizer.
- **Gull** (`audio/gull/`): UDP Sampler.

### 2. The Bridge (`engine/adapters/audio-bridge.js`)
A Node.js adapter that:
- Connects to the RIPPLES engine.
- Translates entities into Pilot commands (`04C`, `13F` etc).
- Compiles the spatial grid into an `.orca` file (`audio/live.orca`).
- Sends UDP bangs to 49160 (Orca) and 49161 (Pilot).

### 3. The Grid Compiler (`engine/compiler/grid-compiler.js`)
The logic core that maps:
- **Animate** Entities -> **Move** Operators (N, S, E, W)
- **Inanimate** Entities -> **Static** Operators (H, *)
- **Abstract** Entities -> **Variable** Operators (V, Y)

## Usage

### Prerequisites
- Node.js installed
- Electron installed (for running Orca/Pilot)

### Running the System

1. **Start Pilot** (Synth)
   ```bash
   cd audio/pilot
   npm install && npm start
   ```

2. **Start Orca** (Sequencer)
   ```bash
   cd audio/orca
   npm install && npm start
   ```
   *In Orca, load the dynamic file if needed, or listen for UDP input.*

3. **Start the RIPPLES Bridge**
   ```bash
   node engine/adapters/audio-bridge.js
   ```

## "Living Code" Theory
The simulation *is* the source code. As entities move in RIPPLES, they rewrite the logic of the Orca sequencer in real-time.
- **Ants** are Logic Carriers.
- **Walls** are Logic Blockers.
- **Ripples** are Radial Bangs.

See `ORCA_RIPPLE_THEORY.md` for the full theoretical framework.
