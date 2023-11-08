'use client'

import React, { ReactNode, createContext, useCallback, useContext, useMemo } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { Character, Turn, World } from './useApi'

export interface GameData {
  openAiApiKey: string | undefined,
  setOpenAiApiKey: (key: string) => void,
  model: string | undefined,
  setModel: (model: string) => void,
  ready: boolean,
	world: World | undefined,
  setWorld: (world: World) => void,
	player: Character | undefined,
  setPlayer: (character: Character) => void,
	turn: Turn | undefined,
  setTurn: (turn: Turn) => void,
  reset: () => void,
  resetAll: () => void,
}

export const gameDataContext = createContext<GameData>({} as GameData)

export const useGameData = () => useContext(gameDataContext)

export default function GameDataProvider({children}: {children: ReactNode}) {
  const [openAiApiKey, setOpenAiApiKey] = useLocalStorage<string|undefined>('openAiApiKey', undefined)
  const [model, setModel] = useLocalStorage<string|undefined>('model', 'gpt-4-1106-preview')
  const [world, setWorld] = useLocalStorage<World|undefined>('world', undefined)
  const [player, setPlayer] = useLocalStorage<Character|undefined>('player', undefined)
  const [turn, setTurn] = useLocalStorage<Turn|undefined>('turn', undefined)

  const ready = useMemo(() => {
    return Boolean(openAiApiKey && model)
  }, [openAiApiKey, model])

	const reset = useCallback(() => {
		setWorld(undefined)
		setPlayer(undefined)
    setTurn(undefined)
	}, [setWorld, setPlayer, setTurn])

  const resetAll = useCallback(() => {
    reset()
    setOpenAiApiKey(undefined)
    setModel('gpt-4-1106-preview')
  }, [reset, setOpenAiApiKey])

	return <gameDataContext.Provider value={{
    openAiApiKey, setOpenAiApiKey,
    model, setModel,
    ready,
    world, setWorld, 
    player, setPlayer,
    turn, setTurn,
    reset, resetAll
    }}>
		{children}
	</gameDataContext.Provider>
}
