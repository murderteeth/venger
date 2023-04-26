import { useCallback } from 'react'
import { useBusy } from '../../components/Busy'

export function usePromptCallback(prompt: (userPrompt: string) => Promise<void | string>, deps: any[]) {
  const { setBusy } = useBusy()
  return useCallback(async (userPrompt: string) => {
    setBusy(true)
    const result = await prompt(userPrompt)
    setBusy(false)
    return result
  }, [prompt, ...deps]) //eslint-disable-line react-hooks/exhaustive-deps
}
