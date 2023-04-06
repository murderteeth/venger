import React, { ReactNode, useCallback } from 'react'
import Embers from './Embers'
import { Button, Input } from './controls'
import { useBusy } from './Busy'
import { useLocalStorage } from 'usehooks-ts'
import { TbMenu } from 'react-icons/tb'
import { BsStars } from 'react-icons/bs'
import { World, fetchWorld } from '../api'

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
    backdrop-blur-sm bg-white/5
    border border-zinc-900
    ${className}`}>
    {children}
  </div>
}

export default function Ahoy() {
  const { setBusy } = useBusy()
  const [world, setWorld] = useLocalStorage<World|undefined>('world', undefined)
  const [messages, setMessages] = useLocalStorage<MessageData[]>('messages', defaultMessages)

  const onGo = useCallback(async () => {
    setBusy(true)
    if(!world) {
      const newWorld = await fetchWorld('')
      setWorld(newWorld)
      setMessages(current => {
        return [...current, {role: 'assistant', content: newWorld.summary}]
      })
    } else {

    }
    setBusy(false)
  }, [setBusy, setMessages, world, setWorld])

  const onReset = useCallback(() => {
    setMessages(defaultMessages)
    setWorld(undefined)
  }, [setMessages, setWorld])

  return <div className={`relative w-full h-full bg-black`}>
    <Embers disabled={true} className={'absolute z-1 inset-0'} />
    <div className={'absolute z-10 inset-0 flex items-center justify-center'}>
      <Panel className={'w-[30%] h-full p-8 flex flex-col items-start justify-start'}>
        <div>
          <Button onClick={onReset}>
            <TbMenu size={24}></TbMenu>
          </Button>
        </div>
      </Panel>

      <div className={`w-[40%] h-full py-4 flex flex-col items-center justify-between gap-4`}>
        <div className={'w-full h-full grow px-6 flex flex-col gap-4 overflow-y-auto'}>
          <div className={'mt-auto'}></div>
          {messages.map((message, index) => <Message key={index} message={message} />)}
        </div>

        <div className={'w-full px-6 py-4 flex items-center gap-4'}>
          <Input type={'text'} className={'grow'} />
          <Button onClick={onGo} className={'h-full'}>
            <BsStars size={24} />
          </Button>
        </div>
      </div>

      <Panel className={'w-[30%] h-full py-12 flex flex-col items-center justify-end'}>
        <div className={'font-[LadyRadical] text-6xl text-red-600'}>{'Henge'}</div>
      </Panel>
    </div>
  </div>
}
