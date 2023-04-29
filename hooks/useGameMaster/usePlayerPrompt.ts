import { usePromptCallback } from './usePromptCallback'
import { useMessages } from '../useMessages'
import { useGameData } from '../useGameData'
import { useApi } from '../useApi'

export function usePlayerPrompt() {
  const { setMessages } = useMessages()
  const { world, setPlayer } = useGameData()
  const { fetchCharacter } = useApi()

  return usePromptCallback(async (userPrompt: string) => {
    if(!world) return
    setMessages(current => [...current, {role: 'assistant', contentType: 'busy'}])

    try {
      const result = await fetchCharacter(userPrompt, world)
      setMessages(current => {
        return [
          ...current.slice(0, -1), 
          {role: 'assistant', content: `Your character is ready..`},
          {role: 'assistant', content: result.summary},
          {role: 'assistant', content: `Ready for adventure?`},
          {role: 'assistant', content: `Where would you like to start? Chose an option or start wherever you like ✨`},
          {role: 'assistant', contentType: 'options', content: ['Tavern', 'Cave', 'The Forest']}
        ]
      })
      setPlayer(result)
    } catch(error) {
      console.warn(error)
      setMessages(current => {
        return [...current.slice(0, -1), {role: 'assistant', contentType: 'error'}]
      })
    }
  }, [world, setPlayer, setMessages])
}
