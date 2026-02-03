// ============================================================
// RIPPLES PILOT: The Sonification of the Umwelt
// FM synthesis engine mapping entity states to sound
// ============================================================

import * as Tone from 'tone';

// Entity Voice Definitions
export const ENTITY_VOICES = {
  ant: {
    // High-frequency, jittery FM synthesis (insectoid clicking)
    synth: null,
    config: {
      oscillator: { type: 'fmTriangle' },
      envelope: {
        attack: 0.001,
        decay: 0.05,
        sustain: 0.1,
        release: 0.1
      },
      harmonicity: 8,
      modulationIndex: 10
    },
    baseFreq: 8000,
    jitter: 0.8,
    effects: ['bitcrusher', 'highpass']
  },
  
  mold: {
    // AM synthesis, low frequency drift
    synth: null,
    config: {
      oscillator: { type: 'amsine' },
      envelope: {
        attack: 0.5,
        decay: 1.0,
        sustain: 0.8,
        release: 2.0
      },
      harmonicity: 0.5
    },
    baseFreq: 200,
    drift: 0.3,
    effects: ['lowpass', 'chorus']
  },
  
  owl: {
    // Saw wave with resonance (predatory)
    synth: null,
    config: {
      oscillator: { type: 'sawtooth' },
      envelope: {
        attack: 0.1,
        decay: 0.3,
        sustain: 0.9,
        release: 1.5
      }
    },
    baseFreq: 300,
    resonance: 0.9,
    effects: ['reverb', 'filter']
  },
  
  dust: {
    // Noise with low filtering
    synth: null,
    config: {
      oscillator: { type: 'fmsquare' },
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.3,
        release: 0.5
      },
      harmonicity: 0.2,
      modulationIndex: 2
    },
    baseFreq: 100,
    filter: 'low',
    effects: ['lowpass', 'noise']
  },
  
  glass: {
    // Sine with high resonance (fragile)
    synth: null,
    config: {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.5,
        sustain: 0.4,
        release: 3.0
      }
    },
    baseFreq: 2000,
    resonance: 0.99,
    effects: ['reverb', 'delay']
  },
  
  stone: {
    // Square with low harmonics
    synth: null,
    config: {
      oscillator: { type: 'square' },
      envelope: {
        attack: 0.05,
        decay: 0.1,
        sustain: 0.2,
        release: 0.5
      }
    },
    baseFreq: 80,
    harmonics: 0.3,
    effects: ['distortion', 'lowpass']
  },
  
  shadow: {
    // Sub-bass, barely audible
    synth: null,
    config: {
      oscillator: { type: 'fmsine' },
      envelope: {
        attack: 0.5,
        decay: 2.0,
        sustain: 0.9,
        release: 4.0
      },
      harmonicity: 0.1,
      modulationIndex: 1
    },
    baseFreq: 40,
    depth: 0.8,
    effects: ['lowpass', 'compressor']
  },
  
  light: {
    // Bright sine with shimmer
    synth: null,
    config: {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0.8,
        release: 0.5
      }
    },
    baseFreq: 400,
    brightness: 0.9,
    effects: ['chorus', 'reverb']
  },
  
  heat: {
    // Triangle with warmth
    synth: null,
    config: {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.1,
        decay: 0.3,
        sustain: 0.7,
        release: 1.0
      }
    },
    baseFreq: 150,
    warmth: 0.7,
    effects: ['warmth', 'chorus']
  },
  
  mycelium: {
    // Complex FM for network feel
    synth: null,
    config: {
      oscillator: { type: 'fmsawtooth' },
      envelope: {
        attack: 0.2,
        decay: 0.5,
        sustain: 0.6,
        release: 2.0
      },
      harmonicity: 3,
      modulationIndex: 5
    },
    baseFreq: 150,
    network: 0.8,
    effects: ['reverb', 'delay', 'chorus']
  }
};

// Vector sonification
export const VECTOR_SOUNDS = {
  G: { // GOAL - ascending, consonant
    note: 'C4',
    chord: ['C4', 'E4', 'G4'],
    quality: 'major',
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.5 }
  },
  O: { // OBSTACLE - dissonant, percussive
    note: 'A2',
    chord: ['A2', 'C3', 'F3'],
    quality: 'diminished',
    envelope: { attack: 0.001, decay: 0.4, sustain: 0.1, release: 0.3 }
  },
  S: { // SHIFT - morphing, ethereal
    note: 'E4',
    chord: ['E4', 'B4', 'D5'],
    quality: 'sus4',
    envelope: { attack: 0.1, decay: 0.5, sustain: 0.4, release: 1.5 }
  }
};

// State sonification mappings
export const STATE_MODULATION = {
  foraging: { filterFreq: 1.0, resonance: 1.0, rate: 1.2 },
  blocked: { filterFreq: 0.3, resonance: 0.8, rate: 0.5 },
  carrying: { filterFreq: 0.8, resonance: 1.1, rate: 0.8 },
  dormant: { filterFreq: 0.2, resonance: 0.5, rate: 0.1 },
  sporing: { filterFreq: 1.2, resonance: 1.3, rate: 0.6 },
  growing: { filterFreq: 0.9, resonance: 1.0, rate: 1.0 },
  decaying: { filterFreq: 0.4, resonance: 0.7, rate: 0.3 },
  hunting: { filterFreq: 1.1, resonance: 1.2, rate: 1.5 },
  roosting: { filterFreq: 0.3, resonance: 0.6, rate: 0.2 },
  suspended: { filterFreq: 0.5, resonance: 0.4, rate: 0.3 },
  settling: { filterFreq: 0.2, resonance: 0.3, rate: 0.1 },
  resonating: { filterFreq: 1.5, resonance: 1.5, rate: 2.0 },
  elongating: { filterFreq: 0.7, resonance: 0.9, rate: 0.5 },
  contracting: { filterFreq: 0.9, resonance: 1.1, rate: 0.7 },
  dissolving: { filterFreq: 0.3, resonance: 0.4, rate: 0.2 }
};

