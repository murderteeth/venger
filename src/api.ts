export interface World {
  description: string,
  summary: string
}

export interface Skill {
  name: string,
  modifier: number
}

export interface InventoryItem {
  item: string,
  count: number
}

export interface Character {
  name: string,
  age: number,
  gender: string,
  alignment: string,
  character_class: string,
  race: string,
  attributes: {
    strength: number,
    dexterity: number,
    constitution: number,
    intelligence: number,
    wisdom: number,
    charisma: number
  },
  skills: Skill[],
  max_hitpoints: number,
  hitpoints: number,
  experience_points: number,
  inventory: InventoryItem[],
  backstory: string,
  summary: string
}

export interface Turn {
  description: string,
  options: string[]
}

export async function fetchWorld(prompt: string) {
  const response = await fetch('/api/world', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({userPrompt: prompt})
  })
  return await response.json() as World
}

export async function fetchCharacter(prompt: string, world: World) {
  const response = await fetch('/api/character', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({userPrompt: prompt, world: world.description})
  })
  return await response.json() as Character
}

export async function fetchEncounterStart(world: World, character: Character) {
  const response = await fetch('/api/encounter/start', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({world: world.summary, character: JSON.stringify(character)})
  })
  return await response.json() as Turn
}
