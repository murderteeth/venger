import { useCallback, useEffect } from 'react'
import { usePromptCallback } from './usePromptCallback'
import { useMessages } from '../useMessages'
import { useWorldPromptIntroduction } from './useWorldPrompt'
import { useApi } from '../useApi'
import { useGameData } from '../useGameData'
import { config } from '@/config'
import { MessageGram } from '@/components/Messenger'

export function useHailPrompt() {
  const { messages, setMessages } = useMessages()
  const introduceWorldPrompt = useWorldPromptIntroduction()
  const { openAiApiKey } = useGameData()
  const { fetchHail } = useApi()

  const introduceYourself = useCallback(() => {
    const intro = [{
      role: 'assistant', content: '👋 Hail!'
    }, {
      role: 'assistant', content: `
      I'm Venger, your ai game master.`
    }, {
      role: 'assistant', content: `
      I'm trained to run choose-your-own-adventure stories based on d20 srd 5e rules like Dungeons & Dragons.
      Sweet!`
    }] as MessageGram[]

    if(config.NEXT_PUBLIC_BYOK) {
      intro.push(...[{
        role: 'assistant', content: `
        🧠 Before we start, lets setup your OpenAI API key.
        You can also enable GPT4 if you have access to it 👀`
      }, {
        role: 'assistant', contentType: 'component', content: 'settings'
      }] as MessageGram[])
    }

    setMessages(intro)
  }, [setMessages])

  useEffect(() => {
    if(messages.length > 0) return
    if(config.NEXT_PUBLIC_BYOK) {
      if(openAiApiKey) {
        introduceWorldPrompt()
      } else {
        introduceYourself()
      }
    } else {
      introduceYourself()
      introduceWorldPrompt()
    }
  }, [messages, openAiApiKey, introduceYourself, introduceWorldPrompt])

  return usePromptCallback(async (userPrompt: string) => {
    setMessages(current => {
      return [...current, {role: 'assistant', contentType: 'busy'}]
    })

    try {
      const hail = await fetchHail(userPrompt)
      setMessages(current => {
        const results = [...current.slice(0, -1)]
        results.push({role: 'assistant', content: hail.message})

        if(hail.options.length > 0) {
          results.push({role: 'assistant', contentType: 'options', content: hail.options})
        }

        if(hail.component) {
          results.push({role: 'assistant', contentType: 'component', content: hail.component})
        }

        return results
      })
    } catch(error) {
      console.warn(error)
      setMessages(current => {
        return [...current.slice(0, -1), {role: 'assistant', contentType: 'error'}]
      })
    }
  }, [setMessages])
}
