import React, { ReactNode, useCallback, useRef } from 'react'
import useKeypress from 'react-use-keypress'
import Embers from './Embers'
import { Button, Input } from './controls'
import { useBusy } from './Busy'
import { useLocalStorage } from 'usehooks-ts'
import { TbMenu, TbFlame } from 'react-icons/tb'
import { Character, Turn, World, fetchCharacter, fetchEncounterStart, fetchWorld } from '../api'
import Player from './Player'
import Messenger, { MessageGram } from './Messenger'

const defaultMessages = [{
  role: 'assistant', content: 'Hail!'
}, {
  role: 'assistant', content: `I'm Venger, your game master. Let's create a world to play in, okie!?`
}
] as MessageGram[]

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
  const [messages, setMessages] = useLocalStorage<MessageGram[]>('messages', defaultMessages)
  const prompter = useRef<HTMLInputElement>(null)

  const onGo = useCallback(async () => {
    setBusy(true)
    if(!world) {
      const newWorld = await fetchWorld('')
      setWorld(newWorld)
      setMessages(current => {
        return [...current, {role: 'assistant', content: newWorld.summary}]
      })
    } else if(!player) {
      const newCharacter = await fetchCharacter('', world)
      setPlayer(newCharacter)
      setMessages(current => {
        return [...current, {role: 'assistant', content: newCharacter.summary}]
      })
    } else {
      const nextTurn = await fetchEncounterStart(world, player)
      setTurn(nextTurn)
      setMessages(current => {
        return [
          ...current, 
          {role: 'assistant', content: nextTurn.description},
          {role: 'assistant', contentType: 'options', content: nextTurn.options}
        ]
      })
    }
    setBusy(false)
  }, [setBusy, setMessages, world, setWorld, player, setPlayer, setTurn])

  const onReset = useCallback(() => {
    setMessages(defaultMessages)
    setWorld(undefined)
    setPlayer(undefined)
    setTurn(undefined)
  }, [setMessages, setWorld, setPlayer, setTurn])

  useKeypress(['/'], () => {
    setTimeout(() => { prompter.current?.focus() }, 0)
  })

  useKeypress(['Enter'], () => onPrompt())

  const onPrompt = useCallback(async () => {
    if(!prompter.current?.value) return
    setMessages(current => {
      return [
        ...current, 
        {role: 'user', content: prompter.current?.value as string}
      ]
    })
    prompter.current.value = ''
  }, [prompter, setMessages])

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

      <div className={`w-[40%] h-full py-4 flex flex-col items-center justify-between gap-4`}>
        <Messenger messages={messages} />

        <div className={'relative w-full px-6 py-4 flex items-center gap-4'}>
          <Input _ref={prompter} type={'text'} disabled={busy} className={'grow'} />
          <Button onClick={onGo} disabled={busy} className={'h-full'}>
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
