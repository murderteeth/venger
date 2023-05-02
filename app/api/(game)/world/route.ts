import { CreateChatCompletionResponse } from 'openai'
import { template } from '../../../utils'
import { moderated, one_shot, top_choice } from '../../../utils/ai'
import { AxiosResponse } from 'axios'
import { NextRequest, NextResponse } from 'next/server'

const world_prompt = template`
imagine a fantasy world
- it should have a name, a time period or era, a struggle between good and evil
- it should have at least one very important character worth mentioning. examples: a ruler, a rogue wizard, a rogue general, or an ancient dragon
- ${'userPrompt'}

write your response in this JSON format:
{
  "description": "describe the world in less than four paragraphs",
  "summary": "summarize the world"
}
`

export async function POST(request: NextRequest) {
  const body = await request.json()
  const apiKey = body['apiKey']
  if(!apiKey) throw 'no api key'

  const userPrompt = body['userPrompt']
  if(await moderated(apiKey, userPrompt)) throw `MODERATED: ${userPrompt}`

  const response = await one_shot(apiKey, world_prompt({userPrompt}), .7)
  console.log('/world prompt', response.data.usage)
  const world = top_choice(response as AxiosResponse<CreateChatCompletionResponse, any>)
  
  return NextResponse.json({...JSON.parse(world)})
}
