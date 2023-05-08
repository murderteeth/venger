import React, { useEffect, useRef } from 'react'
import AssistantMessage from './AssistantMessage'
import { useMessages } from '../hooks/useMessages'
import Image from 'next/image'

type RoleContentTypeMapping = {
  user: 'text',
  assistant: 'text' | 'options' | 'component' | 'busy' | 'error',
}

type ContentMapping = {
  text: string,
  options: string[],
  component: string,
  busy: undefined,
  error: undefined
}

export type MessageGram = {
  role: keyof RoleContentTypeMapping,
} & {
  [R in keyof RoleContentTypeMapping]: {
    [K in RoleContentTypeMapping[R]]: K extends keyof ContentMapping
      ? { contentType?: K; content?: ContentMapping[K] }
      : never
  }[RoleContentTypeMapping[R]]
}[keyof RoleContentTypeMapping]

export default function Messenger() {
  const {messages} = useMessages()
  const eom = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTimeout(() => {
      eom.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }, [messages])

  return <div className={`
    w-full h-full grow px-6 flex flex-col gap-4
    overflow-y-auto sm:scrollbar-thin sm:scrollbar-thumb-red-950 sm:hover:scrollbar-thumb-red-700 sm:scrollbar-track-zinc-950`}>
    <div className={'mt-auto'}></div>
    {messages.map((message, index) => {
      if(message.role === 'assistant') {
        const showAvatar = index === messages.length - 1 || messages[index + 1].role !== 'assistant'
        const avatar = showAvatar 
          ? <Image src={'/avatar.png'} width={32} height={32} alt={'Venger'} />
          : <div className={'w-[32px]'}></div>
        return <div key={index} className={`flex items-end gap-4 ${showAvatar ? 'mb-8' : ''}`}>
          {avatar}
          <AssistantMessage message={message} latestMessage={index === messages.length - 1} />
        </div>
      } else {
        const showAvatar = index === messages.length - 1 || messages[index + 1].role !== 'user'
        const avatar = showAvatar 
          ? <div className={'w-[32px] h-[32px] flex items-center justify-center rounded-full bg-zinc-900'}>{'🔥'}</div>
          : <div className={'w-[32px]'}></div>
        return <div key={index} className={`self-end flex flex-row-reverse items-end gap-4 ${showAvatar ? 'mb-8' : ''}`}>
          {avatar}
          <div className={'w-64 sm:w-96 p-3 bg-zinc-900'}>{message.content}</div>
        </div>
      }
    })}
    <div ref={eom} className={'mb-12'}></div>
  </div>
}
