import express from 'express'
import { Configuration, CreateChatCompletionResponse, OpenAIApi } from 'openai'
import { template } from '../utils'
import { AxiosResponse } from 'axios'

const router = express.Router()

const configuration = new Configuration({
  organization: process.env.OPENAI_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

const system_prompt = 'you are a game master that follows dungeons and dragons d20 srd 5e rules'

const description_prompt = template`
imagine a fantasy world
- something with mature themes and nuanced characters
- it should have a name, a time period or era, a struggle between good and evil
- it should have at least one very important character worth mentioning. examples: a ruler, a rogue wizard, a rogue general, or an ancient dragon
- describe the world in no more than two or three paragraphs
special requests: ${'userPrompt'}
`

const summary_prompt = template`
please summarize the provided world into one paragraph with no more than 4 sentances.

EXAMPLE
World:
Welcome to the world of Arathia, a dark and twisted land where the struggle between good and evil is ever-present. The era is known as the Age of Shadows, where the sun barely breaks through the thick, ominous clouds that hang overhead. The world is filled with mature themes and nuanced characters, where nothing is as it seems and everyone has their own motives.

At the center of this world is the ruler of Arathia, King Alric. A powerful and just leader, he has managed to keep the peace between the many warring factions of the land... until now. A rogue wizard, known only as the Dark One, has emerged from the shadows and threatens to tip the balance of power in his favor. The Dark One is a mysterious figure, feared by all who know of him. Some say he was once a great wizard, corrupted by his own lust for power. Others believe he was always evil, born into darkness and fueled by his own hatred.

As the struggle between good and evil intensifies, the fate of Arathia hangs in the balance. Can King Alric and his loyal followers stand against the might of the Dark One and his minions? Or will the land be consumed by darkness forever? The answer lies in the hands of brave adventurers like you.

World summary:
Arathia, a world shrouded in darkness during the Age of Shadows, teeters between good and evil. King Alric maintains fragile peace, but a rogue wizard known as the Dark One threatens to shift the balance of power. The fate of Arathia relies on brave adventurers who must confront the Dark One and his minions to prevent eternal darkness.
END OF EXAMPLE

special requests: ${'userPrompt'}

World:
${'description'}

World summary:
`

async function oneshot(prompt: string, temperature = 0.75) {
  return await openai.createChatCompletion({
    messages: [
      {role: 'system', content: system_prompt},
      {role: 'user', content: prompt}
    ], 
    model: 'gpt-3.5-turbo',
    temperature
  })  
}

function top(response: AxiosResponse<CreateChatCompletionResponse, any>) {
  if(!response.data.choices.length) throw '!choices'
  const content = response.data.choices[0].message?.content
  if(!content) throw '!content'
  return content
}

router.post('/', async function(req, res, next) {
  const userPrompt = req.body['userPrompt']

  const descriptionResponse = await oneshot(description_prompt({userPrompt}))
  console.log('/world description prompt', descriptionResponse.data.usage)
  const description = top(descriptionResponse as AxiosResponse<CreateChatCompletionResponse, any>)

  const summaryResponse = await oneshot(summary_prompt({userPrompt, description}))
  console.log('/world summary prompt', summaryResponse.data.usage)
  const summary = top(summaryResponse as AxiosResponse<CreateChatCompletionResponse, any>)

  res.status(200).send({ description, summary })
})

export default router
