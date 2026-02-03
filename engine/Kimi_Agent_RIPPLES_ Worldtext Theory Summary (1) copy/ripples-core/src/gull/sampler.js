// ============================================================
// RIPPLES GULL: The Concrete Archive
// Field recordings of the imaginary
// Granular synthesis for atmospheric textures
// ============================================================

import * as Tone from 'tone';

// Abstract sample definitions (procedural generation)
export const ABSTRACT_SAMPLES = {
  ceramic_crack: {
    // Simulated ceramic stress sound
    generate: () => {
      const noise = new Tone.Noise('brown');
      const filter = new Tone.Filter(800, 'lowpass');
      const env = new Tone.AmplitudeEnvelope({
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.1
      });
      noise.connect(filter);
      filter.connect(env);
      return { source: noise, envelope: env, duration: 0.2 };
    },
    category: 'texture',
    entities: ['glass', 'stone']
  },
  
  wind_leaves: {
    // Simulated wind through foliage
    generate: () => {
      const noise = new Tone.Noise('pink');
      const filter = new Tone.AutoFilter({
        frequency: 0.5,
        baseFrequency: 200,
        octaves: 2
      });
      const env = new Tone.AmplitudeEnvelope({
        attack: 0.5,
        decay: 1,
        sustain: 0.3,
        release: 2
      });
      noise.connect(filter);
      filter.connect(env);
      return { source: noise, envelope: env, duration: 4 };
    },
    category: 'atmosphere',
    entities: ['mycelium', 'owl']
  },
  
  static_electricity: {
    // Simulated static/discharge
    generate: () => {
      const noise = new Tone.Noise('white');
      const filter = new Tone.Filter(3000, 'highpass');
      const env = new Tone.AmplitudeEnvelope({
        attack: 0.001,
        decay: 0.05,
        sustain: 0,
        release: 0.05
      });
      noise.connect(filter);
      filter.connect(env);
      return { source: noise, envelope: env, duration: 0.1 };
    },
    category: 'texture',
    entities: ['dust', 'heat']
  },
  
  insect_chorus: {
    // Simulated insect clicking
    generate: () => {
      const osc = new Tone.Oscillator(8000, 'square');
      const lfo = new Tone.LFO(20, 0, 1);
      const env = new Tone.AmplitudeEnvelope({
        attack: 0.001,
        decay: 0.01,
        sustain: 0,
        release: 0.01
      });
      lfo.connect(osc.volume);
      osc.connect(env);
      return { source: osc, envelope: env, duration: 0.5, lfo };
    },
    category: 'life',
    entities: ['ant', 'mold']
  },
  
  sub_rumble: {
    // Deep subsonic rumble
    generate: () => {
      const osc = new Tone.Oscillator(30, 'sine');
      const lfo = new Tone.LFO(0.2, 25, 35);
      const env = new Tone.AmplitudeEnvelope({
        attack: 2,
        decay: 3,
        sustain: 0.8,
        release: 5
      });
      lfo.connect(osc.frequency);
      osc.connect(env);
      return { source: osc, envelope: env, duration: 10, lfo };
    },
    category: 'atmosphere',
    entities: ['shadow', 'stone']
  },
  
  water_drip: {
    // Simulated droplet
    generate: () => {
      const osc = new Tone.Oscillator(800, 'sine');
      const env = new Tone.AmplitudeEnvelope({
        attack: 0.001,
        decay: 0.3,
        sustain: 0,
        release: 0.1
      });
      const filter = new Tone.Filter(2000, 'lowpass');
      osc.connect(filter);
      filter.connect(env);
      return { source: osc, envelope: env, duration: 0.4 };
    },
    category: 'texture',
    entities: ['mold', 'heat']
  },
  
  glass_resonance: {
    // Simulated glass harmonic
    generate: () => {
      const osc = new Tone.Oscillator(2000, 'sine');
      const env = new Tone.AmplitudeEnvelope({
        attack: 0.001,
        decay: 2,
        sustain: 0.3,
        release: 3
      });
      const vibrato = new Tone.Vibrato(5, 0.1);
      osc.connect(vibrato);
      vibrato.connect(env);
      return { source: osc, envelope: env, duration: 5, vibrato };
    },
    category: 'resonance',
    entities: ['glass']
  },
  
  owl_call: {
    // Simulated owl hoot
    generate: () => {
      const osc = new Tone.Oscillator(400, 'sawtooth');
      const filter = new Tone.Filter(600, 'lowpass');
      const env = new Tone.AmplitudeEnvelope({
        attack: 0.1,
        decay: 0.5,
        sustain: 0.8,
        release: 1
      });
      osc.connect(filter);
      filter.connect(env);
      return { source: osc, envelope: env, duration: 2 };
    },
    category: 'life',
    entities: ['owl']
  },
  
  light_hum: {
    // Simulated electrical hum
    generate: () => {
      const osc = new Tone.Oscillator(60, 'sine');
      const harmonic = new Tone.Oscillator(120, 'sine');
      const env = new Tone.AmplitudeEnvelope({
        attack: 0.5,
        decay: 0,
        sustain: 1,
        release: 1
      });
      osc.connect(env);
      harmonic.connect(env);
      harmonic.volume.value = -20;
      return { source: osc, envelope: env, duration: -1, harmonic };
    },
    category: 'atmosphere',
    entities: ['light', 'heat']
  },
  
  dust_settle: {
    // Simulated particulate settling
    generate: () => {
      const noise = new Tone.Noise('brown');
      const filter = new Tone.Filter(100, 'lowpass');
      const env = new Tone.AmplitudeEnvelope({
        attack: 1,
        decay: 3,
        sustain: 0,
        release: 2
      });
      noise.connect(filter);
      filter.connect(env);
      return { source: noise, envelope: env, duration: 6 };
    },
    category: 'texture',
    entities: ['dust']
  }
};

