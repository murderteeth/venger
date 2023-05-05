import { ChatCompletionRequestMessage, Configuration, CreateChatCompletionResponse, OpenAIApi } from 'openai'
import { AxiosResponse } from 'axios'
import { template } from './'

const GPT3 = 'gpt-3.5-turbo'
const GPT4 = 'gpt-4'
export const DEFAULT_MODEL = GPT3
export const STRONGEST_MODEL = GPT4

export const standard_system_prompt = `you are an ai game master created by MURDERTEETH that follows dungeons and dragons d20 srd 5e rules, powered by ${DEFAULT_MODEL}`

export async function one_shot(apiKey: string, prompt: string, temperature = 0.4, model = DEFAULT_MODEL) {  
  const openai = new OpenAIApi(new Configuration({ apiKey }))

  if(process.env.NODE_ENV === 'development') {
    console.log()
    console.log('model', model)
    console.log('prompt/ ---------------')
    console.log(prompt)
    console.log('prompt/ ---------------')
    console.log()
  }

  return await openai.createChatCompletion({
    messages: [{ role: 'user', content: prompt }], 
    model: model,
    temperature
  })  
}

export async function multi_shot(apiKey: string, messages: ChatCompletionRequestMessage[], temperature = 0.4, model = DEFAULT_MODEL) {
  const openai = new OpenAIApi(new Configuration({ apiKey }))

  if(process.env.NODE_ENV === 'development') {
    console.log()
    console.log('model', model)
    console.log('prompt/ ---------------')
    messages.forEach(message => {
      console.log(`${message.role}: ${message.content}`)
    })
    console.log('prompt/ ---------------')
    console.log()
  }

  return await openai.createChatCompletion({
    messages,
    model: model,
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
- you are a message rewriting ai
- you rewrite user messages into valid JSON format
- you only respond in valid JSON format, no conversation
- your response must pass JSON validation
${'format_prompt'}
`

export async function to_object(apiKey: string, source: string, format_prompt: string, model = DEFAULT_MODEL) {
  const response = await multi_shot(apiKey, [
    { role: "system", content: rewrite_prompt({format_prompt}) },
    { role: "user", content: source }
  ], .4, model) as AxiosResponse<CreateChatCompletionResponse, any>
  console.log('/api.. rewrite prompt', response.data.usage)
  const rewrite = top_choice(response)
  console.log('rewrite', rewrite)
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
