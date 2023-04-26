import React, { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useGameData } from '../useGameData'
import { useWorldPrompt } from './useWorldPrompt'
import { usePlayerPrompt } from './usePlayerPrompt'
import { useStartPrompt } from './useStartPrompt'
import { useActionPrompt } from './useActionPrompt'
import { useMessages } from '../useMessages'
import { fetchSync } from '../../api'
import { useHailPrompt } from './useHailPrompt'

export interface GameMaster {
  promptType: 'hail' | 'world' | 'player' | 'start' | 'action',
  gamePrompt: (userPrompt: string) => Promise<void>,
  sync: boolean
}

export const gmContext = createContext<GameMaster>({} as GameMaster)

export const useGm = () => useContext(gmContext)

export default function GmProvider({children}: {children: ReactNode}) {
  const {messages} = useMessages()
  const {openAiApiKey, world, player, setPlayer, turn} = useGameData()
  const hailPrompt = useHailPrompt()
  const worldPrompt = useWorldPrompt()
  const playerPrompt = usePlayerPrompt()
  const startPrompt = useStartPrompt()
  const actionPrompt = useActionPrompt()
  const [sync, setSync] = useState(false)

  const promptType = useMemo(() => {
    if(!openAiApiKey) return 'hail'
    if(!world) return 'world'
    if(!player) return 'player'
    if(!turn) return 'start'
    return 'action'
  }, [openAiApiKey, world, player, turn])

  const doSync = useCallback(async (lastestMessage: string) => {
    if(!player) return
    setSync(true)
    console.log('sync - start')
    try {
      const update = await fetchSync(player, [...messages, {role: 'assistant', content: lastestMessage}])
      console.log('sync - stop')
      setPlayer(update)
      setSync(false)
    } catch(error) {
      console.warn('sync - 💥')
      console.warn(error)
    }
  }, [messages, player, setPlayer, setSync])

  const gamePrompt = useCallback(async (userPrompt: string) => {
    if(promptType === 'hail') await hailPrompt(userPrompt)
    if(promptType === 'world') await worldPrompt(userPrompt)
    if(promptType === 'player') await playerPrompt(userPrompt)
    if(promptType === 'start') await startPrompt(userPrompt)
    if(promptType === 'action') {
      const result = await actionPrompt(userPrompt)
      if(result) setTimeout(() => doSync(result), 250)
    }
  }, [promptType, hailPrompt, worldPrompt, playerPrompt, startPrompt, actionPrompt, doSync])

  return <gmContext.Provider value={{ promptType, gamePrompt, sync }}>
		{children}
	</gmContext.Provider>
}
