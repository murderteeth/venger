import { CreateChatCompletionResponse } from 'openai'
import { template } from '../../../../utils'
import { moderated, one_shot, standard_system_prompt, top_choice } from '../../../../utils/ai'
import { AxiosResponse } from 'axios'
import { NextRequest, NextResponse } from 'next/server'

const character_prompt = template`
SYSTEM: ${'standard_system_prompt'}

create me a level 1 dungeons and dragons character using the dungeons and dragons d20 srd 5e rules. 
INCLUDE:
- name
- hitpoints
- age
- gender
- alignment
- class
- race
- use the Standard Array method to set attributes
- assign skill modifiers
- starting inventory
- some gold
- a backstory that fits the world they're playing in
- ${'userPrompt'}

the character will be playing in this world:
${'world'}

rewrite your response in this JSON format, all properties are required but may be empty:
{
  "name": "string",
  "age": "number",
  "gender": "string",
  "alignment": "string",
  "character_class": "string",
  "race": "string",
  "attributes": {
    "strength": "number",
    "dexterity": "number",
    "constitution": "number",
    "intelligence": "number",
    "wisdom": "number",
    "charisma": "number"
  },
  "skills": [
    {"name": "string", "modifier": "number"}
  ],
  "max_hitpoints": "number",
  "hitpoints": "number",
  "experience_points": "number",
  "inventory": [
    {"item": "string", "count": "number"},
    {"item": "gold", "count": "number"}
  ],
  "backstory": "string",
  "summary": "string"
}
`

export async function POST(request: NextRequest) {
  const body = await request.json()
  const apiKey = body['apiKey']
  if(!apiKey) throw 'no api key'

  const userPrompt = body['userPrompt']
  if(await moderated(apiKey, userPrompt)) throw `MODERATED: ${userPrompt}`

  const world = body['world']
  const response = await one_shot(apiKey, character_prompt({standard_system_prompt, world, userPrompt}), .8)
  console.log('/character prompt', response.data.usage)
  const blob = top_choice(response as AxiosResponse<CreateChatCompletionResponse, any>)
  
  return NextResponse.json({...JSON.parse(blob)})
}
