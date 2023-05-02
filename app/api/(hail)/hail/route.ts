import { CreateChatCompletionResponse } from 'openai'
import { AxiosResponse } from 'axios'
import { moderated, multi_shot, one_shot, to_object, top_choice } from '../../../../utils/ai'
import { NextRequest, NextResponse } from 'next/server'

const system_prompt_role = `
- you are a classifier agent
- use these class definitions to classify text and return only the class name, no conversation
[
  {
    "name": "faq",
    "class": "anything that looks like a question"
  },
  {
    "name": "settings",
    "class": "refers to settings. For example, setting up an OpenAI API key"
  },
]

- if you're unsure, return { "class": "unknown" }
- respond in this JSON format
{
  "class": "class name"
}
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
    { role: "user", content: userPrompt }
  ], .5)

  console.log('/hail prompt', response.data.usage)
  const hail = top_choice(response as AxiosResponse<CreateChatCompletionResponse, any>)
  console.log('hail', hail)
  const json = await to_object(apiKey, hail, format_prompt)
  return NextResponse.json(json)
}
