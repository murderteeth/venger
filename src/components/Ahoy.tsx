import React, { ReactNode, useCallback, useEffect, useMemo, useRef } from 'react'
import useKeypress from 'react-use-keypress'
import Embers from './Embers'
import { Button, Input } from './controls'
import { useBusy } from './Busy'
import { useLocalStorage } from 'usehooks-ts'
import { TbMenu, TbFlame } from 'react-icons/tb'
import { Character, Turn, World, fetchCharacter, fetchEncounterStart, fetchWorld } from '../api'
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

export default function Ahoy() {
  const { busy, setBusy } = useBusy()
  const [world, setWorld] = useLocalStorage<World|undefined>('world', undefined)
  const [player, setPlayer] = useLocalStorage<Character|undefined>('player', undefined)
  const [turn, setTurn] = useLocalStorage<Turn|undefined>('turn', undefined)
  const {messages, setMessages, resetMessages} = useMessages()
  const prompter = useRef<HTMLInputElement>(null)

  const promptType = useMemo(() => {
    if(!world) return 'world'
    if(!player) return 'player'
    return 'encounter'
  }, [world, player])

  const focusPrompter = useCallback(() => {
    setTimeout(() => prompter.current?.focus(), 0)
  }, [prompter])

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
    const result = await fetchWorld(userPrompt)
    setMessages(current => {
      return [...current.slice(0, -1), {role: 'assistant', content: result.summary}]
    })
    setWorld(result)
  }, [setWorld, setMessages])

  const playerPrompt = usePromptCallback(async (userPrompt: string) => {
    if(!world) return
    setMessages(current => {
      return [...current, {role: 'assistant', contentType: 'busy'}]
    })
    const result = await fetchCharacter(userPrompt, world)
    setMessages(current => {
      return [...current.slice(0, -1), {role: 'assistant', content: result.summary}]
    })
    setPlayer(result)
  }, [world, setPlayer, setMessages])

  const encounterPrompt = usePromptCallback(async (userPrompt: string) => {
    if(!(world && player)) return
    setMessages(current => {
      return [...current, {role: 'assistant', contentType: 'busy'}]
    })
    const result = await fetchEncounterStart(world, player)
    setMessages(current => {
      return [
        ...current.slice(0, -1), 
        {role: 'assistant', content: result.description},
        {role: 'assistant', contentType: 'options', content: result.options}
      ]
    })
    setTurn(result)
  }, [world, player, setTurn, setMessages])

  const onPrompt = useCallback(async () => {
    if(!prompter.current) return
    const userPrompt = prompter.current?.value || '...'
    setMessages(current => {
      return [...current, 
        {role: 'user', content: userPrompt}
      ]
    })
    if(promptType === 'world') worldPrompt(userPrompt)
    if(promptType === 'player') playerPrompt(userPrompt)
    if(promptType === 'encounter') encounterPrompt(userPrompt)
    prompter.current.value = ''
  }, [prompter, setMessages, promptType, worldPrompt, playerPrompt, encounterPrompt])

  const onReset = useCallback(() => {
    resetMessages()
    setWorld(undefined)
    setPlayer(undefined)
    setTurn(undefined)
  }, [resetMessages, setWorld, setPlayer, setTurn])

  useKeypress(['/'], () => focusPrompter())
  useKeypress(['Enter'], () => onPrompt())

  return <div className={`relative w-full h-full bg-black font-mono`}>
    <Embers disabled={false} className={'absolute z-1 inset-0'} />
    <div className={'absolute z-10 inset-0 flex items-center justify-center'}>
      <Panel className={'w-[30%] h-full p-8 flex flex-col items-start justify-start gap-12'}>
        <div>
          <Button onClick={onReset} disabled={busy}>
            <TbMenu size={24}></TbMenu>
          </Button>
        </div>
        {player && <Player player={player} />}
      </Panel>

      <div className={`w-[40%] h-full pb-4 flex flex-col items-center justify-between gap-4`}>
        <Messenger />
        <div className={'relative w-full px-6 py-4 flex items-center gap-4'}>
          <div className={`absolute left-8 w-24 px-2 py-1 text-sm 
            ${busy ? 'text-zinc-900 bg-zinc-950' : 'text-red-800 bg-zinc-900'}`}>
            {`/${promptType}:`}
          </div>
          <Input _ref={prompter} type={'text'} disabled={busy} className={'grow pl-28'} />
          <Button onClick={onPrompt} disabled={busy} className={'h-full'}>
            <TbFlame size={24} />
          </Button>
        </div>
      </div>

      <Panel className={'relative w-[30%] h-full py-0 flex flex-col items-center justify-end'}>
        <img src={'/images/venger.png'} alt={'venger'} className={'absolute z-1 bottom-0 scale-75 translate-y-[12%]'} />
        <div className={'z-10 font-[LadyRadical] text-6xl text-red-600'}>{'Venger'}</div>
        <div className={'z-10 text-red-700'}>{'rpg ai 0.1'}</div>
      </Panel>
    </div>
  </div>
}