// Main Synth Engine
export class RipplesSynth {
  constructor() {
    this.initialized = false;
    this.voices = {};
    this.effects = {};
    this.masterGain = null;
    this.analyser = null;
  }
  
  async init() {
    if (this.initialized) return;
    await Tone.start();
    
    // Master chain
    this.masterGain = new Tone.Gain(0.7).toDestination();
    this.analyser = new Tone.Analyser('waveform', 256);
    this.masterGain.connect(this.analyser);
    
    // Initialize effects
    this.effects.reverb = new Tone.Reverb({
      decay: 5,
      wet: 0.3
    }).connect(this.masterGain);
    
    this.effects.delay = new Tone.FeedbackDelay({
      delayTime: '8n',
      feedback: 0.3,
      wet: 0.2
    }).connect(this.effects.reverb);
    
    this.effects.bitcrusher = new Tone.BitCrusher({
      bits: 8,
      wet: 0.1
    }).connect(this.effects.delay);
    
    this.effects.chorus = new Tone.Chorus({
      frequency: 4,
      delayTime: 2.5,
      depth: 0.5,
      wet: 0.2
    }).connect(this.effects.reverb);
    
    this.effects.lowpass = new Tone.Filter({
      type: 'lowpass',
      frequency: 2000,
      rolloff: -12
    }).connect(this.effects.reverb);
    
    this.effects.highpass = new Tone.Filter({
      type: 'highpass',
      frequency: 200,
      rolloff: -12
    }).connect(this.effects.reverb);
    
    // Initialize entity voices
    Object.keys(ENTITY_VOICES).forEach(entityName => {
      const voice = ENTITY_VOICES[entityName];
      voice.synth = new Tone.PolySynth(Tone.FMSynth, voice.config);
      voice.synth.volume.value = -12;
      
      // Route through effects
      let chain = voice.synth;
      voice.effects.forEach(effectName => {
        if (this.effects[effectName]) {
          chain.connect(this.effects[effectName]);
        }
      });
      
      this.voices[entityName] = voice;
    });
    
    // Vector synth (for GOAL/OBSTACLE/SHIFT sounds)
    this.vectorSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.2,
        release: 0.5
      }
    }).connect(this.effects.reverb);
    this.vectorSynth.volume.value = -8;
    
    this.initialized = true;
  }
  
  // Play entity voice based on state
  playEntity(entity, intensity = 0.5) {
    if (!this.initialized) return;
    
    const voice = this.voices[entity.name];
    if (!voice) return;
    
    // Calculate frequency based on entity properties
    const jitter = voice.jitter || 0;
    const jitterAmount = (Math.random() - 0.5) * jitter * voice.baseFreq;
    const freq = voice.baseFreq + jitterAmount;
    
    // Modulate based on state
    const stateMod = STATE_MODULATION[entity.state] || STATE_MODULATION['foraging'];
    const duration = stateMod.rate * 0.2;
    
    // Play note
    const note = Tone.Frequency(freq).toNote();
    voice.synth.triggerAttackRelease(note, duration, intensity);
    
    // Modulate filter based on state
    if (this.effects.lowpass) {
      this.effects.lowpass.frequency.rampTo(
        2000 * stateMod.filterFreq,
        0.1
      );
    }
  }
  
  // Play vector sound
  playVector(vectorType, intensity = 0.5) {
    if (!this.initialized) return;
    
    const vector = VECTOR_SOUNDS[vectorType];
    if (!vector) return;
    
    // Play chord
    vector.chord.forEach((note, i) => {
      setTimeout(() => {
        this.vectorSynth.triggerAttackRelease(
          note,
          vector.envelope.decay + vector.envelope.sustain,
          intensity * (1 - i * 0.1)
        );
      }, i * 20);
    });
  }
  
  // Update synth parameters based on entity state change
  modulateForState(entity) {
    if (!this.initialized) return;
    
    const voice = this.voices[entity.name];
    if (!voice) return;
    
    const stateMod = STATE_MODULATION[entity.state];
    if (!stateMod) return;
    
    // Modulate envelope
    voice.synth.set({
      envelope: {
        attack: voice.config.envelope.attack / stateMod.rate,
        decay: voice.config.envelope.decay * stateMod.rate,
        sustain: voice.config.envelope.sustain * stateMod.resonance,
        release: voice.config.envelope.release * stateMod.rate
      }
    });
  }
  
  // Create drone for background ambience
  startDrone() {
    if (!this.initialized) return;
    
    this.drone = new Tone.Oscillator({
      type: 'sine',
      frequency: 60
    }).connect(this.effects.reverb);
    
    this.drone.volume.value = -30;
    this.drone.start();
    
    // LFO for subtle movement
    this.droneLFO = new Tone.LFO({
      frequency: 0.1,
      min: 55,
      max: 65
    }).connect(this.drone.frequency);
    this.droneLFO.start();
  }
  
  stopDrone() {
    if (this.drone) {
      this.drone.stop();
      this.drone.dispose();
      this.drone = null;
    }
    if (this.droneLFO) {
      this.droneLFO.stop();
      this.droneLFO.dispose();
      this.droneLFO = null;
    }
  }
  
  // Get waveform data for visualization
  getWaveform() {
    return this.analyser ? this.analyser.getValue() : new Float32Array(256);
  }
  
  // Set master volume
  setVolume(db) {
    if (this.masterGain) {
      this.masterGain.gain.rampTo(Math.pow(10, db / 20), 0.1);
    }
  }
}

export default RipplesSynth;
