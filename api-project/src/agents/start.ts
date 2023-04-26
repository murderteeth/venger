import express from 'express'
import { CreateChatCompletionResponse } from 'openai'
import { template } from '../utils'
import { AxiosResponse } from 'axios'
import { moderated, one_shot, top_choice } from '../ai'

const start_prompt = template`
OUR GAME IS TAKING PLACE IN THIS WORLD:
${'world'}

CURRENT PLAYER STATUS:
${'character'}

- create an easy encounter set in the world that tests my character's best attributes
- describe the first scene of the encounter to me in less than four sentances
- end your response with a no more than 3 options for how my character can proceed
- each option must make sense given my character's strengths and weaknesses
- each option must make sense given the current situation
- if the character has no spells, do not offer options involving spells
- each option should be less than 4 words
- ${'userPrompt'}

rewrite your response in this JSON format:
{
  "description": "your description of the scene",
  "options": []
}
`

const router = express.Router()

router.post('/', async function(req, res, next) {
  const userPrompt = req.body['userPrompt']
  if(await moderated(userPrompt)) throw `MODERATED: ${userPrompt}`

  const world = req.body['world']
  const character = req.body['character']

  const reponse = await one_shot(start_prompt({world, character, userPrompt}), .75)
  console.log('/api/start prompt', reponse.data.usage)
  const json = top_choice(reponse as AxiosResponse<CreateChatCompletionResponse, any>)

  res.status(200).send({...JSON.parse(json)})
})

export default router
