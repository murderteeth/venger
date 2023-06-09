import { usePromptCallback } from './usePromptCallback'
import { useMessages } from '../useMessages'
import { useGameData } from '../useGameData'
import { useApi } from '../useApi'

export function useActionPrompt() {
  const { messages, setMessages } = useMessages()
  const { world, player, turn, setTurn, model } = useGameData()
  const { fetchAction } = useApi()

  return usePromptCallback(async (userPrompt: string) => {
    if(!(world && player && turn)) return
    const buffer = [...messages.filter(m => m.contentType !== 'error')]
    setMessages(current => [...current, {role: 'assistant', contentType: 'busy'}])

    try {
      const result = await fetchAction(userPrompt, world, player, buffer, model as string)
      setMessages(current => {
        if(result.options.length > 0) {
          return [
            ...current.slice(0, -1), 
            {role: 'assistant', content: result.description},
            {role: 'assistant', contentType: 'options', content: result.options}
          ]
        } else {
          return [
            ...current.slice(0, -1), 
            {role: 'assistant', content: result.description},
            {role: 'assistant', content: 'What do you want to do next?'}
          ]
        }
      })
      setTurn(result)
      return result.description
    } catch(error) {
      console.warn(error)
      setMessages(current => {
        return [...current.slice(0, -1), {role: 'assistant', contentType: 'error'}]
      })
    }
  }, [world, player, turn, setTurn, messages, setMessages])
}
