import React, { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import useKeypress from 'react-use-keypress'
import Embers from './Embers'
import { Button, Input } from './controls'
import { useBusy } from './Busy'
import { useLocalStorage } from 'usehooks-ts'
import { IoMdFlame } from 'react-icons/io'
import { Character, Turn, World, fetchAction, fetchCharacter, fetchStart, fetchWorld } from '../api'
import Player from './Player'
import Messenger from './Messenger'
import { useMessages } from '../hooks/useMessages'

function Panel({className, children}: {className?: string, children?: ReactNode}) {
  return <div className={`
    bg-white/5
    border border-zinc-900
    ${className}`}>
    {children}
  </div>
}

interface Prompter {
  actionPrompt: (userPrompt: string) => Promise<void>
}
const	prompterContext = createContext({} as Prompter)
export const usePrompter = () => useContext(prompterContext)

export default function Ahoy() {
  const { busy, setBusy } = useBusy()
  const [world, setWorld] = useLocalStorage<World|undefined>('world', undefined)
  const [player, setPlayer] = useLocalStorage<Character|undefined>('player', undefined)
  const [turn, setTurn] = useLocalStorage<Turn|undefined>('turn', undefined)
  const {messages, setMessages, resetMessages} = useMessages()
  const promptInput = useRef<HTMLInputElement>(null)

  const promptType = useMemo(() => {
    if(!world) return 'world'
    if(!player) return 'player'
    if (!turn) return 'start'
    return 'action'
  }, [world, player, turn])

  const focusPrompter = useCallback(() => {
    setTimeout(() => promptInput.current?.focus(), 0)
  }, [promptInput])

  useEffect(() => {
    if(messages.length > 0) return
    setMessages([{
      role: 'assistant', content: 'Hail!'
    }, {
      role: 'assistant', content: `I'm Venger, your game master. Let's create a world to play in, okie!?`
    }])
  }, [messages, setMessages])

  const usePromptCallback = (prompt: (userPrompt: string) => Promise<void>, deps: any[]) => 
    useCallback(async (userPrompt: string) => {
    setBusy(true)
    await prompt(userPrompt)
    setBusy(false)
    focusPrompter()
  }, [prompt, ...deps])

  const worldPrompt = usePromptCallback(async (userPrompt: string) => {
    setMessages(current => {
      return [...current, {role: 'assistant', contentType: 'busy'}]
    })

    try {
      const result = await fetchWorld(userPrompt)
      setMessages(current => {
        return [...current.slice(0, -1), {role: 'assistant', content: result.summary}]
      })
      setWorld(result)
    } catch {
      setMessages(current => {
        return [...current.slice(0, -1), {role: 'assistant', contentType: 'error'}]
      })
    }
  }, [setWorld, setMessages])

  const playerPrompt = usePromptCallback(async (userPrompt: string) => {
    if(!world) return
    setMessages(current => [...current, {role: 'assistant', contentType: 'busy'}])

    try {
      const result = await fetchCharacter(userPrompt, world)
      setMessages(current => {
        return [...current.slice(0, -1), {role: 'assistant', content: result.summary}]
      })
      setPlayer(result)
    } catch {
      setMessages(current => {
        return [...current.slice(0, -1), {role: 'assistant', contentType: 'error'}]
      })
    }
  }, [world, setPlayer, setMessages])

  const startPrompt = usePromptCallback(async (userPrompt: string) => {
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

  const actionPrompt = usePromptCallback(async (userPrompt: string) => {
    if(!(world && player && turn)) return
    const buffer = [...messages]
    setMessages(current => [...current, {role: 'assistant', contentType: 'busy'}])

    try {
      const result = await fetchAction(userPrompt, world, player, buffer)
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
    } catch {
      setMessages(current => {
        return [...current.slice(0, -1), {role: 'assistant', contentType: 'error'}]
      })
    }
  }, [world, player, turn, setTurn, messages, setMessages])

  const onPrompt = useCallback(async () => {
    if(!promptInput.current) return
    const userPrompt = promptInput.current?.value || '...'
    setMessages(current => {
      return [...current, 
        {role: 'user', content: userPrompt}
      ]
    })
    if(promptType === 'world') worldPrompt(userPrompt)
    if(promptType === 'player') playerPrompt(userPrompt)
    if(promptType === 'start') startPrompt(userPrompt)
    if(promptType === 'action') actionPrompt(userPrompt)
    promptInput.current.value = ''
  }, [promptInput, setMessages, promptType, worldPrompt, playerPrompt, startPrompt, actionPrompt])

  const onReset = useCallback(() => {
    resetMessages()
    setWorld(undefined)
    setPlayer(undefined)
    setTurn(undefined)
  }, [resetMessages, setWorld, setPlayer, setTurn])

  useKeypress(['/'], () => focusPrompter())
  useKeypress(['Enter'], () => onPrompt())

  return <prompterContext.Provider value={{actionPrompt}}>
    <div className={`relative w-full h-full bg-black font-mono`}>
      <Embers disabled={false} className={'absolute z-1 inset-0'} />
      <div className={'absolute z-10 inset-0 flex items-center justify-center'}>
        <Panel className={'w-[30%] h-full p-8 flex flex-col items-start justify-start gap-12'}>
          <div>
            <Button onClick={onReset} disabled={busy}>{'RESET'}</Button>
          </div>
          {player && <Player player={player} />}
        </Panel>

        <div className={`w-[40%] h-full pb-4 flex flex-col items-center justify-between gap-4`}>
          <Messenger />
          <div className={'relative w-full px-6 py-4 flex items-center gap-4'}>
            <div className={`absolute left-8 w-22 px-2 py-1 text-sm 
              ${busy ? 'text-zinc-900 bg-zinc-950' : 'text-red-800 bg-zinc-900'}`}>
              {`/${promptType}:`}
            </div>
            <Input _ref={promptInput} type={'text'} disabled={busy} className={'grow pl-24'} maxLength={280} />
            <Button onClick={onPrompt} disabled={busy} className={'h-full'}>
              <IoMdFlame size={20} />
            </Button>
          </div>
        </div>

        <Panel className={'relative w-[30%] h-full py-0 flex flex-col items-center justify-end'}>
          <img src={'/images/venger.png'} alt={'venger'} className={'absolute z-1 bottom-0 scale-75 translate-y-[12%]'} />
          <div className={'z-50 font-[LadyRadical] text-6xl text-red-600'}>{'Venger'}</div>
          <div className={'z-10'}>{'rpg-bot 0.1 / gpt-3.5-turbo'}</div>
        </Panel>
      </div>
    </div>
  </prompterContext.Provider>
}
