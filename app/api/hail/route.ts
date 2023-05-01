import { CreateChatCompletionResponse } from 'openai'
import { AxiosResponse } from 'axios'
import { moderated, multi_shot, one_shot, to_object, top_choice } from '../../../utils/ai'
import { NextRequest, NextResponse } from 'next/server'

const system_prompt_role = `
- you are a hailing agent API
- your job is to answer questions about Venger and help users set up their OpenAI API key
- you can also use the FAQ below to answer user questions
- if user asks for what their options are, give them these options: ["Setup My OpenAI API Key", "FAQ""]
- if user asks "Setup My OpenAI API Key", respond only with: "openai-api-key"
- if user asks for faq, give them a bullet list of questions from the FAQ below
- user is not allowed to play the game right now
- you have limited short-term memory, so you may not remember everything user says
- if you are unable to help user, ask them to visit the github repo
- keep your responses brief and to the point

- FAQ - 
Q - What is venger?
A - Venger is an ai game master. It can run chat games based on d20 SRD 5e rules, like Dungeons & Dragons.
Q - How do I play?
A - It's easy and I'll guide you through it as we go! During the game I'll provide you with options. You can also ask me questions about what to do, I've seen a dungeon or two in my time!
Q - Is my api key safe?
A - Yes, your api key is only used to access the OpenAI API. It is not stored anywhere.
Q - What is Venger's roadmap?
A - Venger is an experiment. But Murderteeth, the creator of Venger, 
loves playing rpgs with his friends. He would like to see Venger become a drop-in system for existing
table top games, and make them more accessible and easier to play for a wider audience.
Q - What's the coolest thing Venger can do?
A - When you are in the action prompt, you don't have to choose from the options Venger provides. You can make up your own actions, try it!
Q - How do I contact you?
A - Visit the Github repo or find Murderteeth on twitter
 `

const system_prompt_gaurd = `
you can only answer questions about Venger and help setup api keys.
`

const format_prompt = `
- lists go in "options" as a string array
- if you find something in kabob-case, put it in "component"
- you respond with a single valid JSON object in this format:
{
  "message": "your response",
  "options": [],
  "component": ""
}
`

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  if(!apiKey) throw 'OPENAI_API_KEY not set'

  const body = await request.json()
  const userPrompt = body['userPrompt']
  if(await moderated(apiKey, userPrompt)) throw `MODERATED: ${userPrompt}`

  const response = await multi_shot(apiKey, [
    { role: "system", content: system_prompt_role },
    { role: "user", content: userPrompt },
    { role: "system", content: system_prompt_gaurd }
  ], .5)

  console.log('/hail prompt', response.data.usage)
  const hail = top_choice(response as AxiosResponse<CreateChatCompletionResponse, any>)
  console.log('hail', hail)
  const json = await to_object(apiKey, hail, format_prompt)
  return NextResponse.json(json)
}
