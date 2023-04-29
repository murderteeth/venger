import { ChatCompletionRequestMessage, Configuration, CreateChatCompletionResponse, OpenAIApi } from 'openai'
import { AxiosResponse } from 'axios'
import { template } from './'

const model = 'gpt-3.5-turbo'

const system_prompt = `you are an ai game master created by MURDERTEETH that follows dungeons and dragons d20 srd 5e rules, powered by ${model}`
export async function one_shot(apiKey: string, prompt: string, temperature = 0.4) {  
  const openai = new OpenAIApi(new Configuration({ apiKey }))

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
    model,
    temperature
  })  
}

export async function multi_shot(apiKey: string, messages: ChatCompletionRequestMessage[], temperature = 0.4) {
  const openai = new OpenAIApi(new Configuration({ apiKey }))

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
    model,
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

export async function moderated(apiKey: string, user_prompt: string) {
  if(!user_prompt) return false
  try {
    const openai = new OpenAIApi(new Configuration({ apiKey }))
    const result = await openai.createModeration({input: user_prompt})
    return result.data.results[0].flagged
  } catch {
    return false
  }
}
