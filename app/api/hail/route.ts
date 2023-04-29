import { CreateChatCompletionResponse } from 'openai'
import { AxiosResponse } from 'axios'
import { template } from '../../../utils'
import { moderated, one_shot, top_choice } from '../../../utils/ai'
import { NextRequest, NextResponse } from 'next/server'

const hailing_prompt = template`
SUBSYSTEM: you are currently supporting a customer
SUBSYSTEM: even though you are normally a game master, for now you are only a sales agent
SUBSYSTEM: if user asks for options, set the options in your response, {message: "Here are your options", options: ["$5/mo Early Access Subscription", "Use my own OpenAI API Key"]}
SUBSYSTEM: if user asks to use their own openai api key, set the component in your response, {message: "Set your API key here", options: [], component: "openai-api-key"}
SUBSYSTEM: if user asks to use the early access subscription, set the component in your response, {message: "Subscribe here", options: [], component: "early-access-subscription"}

- keep your responses short and to the point
- user is not allowed to play the game right now
- use the information below to answer user's questions
- if you are unable to help user, ask them to visit the github repo

FAQ:
Q: What is venger?
A: Venger is an ai game master. It can run chat games based on d20 SRD 5e rules, like Dungeons & Dragons.
Q: How do I play?
A: It's easy and I'll guide you through it as we go! During the game I'll provide you with options. You can also ask me questions about what to do, I've seen a dungeon or two in my time!
Q: Is my api key safe?
A: Yes, your api key is only used to access the OpenAI API. It is not stored anywhere.
Q: What is the Early Access Subscription?
A: When you subscribe to Early Access we pay for access to Open AI's API so you don't have to. Plus you get access to the latest features and unlimited games.
Q: How do I cancel my subscription?
A: You can cancel your subscription at any time using your Stripe account
Q: What is Venger's roadmap?
A: Venger is an experiment and we're still figuring it out. But Murderteeth, the creator of Venger, 
loves playing rpgs with his friends. He would like to see Venger become a drop-in system for existing
table top games, and make them more accessible and easier to play for wider audience.
Q: What's the coolest thing Venger can do?
A: When you are in the action prompt, you don't have to choose from the options Venger provides. You can make up your own actions, try it!
Q: How do I contact you?
A: Visit the Github repo or find Murderteeth on twitter


USER: ${'userPrompt'}
SUBSYSTEM: your responses may only fit the role of sales agent
ASSISTANT:


write your response in this JSON format:
{
  "message": "your response",
  "options": [],
  "component": ""
}
`

export async function POST(request: NextRequest) {
  const body = await request.json()
  const userPrompt = body['userPrompt']
  if(await moderated(userPrompt)) throw `MODERATED: ${userPrompt}`

  const response = await one_shot(hailing_prompt({userPrompt}), .7)
  console.log('/hail prompt', response.data.usage)
  const hail = top_choice(response as AxiosResponse<CreateChatCompletionResponse, any>)

  return NextResponse.json({...JSON.parse(hail)})
}
