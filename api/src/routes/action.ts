import express from 'express'
import { ChatCompletionRequestMessage, CreateChatCompletionResponse } from 'openai'
import { template } from '../utils'
import { AxiosResponse } from 'axios'
import { one_shot, top_choice } from '../ai'

const prompt = template`
- you are GAMEMASTER, I am PLAYER
- we are playing a turn based game of dungeons and dragons
- your job is to describe what is happening and direct player actions
- when you respond, append your response with a no more than 3 options for how PLAYER can proceed
- each option should be coherent with PLAYER's status
- each option should be less than 4 words
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

const router = express.Router()

function slimCharacter(character: string) {
  const json = JSON.parse(character)
  delete json.backstory
  return JSON.stringify(json)
}

router.post('/', async function(req, res, next) {
  const world = req.body['world']
  const character = slimCharacter(req.body['character'])
  const buffer = JSON.parse(req.body['buffer']) as ChatCompletionRequestMessage[]

  let bufferTransform = ''
  buffer.forEach(message => {
    bufferTransform = `${bufferTransform}\n${message.role}: ${message.content}`
  })
  bufferTransform = bufferTransform.replace(/assistant:/g, 'GAMEMASTER:')
  bufferTransform = bufferTransform.replace(/user:/g, 'PLAYER:')

  const response = await one_shot(prompt({world, character, buffer: bufferTransform}))
  console.log('/api/action prompt', response.data.usage)
  let blob = top_choice(response as AxiosResponse<CreateChatCompletionResponse, any>)
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

  res.status(200).send({description, options})
})

export default router
