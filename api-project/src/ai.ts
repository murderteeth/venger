import { ChatCompletionRequestMessage, Configuration, CreateChatCompletionResponse, OpenAIApi } from 'openai'
import { AxiosResponse } from 'axios'
import { template } from './utils'

const configuration = new Configuration({
  organization: process.env.OPENAI_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

const system_prompt = 'you are a game master that follows dungeons and dragons d20 srd 5e rules'
export async function one_shot(prompt: string, temperature = 0.4) {
  if(process.env.NODE_ENV === 'development') {
    console.log()
    console.log('prompt/ ---------------')
    console.log(`system: ${system_prompt}`)
    console.log(prompt)
    console.log('prompt/ ---------------')
    console.log()
  }

  return await openai.createChatCompletion({
    messages: [
      {role: 'system', content: system_prompt},
      {role: 'user', content: prompt}
    ], 
    model: 'gpt-3.5-turbo',
    temperature
  })  
}

export async function multi_shot(messages: ChatCompletionRequestMessage[], temperature = 0.4) {
  if(process.env.NODE_ENV === 'development') {
    console.log()
    console.log('prompt/ ---------------')
    messages.forEach(message => {
      console.log(`${message.role}: ${message.content}`)
    })
    console.log('prompt/ ---------------')
    console.log()
  }

  return await openai.createChatCompletion({
    messages,
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

const rewrite_prompt = template`
rewrite this text:
${'source'}

${'output_prompt'}
`
export async function to_object(source: string, output_prompt: string) {
  const rewriteResponse = await one_shot(rewrite_prompt({source, output_prompt}), .1) as AxiosResponse<CreateChatCompletionResponse, any>
  console.log('/api.. rewrite prompt', rewriteResponse.data.usage)
  const rewrite = top_choice(rewriteResponse)
  return JSON.parse(rewrite)
}

export async function moderated(user_prompt: string) {
  if(!user_prompt) return false
  try {
    const result = await openai.createModeration({input: user_prompt})
    return result.data.results[0].flagged
  } catch {
    return false
  }
}
