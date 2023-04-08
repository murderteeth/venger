import express from 'express'
import { CreateChatCompletionResponse } from 'openai'
import { template } from '../utils'
import { AxiosResponse } from 'axios'
import { moderated, one_shot, top_choice } from '../ai'

const character_prompt = template`
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
  ],
  "backstory": "string",
  "summary": "string"
}
`

const router = express.Router()

router.post('/', async function(req, res, next) {
  const userPrompt = req.body['userPrompt']
  if(await moderated(userPrompt)) throw `MODERATED: ${userPrompt}`

  const world = req.body['world']
  const characterResponse = await one_shot(character_prompt({world, userPrompt}), .8)
  console.log('/character prompt', characterResponse.data.usage)
  const character = top_choice(characterResponse as AxiosResponse<CreateChatCompletionResponse, any>)
  res.status(200).send({...JSON.parse(character)})
})

export default router
