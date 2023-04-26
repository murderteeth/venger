import { useCallback, useEffect } from 'react'
import { usePromptCallback } from './usePromptCallback'
import { useMessages } from '../useMessages'
import { fetchHail } from '../../api'
import { useWorldPromptIntroduction } from './useWorldPrompt'
import { useGameData } from '../useGameData'

export function useHailPrompt() {
  const { messages, setMessages } = useMessages()
  const {openAiApiKey} = useGameData()
  const introduceWorldPrompt = useWorldPromptIntroduction()

  const introduceYourself = useCallback(() => {
    setMessages([{
      role: 'assistant', content: '👋 Hail!'
    }, {
      role: 'assistant', content: `I'm Venger, your ai game master.`
    }, {
      role: 'assistant', content: `
      I'm trained to run rpg chat games based on d20 srd 5e rules, like Dungeons & Dragons.
      Together we'll create a world and character for you to play. It's ezpz!`
    }, {
      role: 'assistant', content: `
      🧠 Before we start, I need to know how to access my brain.
      I can use your OpenAI API Key or you can pay $5/mo for an Early Access Subscription.`
    }, {
      role: 'assistant', content: `Have questions? Ask!`
    }, {
      role: 'assistant', contentType: 'options', content: [
        '$5/mo Early Access Subscription',
        'Use my own OpenAI API Key'
      ]
    }])
  }, [setMessages])

  useEffect(() => {
    if(messages.length > 0) return
    if(openAiApiKey) {
      introduceWorldPrompt()
    } else {
      introduceYourself()
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
    } catch {
      setMessages(current => {
        return [...current.slice(0, -1), {role: 'assistant', contentType: 'error'}]
      })
    }
  }, [setMessages])
}
