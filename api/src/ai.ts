import { Configuration, CreateChatCompletionResponse, OpenAIApi } from 'openai'
import { AxiosResponse } from 'axios'
import { template } from './utils'

const configuration = new Configuration({
  organization: process.env.OPENAI_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

const system_prompt = 'you are a game master that follows dungeons and dragons d20 srd 5e rules'

const rewrite_prompt = template`
rewrite this text:
${'source'}

${'output_prompt'}
`

export async function one_shot(prompt: string, temperature = 0.4) {
  return await openai.createChatCompletion({
    messages: [
      {role: 'system', content: system_prompt},
      {role: 'user', content: prompt}
    ], 
    model: 'gpt-3.5-turbo',
    temperature
  })  
}

export function top_choice(response: AxiosResponse<CreateChatCompletionResponse, any>) {
  if(!response.data.choices.length) throw '!choices'
  const content = response.data.choices[0].message?.content
  if(!content) throw '!content'
  return content
}

export async function to_object(source: string, output_prompt: string) {
  const rewriteResponse = await one_shot(rewrite_prompt({source, output_prompt}), .1) as AxiosResponse<CreateChatCompletionResponse, any>
  console.log('/api.. rewrite prompt', rewriteResponse.data.usage)
  const rewrite = top_choice(rewriteResponse)
  return JSON.parse(rewrite)
}