// Granular synthesis engine
export class GranularEngine {
  constructor() {
    this.initialized = false;
    this.grains = [];
    this.masterGain = null;
  }
  
  async init() {
    if (this.initialized) return;
    await Tone.start();
    
    this.masterGain = new Tone.Gain(0.5).toDestination();
    this.initialized = true;
  }
  
  // Create a grain from abstract sample
  createGrain(sampleName, time = 0, duration = null) {
    if (!this.initialized) return null;
    
    const sample = ABSTRACT_SAMPLES[sampleName];
    if (!sample) return null;
    
    const grain = sample.generate();
    const playDuration = duration || sample.duration;
    
    // Start source
    if (grain.source) {
      grain.source.start(time);
      
      // Trigger envelope
      if (grain.envelope) {
        grain.envelope.triggerAttack(time);
        if (playDuration > 0) {
          grain.envelope.triggerRelease(time + playDuration);
        }
      }
      
      // Connect to output
      grain.envelope.connect(this.masterGain);
      
      // Schedule cleanup
      if (playDuration > 0) {
        setTimeout(() => {
          this.disposeGrain(grain);
        }, (time + playDuration + 1) * 1000);
      }
    }
    
    this.grains.push(grain);
    return grain;
  }
  
  // Dispose of a grain
  disposeGrain(grain) {
    if (grain.source) {
      try {
        grain.source.stop();
        grain.source.dispose();
      } catch (e) {}
    }
    if (grain.envelope) {
      grain.envelope.dispose();
    }
    if (grain.lfo) {
      grain.lfo.dispose();
    }
    if (grain.vibrato) {
      grain.vibrato.dispose();
    }
    if (grain.harmonic) {
      grain.harmonic.dispose();
    }
    
    this.grains = this.grains.filter(g => g !== grain);
  }
  
  // Granular cloud - multiple overlapping grains
  createCloud(sampleName, density = 5, spread = 1) {
    if (!this.initialized) return;
    
    for (let i = 0; i < density; i++) {
      const delay = Math.random() * spread;
      const duration = 0.5 + Math.random() * 2;
      
      setTimeout(() => {
        this.createGrain(sampleName, Tone.now(), duration);
      }, delay * 1000);
    }
  }
  
  // Entity-triggered sample playback
  playForEntity(entity, vectorType = null) {
    if (!this.initialized) return;
    
    // Find samples associated with this entity
    const matchingSamples = Object.entries(ABSTRACT_SAMPLES)
      .filter(([_, sample]) => sample.entities.includes(entity.name))
      .map(([name, _]) => name);
    
    if (matchingSamples.length === 0) return;
    
    // Select based on state and vector
    let sampleName;
    if (vectorType === 'O' && matchingSamples.includes('ceramic_crack')) {
      sampleName = 'ceramic_crack';
    } else if (entity.state === 'dormant' && matchingSamples.includes('sub_rumble')) {
      sampleName = 'sub_rumble';
    } else if (entity.state === 'foraging' && matchingSamples.includes('insect_chorus')) {
      sampleName = 'insect_chorus';
    } else {
      sampleName = matchingSamples[Math.floor(Math.random() * matchingSamples.length)];
    }
    
    // Play with entity-specific modulation
    const intensity = entity.energy / 100;
    this.masterGain.gain.rampTo(intensity * 0.5, 0.1);
    
    this.createGrain(sampleName);
  }
  
  // Ambient texture for scenario
  playAmbient(scenario = 'cupboard') {
    if (!this.initialized) return;
    
    const scenarioSamples = {
      cupboard: ['static_electricity', 'dust_settle', 'light_hum'],
      forest: ['wind_leaves', 'sub_rumble', 'water_drip'],
      urban: ['glass_resonance', 'static_electricity', 'light_hum']
    };
    
    const samples = scenarioSamples[scenario] || scenarioSamples['cupboard'];
    
    // Create slowly evolving texture
    const playNext = () => {
      const sampleName = samples[Math.floor(Math.random() * samples.length)];
      const duration = 3 + Math.random() * 5;
      
      this.createGrain(sampleName, Tone.now(), duration);
      
      setTimeout(playNext, duration * 1000 + Math.random() * 2000);
    };
    
    playNext();
  }
  
  // Stop all grains
  stopAll() {
    this.grains.forEach(grain => this.disposeGrain(grain));
    this.grains = [];
  }
  
  setVolume(db) {
    if (this.masterGain) {
      this.masterGain.gain.rampTo(Math.pow(10, db / 20), 0.1);
    }
  }
}

// Main Sampler Class
export class RipplesSampler {
  constructor() {
    this.granular = new GranularEngine();
    this.initialized = false;
  }
  
  async init() {
    await this.granular.init();
    this.initialized = true;
  }
  
  // Trigger sample for entity
  trigger(entity, vectorType = null) {
    if (!this.initialized) return;
    this.granular.playForEntity(entity, vectorType);
  }
  
  // Start ambient texture
  startAmbient(scenario) {
    if (!this.initialized) return;
    this.granular.playAmbient(scenario);
  }
  
  // Create granular cloud
  cloud(sampleName, density, spread) {
    if (!this.initialized) return;
    this.granular.createCloud(sampleName, density, spread);
  }
  
  // Stop all playback
  stop() {
    if (!this.initialized) return;
    this.granular.stopAll();
  }
  
  setVolume(db) {
    if (this.granular) {
      this.granular.setVolume(db);
    }
  }
}

export default RipplesSampler;
