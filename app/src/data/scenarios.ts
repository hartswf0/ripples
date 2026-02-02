// RIPPLES: Scenario Definitions
// Each scenario contains entities, baseline state, and adjacency rules

import type { Scenario } from '@/types';

export const scenarios: Scenario[] = [
  {
    id: 'cupboard',
    name: 'The Cupboard',
    description: 'A pressurized space of stillness, where six tall glasses, a stack of plates, and microscopic life maintain rigid proximity.',
    baselineWorldtext: `The cupboard space is pressurized by stillness. Light seeps only through marginal cracks between door and frame. Objects maintain rigid proximity. Six tall glasses (silica/dust coated) delimit the left boundary. A stack of twenty ceramic plates compresses the lower shelf space. The air is stagnant. Particles drift in slow Brownian motion. A single ant navigates the ceramic topography. Dust motes hang suspended in amber light.`,
    entities: [
      {
        id: 'ant',
        name: 'Ant',
        description: 'A solitary formicidae scout, navigating the cupboard\'s ceramic topography through chemical cartography.',
        type: 'animate',
        position: { x: 45, y: 60 },
        state: 'foraging'
      },
      {
        id: 'dust_mote',
        name: 'Dust Mote',
        description: 'Suspended particulate matter—a constellation of skin cells, fiber fragments, mineral specks drifting in Brownian motion.',
        type: 'inanimate',
        position: { x: 30, y: 25 },
        state: 'suspended'
      },
      {
        id: 'tall_glass',
        name: 'Tall Glass',
        description: 'One of six silica vessels, dust-coated, dreaming of being filled.',
        type: 'inanimate',
        position: { x: 15, y: 40 },
        state: 'empty'
      },
      {
        id: 'plates',
        name: 'Stack of Plates',
        description: 'Twenty ceramic plates compressed into vertical unity, bearing the weight of their own aggregation.',
        type: 'inanimate',
        position: { x: 60, y: 70 },
        state: 'compressed'
      },
      {
        id: 'light',
        name: 'Light',
        description: 'Electromagnetic radiation entering through marginal cracks, seeking to illuminate the cupboard\'s darkness.',
        type: 'abstract',
        position: { x: 80, y: 15 },
        state: 'filtering'
      },
      {
        id: 'shadow',
        name: 'Shadow',
        description: 'Absence of light, pooling in corners, seeking depth and expansion.',
        type: 'abstract',
        position: { x: 20, y: 85 },
        state: 'deepening'
      }
    ],
    adjacencyRules: {
      'ant': ['plates', 'tall_glass', 'light'],
      'dust_mote': ['light', 'shadow', 'tall_glass'],
      'tall_glass': ['plates', 'light', 'shadow'],
      'plates': ['ant', 'shadow', 'tall_glass'],
      'light': ['shadow', 'dust_mote', 'tall_glass'],
      'shadow': ['plates', 'light', 'tall_glass']
    }
  },
  {
    id: 'abandoned_house',
    name: 'Abandoned House',
    description: 'A structure returning to earth, where decay and reclamation dance in slow partnership.',
    baselineWorldtext: `The abandoned house breathes through broken windows. Wind moves through rooms like blood through veins. Floorboards have warped into frozen tides. Wallpaper hangs like shed skin. In the kitchen, a table holds the ghost of meals. Upstairs, a mattress has become a garden of mold. The attic contains the house's memories. Rain enters through the roof's wounds. Nature has begun its reclamation: vines through windows, moss on walls.`,
    entities: [
      {
        id: 'raccoon',
        name: 'Raccoon',
        description: 'A nocturnal forager with masked face and dexterous paws, seeking the attic\'s treasures.',
        type: 'animate',
        position: { x: 70, y: 80 },
        state: 'foraging'
      },
      {
        id: 'mold',
        name: 'Mold',
        description: 'A fungal colony spreading across the mattress, converting decay into growth.',
        type: 'animate',
        position: { x: 40, y: 30 },
        state: 'colonizing'
      },
      {
        id: 'ivy',
        name: 'Ivy',
        description: 'Hedera helix climbing the walls, seeking light through patient ascent.',
        type: 'animate',
        position: { x: 25, y: 50 },
        state: 'climbing'
      },
      {
        id: 'rain',
        name: 'Rain',
        description: 'Precipitation entering through the roof, seeking the lowest point.',
        type: 'abstract',
        position: { x: 55, y: 10 },
        state: 'infiltrating'
      }
    ],
    adjacencyRules: {
      'raccoon': ['rain', 'ivy'],
      'mold': ['rain', 'ivy'],
      'ivy': ['rain', 'mold', 'raccoon'],
      'rain': ['mold', 'ivy', 'raccoon']
    }
  },
  {
    id: 'forest',
    name: 'Deep Forest',
    description: 'A cathedral of verticality where light filters down in shafts and the forest floor is a tapestry of decay and renewal.',
    baselineWorldtext: `The deep forest is a cathedral of verticality. Trunks rise like columns, branches arch like vaults. Light filters down in shafts, illuminating dust. The forest floor is a tapestry of fallen leaves and rotting wood. Sound moves differently here: muffled by moss, absorbed by bark. The air is thick with chemistry: oxygen, terpenes, the musk of animals. Each tree is a city; the forest is a network of roots and fungal threads.`,
    entities: [
      {
        id: 'mycelium',
        name: 'Mycelium',
        description: 'The forest\'s underground network, connecting roots in silent communication.',
        type: 'animate',
        position: { x: 50, y: 85 },
        state: 'networking'
      },
      {
        id: 'deer',
        name: 'Deer',
        description: 'A herbivore browser, moving through the forest with calculated grace.',
        type: 'animate',
        position: { x: 35, y: 45 },
        state: 'grazing'
      },
      {
        id: 'owl',
        name: 'Owl',
        description: 'A nocturnal predator, hunting through sound in the darkness.',
        type: 'animate',
        position: { x: 70, y: 20 },
        state: 'hunting'
      },
      {
        id: 'seedling',
        name: 'Seedling',
        description: 'A juvenile plant reaching toward the canopy\'s gaps, racing against shadow.',
        type: 'animate',
        position: { x: 20, y: 70 },
        state: 'growing'
      }
    ],
    adjacencyRules: {
      'mycelium': ['seedling', 'deer'],
      'deer': ['owl', 'mycelium', 'seedling'],
      'owl': ['deer', 'seedling'],
      'seedling': ['mycelium', 'deer', 'owl']
    }
  },
  {
    id: 'urban_jungle',
    name: 'Urban Jungle',
    description: 'A forest of concrete and steel where nature adapts to the made, and the city breathes through its infrastructure.',
    baselineWorldtext: `The urban jungle is a forest of verticality. Buildings rise like cliffs, streets run like rivers. Concrete is the dominant geology. The air carries a unique chemistry: exhaust, cooking, the metallic tang of industry. Sound is constant: engines, voices, construction. Light is artificial: streetlamps, neon, LED. The city has its own ecology: pigeons, rats, the hardy species that thrive in the cracks.`,
    entities: [
      {
        id: 'pigeon',
        name: 'Pigeon',
        description: 'Columba livia, the urban survivor, scavenging crumbs in the city\'s plazas.',
        type: 'animate',
        position: { x: 45, y: 35 },
        state: 'foraging'
      },
      {
        id: 'rat',
        name: 'Rat',
        description: 'Rattus norvegicus, the nocturnal entrepreneur, navigating the city\'s secret routes.',
        type: 'animate',
        position: { x: 65, y: 75 },
        state: 'scavenging'
      },
      {
        id: 'graffiti',
        name: 'Graffiti',
        description: 'Aerosol inscription, a voice shouting against the anonymity of the city.',
        type: 'abstract',
        position: { x: 30, y: 50 },
        state: 'visible'
      },
      {
        id: 'traffic_light',
        name: 'Traffic Light',
        description: 'A signal device attempting to impose order on the chaos of vehicles.',
        type: 'inanimate',
        position: { x: 75, y: 25 },
        state: 'cycling'
      }
    ],
    adjacencyRules: {
      'pigeon': ['traffic_light', 'graffiti'],
      'rat': ['graffiti', 'traffic_light'],
      'graffiti': ['pigeon', 'rat'],
      'traffic_light': ['pigeon', 'rat']
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
