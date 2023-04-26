import express from 'express'
import { ChatCompletionRequestMessage, CreateChatCompletionResponse } from 'openai'
import { template } from '../utils'
import { AxiosResponse } from 'axios'
import { one_shot, top_choice } from '../ai'
import { parse } from 'path'

const prompt = template`
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

const router = express.Router()

router.post('/', async function(req, res, next) {
  const character = req.body['character']
  let slim = JSON.parse(character)
  delete slim['backstory']
  delete slim['summary']
  slim = JSON.stringify(slim)

  const buffer = JSON.parse(req.body['buffer']) as ChatCompletionRequestMessage[]
  let bufferTransform = ''
  buffer.forEach(message => {
    bufferTransform = `${bufferTransform}\n$- ${message.content}`
  })

  const response = await one_shot(prompt({character: slim, buffer: bufferTransform}))
  console.log('/api/sync prompt', response.data.usage)
  let blob = top_choice(response as AxiosResponse<CreateChatCompletionResponse, any>)
  console.log('response')
  console.log(blob)
  res.status(200).send({...JSON.parse(character), ...JSON.parse(blob)})
})

export default router
