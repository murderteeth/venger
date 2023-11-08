import { NextRequest } from 'next/server'
import { config } from '@/config'

export async function openAiApiKey(request: NextRequest) {
  if(config.NEXT_PUBLIC_BYOK) {
    const body = await request.json()
    return body['apiKey']
  } else {
    return config.OPENAI_API_KEY
  }
}
