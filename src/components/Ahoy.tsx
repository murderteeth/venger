import React, { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import useKeypress from 'react-use-keypress'
import Embers from './Embers'
import { Button, Input } from './controls'
import { useBusy } from './Busy'
import { useLocalStorage } from 'usehooks-ts'
import { AiFillFire } from 'react-icons/ai'
import { Character, Turn, World, fetchAction, fetchCharacter, fetchStart, fetchSync, fetchWorld } from '../api'
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
  gamePrompt: (userPrompt: string) => Promise<void>,
  syncingPlayer: boolean
}
const	prompterContext = createContext({} as Prompter)
export const usePrompter = () => useContext(prompterContext)

export default function Ahoy() {
  const { busy, setBusy } = useBusy()
  const [world, setWorld] = useLocalStorage<World|undefined>('world', undefined)
  const [player, setPlayer] = useLocalStorage<Character|undefined>('player', undefined)
  const [syncingPlayer, setSyncingPlayer] = useState(false)
  const [turn, setTurn] = useLocalStorage<Turn|undefined>('turn', undefined)
  const {messages, setMessages, resetMessages} = useMessages()
  const promptInput = useRef<HTMLInputElement>(null)

  useEffect(() => promptInput.current?.focus(), [])

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
      role: 'assistant', content: `
      I'm Venger, your ai game master. 
      Let's create a world to play in, okie!?`
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
              'Half-Elf, Bard, High Charisma, High Performance',
              'Gnome, Wizard, High Intelligence',
              'Mancoon, Wizard, High Intelligence, Named Mittens'
            ]
          }
        ]
      })
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

  const syncPlayer = useCallback(async (lastMessage: string) => {
    setSyncingPlayer(true)
    console.log('syncPlayer - start')
    if(!player) return
    try {
      const update = await fetchSync(player, [...messages, {role: 'assistant', content: lastMessage}])
      console.log('syncPlayer - stop')
      setPlayer(update)
      setSyncingPlayer(false)
    } catch {
      console.warn('player sync go boom =(')
    }
  }, [messages, player, setPlayer, setSyncingPlayer])

  const actionPrompt = usePromptCallback(async (userPrompt: string) => {
    if(!(world && player && turn)) return
    const buffer = [...messages.filter(m => m.contentType !== 'error')]
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
      setTimeout(() => syncPlayer(result.description), 250)
    } catch {
      setMessages(current => {
        return [...current.slice(0, -1), {role: 'assistant', contentType: 'error'}]
      })
    }
  }, [world, player, turn, setTurn, messages, setMessages, syncPlayer])

  const gamePrompt = useCallback(async (userPrompt: string) => {
    if(promptType === 'world') await worldPrompt(userPrompt)
    if(promptType === 'player') await playerPrompt(userPrompt)
    if(promptType === 'start') await startPrompt(userPrompt)
    if(promptType === 'action') await actionPrompt(userPrompt)
  }, [promptType, worldPrompt, playerPrompt, startPrompt, actionPrompt])

  const onPrompt = useCallback(async () => {
    if(!promptInput.current) return
    let userPrompt = promptInput.current?.value

    if(!userPrompt) {
      const lastMessage = messages[messages.length - 1]
      if(lastMessage.contentType === 'options') {
        userPrompt = (lastMessage.content as string[])[0]
      } else {
        userPrompt = '..'
      }
    }

    setMessages(current => {
      return [...current, 
        {role: 'user', content: userPrompt}
      ]
    })
    await gamePrompt(userPrompt)
    promptInput.current.value = ''
  }, [promptInput, messages, setMessages, gamePrompt])

  const onReset = useCallback(() => {
    resetMessages()
    setWorld(undefined)
    setPlayer(undefined)
    setTurn(undefined)
  }, [resetMessages, setWorld, setPlayer, setTurn])

  useKeypress(['/'], () => focusPrompter())
  useKeypress(['Enter'], () => onPrompt())

  return <prompterContext.Provider value={{gamePrompt, syncingPlayer}}>
    <div className={`relative w-full h-full bg-black font-mono`}>
      <Embers disabled={false} className={'absolute z-1 inset-0'} />
      <div className={'absolute z-10 inset-0 flex items-center justify-center'}>
        <Panel className={'hidden sm:block w-[30%] h-full p-8 flex flex-col items-start justify-start gap-12'}>
          {player && <Player player={player} />}
        </Panel>

        <div className={`relative w-full sm:w-[40%] h-full sm:pb-4 flex flex-col items-center justify-between gap-4`}>
          <div className={'sm:hidden fixed top-2 right-2'}>
            <Button onClick={onReset} disabled={busy}>{'RESET'}</Button>
          </div>
          <Messenger />
          <div className={'relative w-full px-2 sm:px-6 py-4'}>
            <div className={'w-full flex items-center gap-2 sm:gap-4'}>
              <Input 
                _ref={promptInput} 
                type={'text'} 
                disabled={busy} 
                maxLength={280} 
                className={'grow w-64 h-12 pl-24'} />
              <Button onClick={onPrompt} disabled={busy} className={'h-12'}>
                <AiFillFire size={20} />
              </Button>
              <div className={`absolute z-1 left-4 sm:left-8 w-22 px-2 py-1 text-sm 
                ${busy ? 'text-zinc-900 bg-zinc-950' : 'text-red-800 bg-zinc-900'}`}>
                {`/${promptType}:`}
              </div>
            </div>
          </div>
        </div>

        <Panel className={'hidden w-[30%] h-full py-0 sm:flex flex-col items-center justify-between'}>
          <div className={'pt-12 text-xl'}>
            <Button onClick={onReset} disabled={busy}>{'RESET'}</Button>
          </div>
          <div className={'relative w-3/4 h-96 flex flex-col items-center'}>
            <div className={'absolute z-10 bottom-0 bg-black/20 backdrop-blur-lg'}>
              <div className={'z-50 font-[LadyRadical] text-6xl text-red-600'}>{'Venger'}</div>
              <div className={'z-10'}>{'rpg-bot 0.1 / gpt-3.5-turbo'}</div>
            </div>
            <img src={'/images/venger.png'} alt={'venger'} className={'absolute z-1 bottom-0'} />
          </div>
        </Panel>
      </div>
    </div>
  </prompterContext.Provider>
}
