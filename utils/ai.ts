import { OpenAI } from 'openai'
import { template } from './'

export const DEFAULT_MODEL = 'gpt-4-1106-preview'
export const STRONGEST_MODEL = 'gpt-4-1106-preview'
export const MODELS = [DEFAULT_MODEL, STRONGEST_MODEL]
export type Model = 'gpt-4-1106-preview' | 'gpt-3.5-turbo';

export const standard_system_prompt = `you are an ai game master created by MURDERTEETH that follows dungeons and dragons d20 srd 5e rules`

export async function one_shot(apiKey: string, prompt: string, temperature = 0.4, model: Model = DEFAULT_MODEL, json = true) {
  const openai = new OpenAI({ apiKey })

  if(process.env.NODE_ENV === 'development') {
    console.log()
    console.log('model', model)
    console.log('prompt/ ---------------')
    console.log(prompt)
    console.log('prompt/ ---------------')
    console.log()
  }

  return await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }], 
    model: model,
    temperature,
    response_format: json ? { type: "json_object" } : undefined
  })  
}

export async function multi_shot(apiKey: string, messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[], temperature = 0.4, model: Model = DEFAULT_MODEL, json = true) {
  const openai = new OpenAI({ apiKey })

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

  return await openai.chat.completions.create({
    messages,
    model: model,
    temperature,
    response_format: json ? { type: "json_object" } : undefined
  })  
}

export function top_choice(response: OpenAI.Chat.Completions.ChatCompletion) {
  if(!response.choices.length) throw '!choices'
  const content = response.choices[0].message?.content
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

export async function moderated(apiKey: string, user_prompt: string) {
  if(!user_prompt) return false
  try {
    const openai = new OpenAI({ apiKey })
    const result = await openai.moderations.create({input: user_prompt})
    return result.results[0].flagged
  } catch {
    return false
  }
}
