import { OpenAI } from 'openai'
import { template } from '../../../../utils'
import { moderated, one_shot, standard_system_prompt, top_choice } from '../../../../utils/ai'
import { NextRequest, NextResponse } from 'next/server'
import { openAiApiKey } from '../../openAiApiKey'

const prompt = template`
SYSTEM: ${'standard_system_prompt'}

- use GAMELOG to update CURRENT PLAYER STATS
- check the gamelog for changes to hitpoints, inventory, and experience points
- do not make changes to anything except hitpoints, inventory, and experience points
- do not make conversation

CURRENT PLAYER STATS:
${'character'}

GAMELOG:
${'buffer'}
END GAMELOG

rewrite your response in this JSON format:
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
  ]
}
`

export async function POST(request: NextRequest) {
  const apiKey = await openAiApiKey(request)
  if(!apiKey) throw 'no api key'

  const body = await request.json()
  const character = body['character']
  let slim = JSON.parse(character)
  delete slim['backstory']
  delete slim['summary']
  slim = JSON.stringify(slim)
  if(await moderated(apiKey, slim)) throw `MODERATED: ${slim}`

  const buffer = JSON.parse(body['buffer']) as OpenAI.Chat.Completions.ChatCompletionMessageParam[]
  if(await moderated(apiKey, buffer.join())) throw `MODERATED: ${buffer}`

  let bufferTransform = ''
  buffer.forEach(message => {
    bufferTransform = `${bufferTransform}\n$- ${message.content}`
  })

  const response = await one_shot(apiKey, prompt({standard_system_prompt, character: slim, buffer: bufferTransform}))
  console.log('/api/sync prompt', response.usage)
  let blob = top_choice(response)
  console.log('response')
  console.log(blob)
  
  return NextResponse.json({...JSON.parse(character), ...JSON.parse(blob)})
}
