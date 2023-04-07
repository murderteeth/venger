import express from 'express'
import { CreateChatCompletionResponse } from 'openai'
import { template } from '../utils'
import { AxiosResponse } from 'axios'
import { one_shot, top_choice } from '../ai'

const world_prompt = template`
imagine a fantasy world
- something with mature themes and nuanced characters
- it should have a name, a time period or era, a struggle between good and evil
- it should have at least one very important character worth mentioning. examples: a ruler, a rogue wizard, a rogue general, or an ancient dragon
- ${'userPrompt'}

write your response in this JSON format:
{
  "description": "describe the world in less than four paragraphs",
  "summary": "summarize the world"
}
`

const router = express.Router()

router.post('/', async function(req, res, next) {
  const userPrompt = req.body['userPrompt']
  const response = await one_shot(world_prompt({userPrompt}), .7)
  console.log('/world prompt', response.data.usage)
  const world = top_choice(response as AxiosResponse<CreateChatCompletionResponse, any>)
  res.status(200).send({...JSON.parse(world)})
})

export default router
