import React, { ReactNode, useCallback } from 'react'
import Embers from './Embers'
import { Button, Input } from './controls'
import { useBusy } from './Busy'
import { useLocalStorage } from 'usehooks-ts'
import { TbMenu } from 'react-icons/tb'
import { BsStars } from 'react-icons/bs'
import { Character, Turn, World, fetchCharacter, fetchEncounterStart, fetchWorld } from '../api'
import Row from './Row'

interface MessageData {
  role: 'system' | 'user' | 'assistant',
  content: string
}

const defaultMessages = [{
  role: 'assistant', content: 'Ahoy!'
}] as MessageData[]

function Message({message}: {message: MessageData}) {
  return <div className={'p-4 border border-zinc-800 rounded-lg'}>
    {message.content}
  </div>
}

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
  const [messages, setMessages] = useLocalStorage<MessageData[]>('messages', defaultMessages)

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
          {role: 'assistant', content: nextTurn.options.join(', ')}
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

  return <div className={`relative w-full h-full bg-black font-mono`}>
    <Embers disabled={false} className={'absolute z-1 inset-0'} />
    <div className={'absolute z-10 inset-0 flex items-center justify-center'}>
      <Panel className={'w-[30%] h-full p-8 flex flex-col items-start justify-start gap-12'}>
        <div>
          <Button onClick={onReset} disabled={busy}>
            <TbMenu size={24}></TbMenu>
          </Button>
        </div>
        {player && <div className={'w-full p-2 rounded-lg'}>
          <Row label={player.name}>{}</Row>
          <Row label={'Level'} alt={true} heading={true}>{1}</Row>
          <Row label={'XP'}>{player.experience_points}</Row>
          <Row label={'Age'} alt={true}>{player.age}</Row>
          <Row label={'Gender'}>{player.gender}</Row>
          <Row label={'Alignment'} alt={true}>{player.alignment}</Row>
          <Row label={'Race'}>{player.race}</Row>
          <Row label={'Class'} alt={true}>{player.character_class}</Row>

          <Row label={''}>{''}</Row>
          <Row label={'Strength'} alt={true} heading={true}>{player.attributes.Strength}</Row>
          <Row label={'Dexterity'}>{player.attributes.Dexterity}</Row>
          <Row label={'Constitution'} alt={true}>{player.attributes.Constitution}</Row>
          <Row label={'Inteligence'}>{player.attributes.Intelligence}</Row>
          <Row label={'Wisdom'} alt={true}>{player.attributes.Wisdom}</Row>
          <Row label={'Charisma'}>{player.attributes.Charisma}</Row>

          <Row label={''}>{''}</Row>
          <Row label={'skills'} alt={true} heading={true}>{}</Row>
          {Object.keys(player.skill_modifiers).map(skill => 
            <Row key={skill} label={skill}>{player.skill_modifiers[skill]}</Row>
          )}

        </div>}
      </Panel>

      <div className={`w-[40%] h-full py-4 flex flex-col items-center justify-between gap-4`}>
        <div className={'w-full h-full grow px-6 flex flex-col gap-4 overflow-y-auto'}>
          <div className={'mt-auto'}></div>
          {messages.map((message, index) => <Message key={index} message={message} />)}
        </div>

        <div className={'w-full px-6 py-4 flex items-center gap-4'}>
          <Input type={'text'} disabled={busy} className={'grow'} />
          <Button onClick={onGo} disabled={busy} className={'h-full'}>
            <BsStars size={24} />
          </Button>
        </div>
      </div>

      <Panel className={'w-[30%] h-full py-12 flex flex-col items-center justify-end'}>
        <div className={'font-[LadyRadical] text-6xl text-red-600'}>{'Venger'}</div>
        <div className={'text-red-700'}>{'rpg ai 0.1'}</div>
      </Panel>
    </div>
  </div>
}
