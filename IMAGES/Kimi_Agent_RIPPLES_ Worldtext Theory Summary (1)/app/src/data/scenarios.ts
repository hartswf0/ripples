// RIPPLES: Scenario Definitions
// Each scenario contains entities, baseline state, and adjacency rules

import type { Scenario } from '@/types';

export const scenarios: Scenario[] = [
  {
    id: 'cupboard',
    name: 'The Cupboard',
    description: 'A pressurized space of stillness, where six tall glasses, a stack of plates, and microscopic life maintain rigid proximity.',
    boundary: 'Wood/Darkness',
    physics: 'high_friction',
    baselineWorldtext: `The cupboard space is pressurized by stillness. Light seeps only through marginal cracks between door and frame. Objects maintain rigid proximity. Six tall glasses (silica/dust coated) delimit the left boundary. A stack of twenty ceramic plates compresses the lower shelf space. The air is stagnant. Particles drift in slow Brownian motion. A single ant navigates the ceramic topography. Dust motes hang suspended in amber light.`,
    entities: [
      {
        id: 'ant',
        name: 'Ant',
        description: 'A solitary formicidae scout, navigating the cupboard\'s ceramic topography through chemical cartography.',
        type: 'animate',
        position: { x: 45, y: 60, z: 0 },
        state: 'foraging',
        memory: [],
        energy: 78,
        adjacency: ['plates', 'tall_glass', 'dust_mote']
      },
      {
        id: 'dust_mote',
        name: 'Dust Mote',
        description: 'Suspended particulate matter—a constellation of skin cells, fiber fragments, mineral specks drifting in Brownian motion.',
        type: 'inanimate',
        position: { x: 30, y: 25, z: 5 },
        state: 'suspended',
        memory: [],
        energy: 23,
        adjacency: ['light', 'shadow', 'tall_glass']
      },
      {
        id: 'tall_glass',
        name: 'Tall Glass',
        description: 'One of six silica vessels, dust-coated, dreaming of being filled.',
        type: 'inanimate',
        position: { x: 15, y: 40, z: 0 },
        state: 'empty',
        memory: [],
        energy: 45,
        adjacency: ['plates', 'light', 'shadow']
      },
      {
        id: 'plates',
        name: 'Stack of Plates',
        description: 'Twenty ceramic plates compressed into vertical unity, bearing the weight of their own aggregation.',
        type: 'inanimate',
        position: { x: 60, y: 70, z: 0 },
        state: 'compressed',
        memory: [],
        energy: 62,
        adjacency: ['ant', 'shadow', 'tall_glass']
      },
      {
        id: 'light',
        name: 'Light',
        description: 'Electromagnetic radiation entering through marginal cracks, seeking to illuminate the cupboard\'s darkness.',
        type: 'abstract',
        position: { x: 80, y: 15, z: 10 },
        state: 'filtering',
        memory: [],
        energy: 91,
        adjacency: ['shadow', 'dust_mote', 'tall_glass']
      },
      {
        id: 'shadow',
        name: 'Shadow',
        description: 'Absence of light, pooling in corners, seeking depth and expansion.',
        type: 'abstract',
        position: { x: 20, y: 85, z: -5 },
        state: 'deepening',
        memory: [],
        energy: 67,
        adjacency: ['plates', 'light', 'tall_glass']
      },
      {
        id: 'stillness',
        name: 'Stillness',
        description: 'The temporal entity that governs the cupboard—time moves differently here.',
        type: 'temporal',
        position: { x: 50, y: 50, z: -10 },
        state: 'dilated',
        memory: [],
        energy: 88,
        adjacency: ['all']
      }
    ],
    adjacencyRules: {
      'ant': ['plates', 'tall_glass', 'dust_mote'],
      'dust_mote': ['light', 'shadow', 'tall_glass'],
      'tall_glass': ['plates', 'light', 'shadow'],
      'plates': ['ant', 'shadow', 'tall_glass'],
      'light': ['shadow', 'dust_mote', 'tall_glass'],
      'shadow': ['plates', 'light', 'tall_glass'],
      'stillness': ['ant', 'dust_mote', 'tall_glass', 'plates', 'light', 'shadow']
    },
    environmentalFactors: {
      temperature: 18,
      humidity: 45,
      lightLevel: 12,
      noiseLevel: 2
    }
  },
  {
    id: 'abandoned_house',
    name: 'Abandoned House',
    description: 'A structure returning to earth, where decay and reclamation dance in slow partnership.',
    boundary: 'Decay',
    physics: 'low_friction',
    baselineWorldtext: `The abandoned house breathes through broken windows. Wind moves through rooms like blood through veins. Floorboards have warped into frozen tides. Wallpaper hangs like shed skin. In the kitchen, a table holds the ghost of meals. Upstairs, a mattress has become a garden of mold. The attic contains the house's memories. Rain enters through the roof's wounds. Nature has begun its reclamation: vines through windows, moss on walls.`,
    entities: [
      {
        id: 'raccoon',
        name: 'Raccoon',
        description: 'A nocturnal forager with masked face and dexterous paws, seeking the attic\'s treasures.',
        type: 'animate',
        position: { x: 70, y: 80, z: 0 },
        state: 'foraging',
        memory: [],
        energy: 84,
        adjacency: ['rain', 'ivy', 'mold']
      },
      {
        id: 'mold',
        name: 'Mold',
        description: 'A fungal colony spreading across the mattress, converting decay into growth.',
        type: 'animate',
        position: { x: 40, y: 30, z: 0 },
        state: 'colonizing',
        memory: [],
        energy: 72,
        adjacency: ['rain', 'ivy', 'decay']
      },
      {
        id: 'ivy',
        name: 'Ivy',
        description: 'Hedera helix climbing the walls, seeking light through patient ascent.',
        type: 'animate',
        position: { x: 25, y: 50, z: 5 },
        state: 'climbing',
        memory: [],
        energy: 69,
        adjacency: ['rain', 'mold', 'raccoon']
      },
      {
        id: 'rain',
        name: 'Rain',
        description: 'Precipitation entering through the roof, seeking the lowest point.',
        type: 'weather',
        position: { x: 55, y: 10, z: 15 },
        state: 'infiltrating',
        memory: [],
        energy: 95,
        adjacency: ['mold', 'ivy', 'raccoon', 'decay']
      },
      {
        id: 'decay',
        name: 'Decay',
        description: 'The geological force of entropy, slowly returning the house to earth.',
        type: 'geological',
        position: { x: 50, y: 50, z: -5 },
        state: 'advancing',
        memory: [],
        energy: 100,
        adjacency: ['mold', 'ivy', 'rain']
      },
      {
        id: 'memory',
        name: 'House Memory',
        description: 'The accumulated weight of lives no longer lived here, haunting the attic.',
        type: 'abstract',
        position: { x: 35, y: 20, z: -10 },
        state: 'fading',
        memory: [],
        energy: 34,
        adjacency: ['raccoon', 'decay']
      }
    ],
    adjacencyRules: {
      'raccoon': ['rain', 'ivy', 'mold', 'memory'],
      'mold': ['rain', 'ivy', 'decay'],
      'ivy': ['rain', 'mold', 'raccoon', 'decay'],
      'rain': ['mold', 'ivy', 'raccoon', 'decay'],
      'decay': ['mold', 'ivy', 'rain', 'memory'],
      'memory': ['raccoon', 'decay']
    },
    environmentalFactors: {
      temperature: 12,
      humidity: 78,
      lightLevel: 25,
      noiseLevel: 15
    }
  },
  {
    id: 'forest',
    name: 'Deep Forest',
    description: 'A cathedral of verticality where light filters down in shafts and the forest floor is a tapestry of decay and renewal.',
    boundary: 'Cathedral of Verticality',
    physics: 'standard',
    baselineWorldtext: `The deep forest is a cathedral of verticality. Trunks rise like columns, branches arch like vaults. Light filters down in shafts, illuminating dust. The forest floor is a tapestry of fallen leaves and rotting wood. Sound moves differently here: muffled by moss, absorbed by bark. The air is thick with chemistry: oxygen, terpenes, the musk of animals. Each tree is a city; the forest is a network of roots and fungal threads.`,
    entities: [
      {
        id: 'mycelium',
        name: 'Mycelium',
        description: 'The forest\'s underground network, connecting roots in silent communication.',
        type: 'animate',
        position: { x: 50, y: 85, z: -10 },
        state: 'networking',
        memory: [],
        energy: 89,
        adjacency: ['seedling', 'deer', 'tree', 'fog']
      },
      {
        id: 'deer',
        name: 'Deer',
        description: 'A herbivore browser, moving through the forest with calculated grace.',
        type: 'animate',
        position: { x: 35, y: 45, z: 0 },
        state: 'grazing',
        memory: [],
        energy: 76,
        adjacency: ['owl', 'mycelium', 'seedling', 'fog']
      },
      {
        id: 'owl',
        name: 'Owl',
        description: 'A nocturnal predator, hunting through sound in the darkness.',
        type: 'animate',
        position: { x: 70, y: 20, z: 15 },
        state: 'hunting',
        memory: [],
        energy: 82,
        adjacency: ['deer', 'seedling', 'fog']
      },
      {
        id: 'seedling',
        name: 'Seedling',
        description: 'A juvenile plant reaching toward the canopy\'s gaps, racing against shadow.',
        type: 'animate',
        position: { x: 20, y: 70, z: 0 },
        state: 'growing',
        memory: [],
        energy: 54,
        adjacency: ['mycelium', 'deer', 'owl', 'tree']
      },
      {
        id: 'tree',
        name: 'Ancient Tree',
        description: 'A living archive of seasons past, heartwood recording centuries.',
        type: 'geological',
        position: { x: 60, y: 40, z: 0 },
        state: 'standing',
        memory: [],
        energy: 97,
        adjacency: ['mycelium', 'seedling', 'fog']
      },
      {
        id: 'fog',
        name: 'Fog',
        description: 'Weather made visible—water suspended, boundaries dissolved.',
        type: 'weather',
        position: { x: 45, y: 30, z: 10 },
        state: 'drifting',
        memory: [],
        energy: 71,
        adjacency: ['mycelium', 'deer', 'owl', 'seedling', 'tree']
      },
      {
        id: 'season',
        name: 'Season',
        description: 'The temporal rhythm governing growth, decay, and renewal.',
        type: 'temporal',
        position: { x: 50, y: 50, z: -15 },
        state: 'turning',
        memory: [],
        energy: 100,
        adjacency: ['all']
      }
    ],
    adjacencyRules: {
      'mycelium': ['seedling', 'deer', 'tree', 'fog'],
      'deer': ['owl', 'mycelium', 'seedling', 'fog'],
      'owl': ['deer', 'seedling', 'fog'],
      'seedling': ['mycelium', 'deer', 'owl', 'tree'],
      'tree': ['mycelium', 'seedling', 'fog'],
      'fog': ['mycelium', 'deer', 'owl', 'seedling', 'tree'],
      'season': ['mycelium', 'deer', 'owl', 'seedling', 'tree', 'fog']
    },
    environmentalFactors: {
      temperature: 16,
      humidity: 82,
      lightLevel: 35,
      noiseLevel: 28
    }
  },
  {
    id: 'urban_jungle',
    name: 'Urban Jungle',
    description: 'A forest of concrete and steel where nature adapts to the made, and the city breathes through its infrastructure.',
    boundary: 'Concrete Canyon',
    physics: 'high_noise',
    baselineWorldtext: `The urban jungle is a forest of verticality. Buildings rise like cliffs, streets run like rivers. Concrete is the dominant geology. The air carries a unique chemistry: exhaust, cooking, the metallic tang of industry. Sound is constant: engines, voices, construction. Light is artificial: streetlamps, neon, LED. The city has its own ecology: pigeons, rats, the hardy species that thrive in the cracks.`,
    entities: [
      {
        id: 'pigeon',
        name: 'Pigeon',
        description: 'Columba livia, the urban survivor, scavenging crumbs in the city\'s plazas.',
        type: 'animate',
        position: { x: 45, y: 35, z: 0 },
        state: 'foraging',
        memory: [],
        energy: 68,
        adjacency: ['traffic_light', 'graffiti', 'noise']
      },
      {
        id: 'rat',
        name: 'Rat',
        description: 'Rattus norvegicus, the nocturnal entrepreneur, navigating the city\'s secret routes.',
        type: 'animate',
        position: { x: 65, y: 75, z: -5 },
        state: 'scavenging',
        memory: [],
        energy: 79,
        adjacency: ['graffiti', 'traffic_light', 'noise', 'sewer']
      },
      {
        id: 'graffiti',
        name: 'Graffiti',
        description: 'Aerosol inscription, a voice shouting against the anonymity of the city.',
        type: 'abstract',
        position: { x: 30, y: 50, z: 5 },
        state: 'visible',
        memory: [],
        energy: 43,
        adjacency: ['pigeon', 'rat', 'noise']
      },
      {
        id: 'traffic_light',
        name: 'Traffic Light',
        description: 'A signal device attempting to impose order on the chaos of vehicles.',
        type: 'inanimate',
        position: { x: 75, y: 25, z: 0 },
        state: 'cycling',
        memory: [],
        energy: 88,
        adjacency: ['pigeon', 'rat', 'noise']
      },
      {
        id: 'noise',
        name: 'Noise',
        description: 'The constant sonic pressure of human activity, never stopping, never resting.',
        type: 'abstract',
        position: { x: 50, y: 50, z: 10 },
        state: 'permeating',
        memory: [],
        energy: 100,
        adjacency: ['pigeon', 'rat', 'graffiti', 'traffic_light', 'sewer']
      },
      {
        id: 'sewer',
        name: 'Sewer',
        description: 'The city\'s hidden vascular system, carrying waste and secrets beneath the surface.',
        type: 'geological',
        position: { x: 55, y: 60, z: -15 },
        state: 'flowing',
        memory: [],
        energy: 92,
        adjacency: ['rat', 'noise']
      },
      {
        id: 'rush_hour',
        name: 'Rush Hour',
        description: 'The temporal pulse of the city—periods of maximum density and velocity.',
        type: 'temporal',
        position: { x: 40, y: 40, z: -10 },
        state: 'peaking',
        memory: [],
        energy: 96,
        adjacency: ['all']
      }
    ],
    adjacencyRules: {
      'pigeon': ['traffic_light', 'graffiti', 'noise'],
      'rat': ['graffiti', 'traffic_light', 'noise', 'sewer'],
      'graffiti': ['pigeon', 'rat', 'noise'],
      'traffic_light': ['pigeon', 'rat', 'noise'],
      'noise': ['pigeon', 'rat', 'graffiti', 'traffic_light', 'sewer'],
      'sewer': ['rat', 'noise'],
      'rush_hour': ['pigeon', 'rat', 'graffiti', 'traffic_light', 'noise', 'sewer']
    },
    environmentalFactors: {
      temperature: 22,
      humidity: 65,
      lightLevel: 78,
      noiseLevel: 95
    }
  }
];

// Helper function to get scenario by ID
export function getScenarioById(id: string): Scenario | undefined {
  return scenarios.find(s => s.id === id);
}

// Helper function to get all scenario IDs
export function getAllScenarioIds(): string[] {
  return scenarios.map(s => s.id);
}

// Helper function to get entity by ID within a scenario
export function getEntityById(scenarioId: string, entityId: string) {
  const scenario = getScenarioById(scenarioId);
  if (!scenario) return undefined;
  return scenario.entities.find(e => e.id === entityId);
}
