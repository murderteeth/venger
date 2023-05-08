import { usePromptCallback } from './usePromptCallback'
import { useMessages } from '../useMessages'
import { useGameData } from '../useGameData'
import { useApi } from '../useApi'

export function useStartPrompt() {
  const { setMessages } = useMessages()
  const { world, player, setTurn, model } = useGameData()
  const { fetchStart } = useApi()

  return usePromptCallback(async (userPrompt: string) => {
    if(!(world && player)) return
    setMessages(current => [...current, {role: 'assistant', contentType: 'busy'}])

    try {
      const result = await fetchStart(userPrompt, world, player, model)
      setMessages(current => {
        return [
          ...current.slice(0, -1), 
          {role: 'assistant', content: result.description},
          {role: 'assistant', contentType: 'options', content: result.options}
        ]
      })
      setTurn(result)
    } catch(error) {
      console.warn(error)
      setMessages(current => {
        return [...current.slice(0, -1), {role: 'assistant', contentType: 'error'}]
      })
    }
  }, [world, player, setTurn, setMessages])
}
