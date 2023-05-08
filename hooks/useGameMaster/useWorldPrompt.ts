import { usePromptCallback } from './usePromptCallback'
import { useMessages } from '../useMessages'
import { useGameData } from '../useGameData'
import { useCallback } from 'react'
import { useApi } from '../useApi'

export function useWorldPromptIntroduction() {
  const { setMessages } = useMessages()
  return useCallback(() => {
    setMessages(current => {
      return [...current, {
        role: 'assistant', content: `Your OpenAI API key has been set. Let's create a world to play in!`
      }, {
        role: 'assistant', content: `
        Here's some world examples. You can also
        make up your own world prompt or just hit [Enter] for defaults.`
      }
      , {
        role: 'assistant', contentType: 'options', content: [
          'Classic D&D',
          'Volcano Island',
          'Moonbase 6',
          'All characters are kittens'
        ]
      }]
    })
  }, [setMessages])
}

export function useWorldPrompt() {
  const { setMessages } = useMessages()
  const { setWorld } = useGameData()
  const { fetchWorld } = useApi()

  return usePromptCallback(async (userPrompt: string) => {
    setMessages(current => {
      return [...current, {role: 'assistant', contentType: 'busy'}]
    })
  
    try {
      const result = await fetchWorld(userPrompt)
      setMessages(current => {
        return [
          ...current.slice(0, -1), 
          {role: 'assistant', content: 'A new world awaits you..'},
          {role: 'assistant', content: result.summary}
        ]
      })
      setWorld(result)
      setMessages(current => {
        return [
          ...current, 
          {role: 'assistant', content: `
          What kind of character do you want to play?`},
          {role: 'assistant', content: `
          Here's some player examples. You can also
          make up your own player prompt or just hit [Enter] for defaults.`},
          {
            role: 'assistant', contentType: 'options', content: [
              'Half-Orc, Barbarian, High Intimidation',
              'Half-Elf, Cleric, High Wisdom',
              'Gnome, Wizard, High Intelligence',
              'Tabaxi, Bard, High Charisma, High Performance, Named Mittens'
            ]
          }
        ]
      })
    } catch(error) {
      console.warn(error)
      setMessages(current => {
        return [...current.slice(0, -1), {role: 'assistant', contentType: 'error'}]
      })
    }
  }, [setWorld, setMessages])
}
