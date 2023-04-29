import { useCallback, useEffect } from 'react'
import { usePromptCallback } from './usePromptCallback'
import { useMessages } from '../useMessages'
import { useWorldPromptIntroduction } from './useWorldPrompt'
import { useApi } from '../useApi'
import { useGameData } from '../useGameData'

export function useHailPrompt() {
  const { messages, setMessages } = useMessages()
  const introduceWorldPrompt = useWorldPromptIntroduction()
  const { openAiApiKey } = useGameData()
  const { fetchHail } = useApi()

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
      🧠 Before we play the game, I'll need your OpenAI API key.`
    }, {
      role: 'assistant', content: `Have questions first? Ask!`
    }, {
      role: 'assistant', contentType: 'options', content: [
        'Setup my OpenAI API Key'
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
    } catch(error) {
      console.warn(error)
      setMessages(current => {
        return [...current.slice(0, -1), {role: 'assistant', contentType: 'error'}]
      })
    }
  }, [setMessages])
}
