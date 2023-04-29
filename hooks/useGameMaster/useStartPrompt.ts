import { usePromptCallback } from './usePromptCallback'
import { useMessages } from '../useMessages'
import { useGameData } from '../useGameData'
import { fetchStart } from '../../api'

export function useStartPrompt() {
  const { setMessages } = useMessages()
  const { world, player, setTurn } = useGameData()

  return usePromptCallback(async (userPrompt: string) => {
    if(!(world && player)) return
    setMessages(current => [...current, {role: 'assistant', contentType: 'busy'}])

    try {
      const result = await fetchStart(userPrompt, world, player)
      setMessages(current => {
        return [
          ...current.slice(0, -1), 
          {role: 'assistant', content: result.description},
          {role: 'assistant', contentType: 'options', content: result.options}
        ]
      })
      setTurn(result)
    } catch {
      setMessages(current => {
        return [...current.slice(0, -1), {role: 'assistant', contentType: 'error'}]
      })
    }
  }, [world, player, setTurn, setMessages])
}
