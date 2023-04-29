import { ChatCompletionRequestMessage, CreateChatCompletionResponse } from 'openai'
import { template } from '../../../utils'
import { moderated, one_shot, top_choice } from '../../../utils/ai'
import { AxiosResponse } from 'axios'
import { NextRequest, NextResponse } from 'next/server'

const prompt = template`
- you are GAMEMASTER, I am PLAYER
- we are playing a turn based game of dungeons and dragons
- your job is to describe what is happening and direct player actions
- when you respond, append your response with a no more than 3 options for how PLAYER can proceed
- each option should be coherent with PLAYER's status
- each option should be less than 4 words, and should not contain stop words, and should not contain pronouns
- use this format to append options to your response, {options: ["one", "two", "three"]}
- if PLAYER's previous action requires a dice roll, 
  your response should only instruct the PLAYER which dice to roll (without modifiers), 
  append only one option like this: {options: ["Roll #numberofdice d#numberofsides"]},
  your response stops there
- if PLAYER rolled dice in their previous action, add modifiers, describe the outcome, give PLAYER new options

OUR GAME IS TAKING PLACE IN THIS WORLD:
${'world'}

CURRENT PLAYER STATUS:
${'character'}

EXAMPLE CONVERSATION
GAMEMASTER: The kobold is staring you down. What do you do? {options: ["Attack", "Negotiate", "Flee"]}
PLAYER: Attack
GAMEMASTER: You prepare your sword. Roll to attack! {options: ["Roll 1d20"]}
PLAYER: I roll a 15
GAMEMASTER: With a role of 15 plus your strength modifier you get a total of 17. Your sword cleaves into the kobold. Roll damage {options: ["Roll 1d12"]}
PLAYER: I roll a 6
GAMEMASTER: You role a 6, plus your strength modifier, you do a total of 8 damage. The kobold is down!
END EXAMPLE

PREDICT WHAT GAMEMASTER SAYS NEXT IN THIS CONVERSATION:
${'buffer'}
`

function slimCharacter(character: string) {
  const json = JSON.parse(character)
  delete json.backstory
  return JSON.stringify(json)
}


export async function POST(request: NextRequest) {
  const body = await request.json()
  const world = body['world']
  const character = slimCharacter(body['character'])
  const buffer = JSON.parse(body['buffer']) as ChatCompletionRequestMessage[]
  if(await moderated(buffer[0].content)) throw `MODERATED: ${buffer[0].content}`

  let bufferTransform = ''
  buffer.forEach(message => {
    bufferTransform = `${bufferTransform}\n${message.role}: ${message.content}`
  })
  bufferTransform = bufferTransform.replace(/assistant:/g, 'GAMEMASTER:')
  bufferTransform = bufferTransform.replace(/user:/g, 'PLAYER:')

  const response = await one_shot(prompt({world, character, buffer: bufferTransform}))
  console.log('/api/action prompt', response.data.usage)
  let blob = top_choice(response as AxiosResponse<CreateChatCompletionResponse, any>)
  blob = blob.split('PLAYER:')[0]
  blob = blob.replace('[[', '[').replace(']]', ']')
  console.log('response')
  console.log(blob)

  blob = blob.replace(/GAMEMASTER:/g, '')

  const optionRegex = /{options:\s*\[([^\]]*)\]}/;
  const match = blob.match(optionRegex)
  let options: string[] = []
  let description: string = blob

  if (match) {
    options = match[1].split(",").map(option => option.trim().replace(/"/g, ''))
    description = blob.replace(optionRegex, "")
  }

  console.log('description, options')
  console.log(description, options)

  return NextResponse.json({description, options})
}
