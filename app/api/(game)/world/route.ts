import { OpenAI } from 'openai'
import { template } from '../../../../utils'
import { moderated, one_shot, top_choice } from '../../../../utils/ai'
import { AxiosResponse } from 'axios'
import { NextRequest, NextResponse } from 'next/server'
import { standard_system_prompt } from '../../../../utils/ai'
import { openAiApiKey } from '../../openAiApiKey'


const world_prompt = template`
${'standard_system_prompt'}

imagine a fantasy world
- it should have a name, a time period or era, a struggle between good and evil
- it should have at least one very important character worth mentioning. examples: a ruler, a rogue wizard, a rogue general, or an ancient dragon
- ${'userPrompt'}

write your response in pure JSON using this format:
{
  "description": "describe the world in less than four paragraphs",
  "summary": "summarize the world"
}
`

export async function POST(request: NextRequest) {  
  const apiKey = await openAiApiKey(request)
  if(!apiKey) throw 'no api key'

  const body = await request.json()
  const userPrompt = body['userPrompt']
  if(await moderated(apiKey, userPrompt)) throw `MODERATED: ${userPrompt}`

  const response = await one_shot(apiKey, world_prompt({standard_system_prompt, userPrompt}), .7)
  console.log('/world prompt', response.usage)
  const world = top_choice(response)
  console.log('world', world)
  
  return NextResponse.json({...JSON.parse(world)})
}
