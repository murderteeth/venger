import React, { useCallback, useState } from 'react'
import Embers from './Embers'
import { Button } from './controls'
import { useBusy } from './Busy'
import { useLocalStorage } from 'usehooks-ts'

interface MessageData {
  role: 'system' | 'user' | 'assistant',
  content: string
}

function Message({message}: {message: MessageData}) {
  return <div className={'p-4 border border-zinc-800 rounded-lg'}>
    {message.content}
  </div>
}

function Panel() {
  return <div className={'grow h-full backdrop-blur-sm bg-white/5 border border-zinc-900'}></div>
}

interface World {
  description: string,
  summary: string
}

export default function Ahoy() {
  const {setBusy} = useBusy()
  const [world, setWorld] = useLocalStorage<World|undefined>('world', undefined)
  const [messages, setMessages] = useLocalStorage<MessageData[]>('messages', [{
    role: 'assistant', content: 'Ahoy!'
  }])

  const onWorld = useCallback(() => {
    setBusy(true)
    const request = fetch('/api/world', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({userPrompt: ''})
    })
    request.then(response => {
      response.json().then(json => {
        setWorld(json)
        setMessages(current => {
          return [...current, {role: 'assistant', content: json.summary}]
        })
        setBusy(false)
      })
    })
  }, [setBusy, setMessages, setWorld])

  return <div className={`relative w-full h-full bg-black`}>
    <Embers className={'absolute z-1 inset-0'} />
    <div className={'absolute z-10 inset-0 flex items-center justify-center'}>
      <Panel />
      <div className={`w-2/5 h-full py-4 flex flex-col items-center justify-between gap-4`}>
        <div>
          <div className={'font-[LadyRadical] text-4xl'}>{'Dread Henge'}</div>
        </div>

        <div className={'w-full h-full grow px-6 flex flex-col gap-4 overflow-y-auto'}>
          <div className={'mt-auto'}></div>
          {messages.map((message, index) => <Message key={index} message={message} />)}
        </div>

        <Button onClick={onWorld}>
          {'Roll a new world'}
        </Button>
      </div>
      <Panel />
    </div>
  </div>
}
