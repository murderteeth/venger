import { MessageGram } from "./components/Messenger"

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

export async function fetchStart(prompt: string, world: World, character: Character) {
  const response = await fetch('/api/start', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({userPrompt: prompt, world: world.description, character: JSON.stringify(character)})
  })
  return await response.json() as Turn
}

export async function fetchAction(prompt: string, world: World, character: Character, buffer: MessageGram[]) {
  buffer = JSON.parse(JSON.stringify([...buffer]))
  for(let i = 0; i < buffer.length; i++) {
    if(buffer[i].contentType === 'options') {
      const options = buffer[i].content as string[]
      buffer[i - 1].content = `${buffer[i - 1].content} {options: ["${options.join('", "')}"]}`
    }
  }
  buffer = buffer.filter(message => message.contentType !== 'options')

  if(buffer[buffer.length - 1].role !== 'user') {
    buffer.push({role: 'user', content: prompt})
  }

  const response = await fetch('/api/action', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      userPrompt: prompt, 
      world: world.summary,
      character: JSON.stringify(character),
      buffer: JSON.stringify(buffer)
    })
  })

  return await response.json() as Turn
}
