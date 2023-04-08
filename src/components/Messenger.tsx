import React, { useEffect, useRef } from 'react'
import AssistantMessage from './AssistantMessage'
import { useMessages } from '../hooks/useMessages'

type RoleContentTypeMapping = {
  user: 'text',
  assistant: 'text' | 'options' | 'busy',
}

type ContentMapping = {
  text: string,
  options: string[],
  busy: undefined,
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
    w-full h-full grow px-6 flex flex-col gap-4 overflow-y-auto
    scrollbar-thin scrollbar-thumb-red-950 scrollbar-track-zinc-950`}>
    <div className={'mt-auto'}></div>
    {messages.map((message, index) => {
      if(message.role === 'assistant') {
        const showAvatar = index === messages.length - 1 || messages[index + 1].role !== 'assistant'
        const avatar = showAvatar 
          ? <img src={'/images/avatar.png'} width={32} height={32} alt={'Venger'} />
          : <div className={'w-[32px]'}></div>
        return <div key={index} className={'flex items-end gap-4'}>
          {avatar}
          <AssistantMessage message={message} />
        </div>
      } else {
        const showAvatar = index === messages.length - 1 || messages[index + 1].role !== 'user'
        const avatar = showAvatar 
          ? <div className={'w-[32px] h-[32px] flex items-center justify-center rounded-full bg-zinc-900'}>{'🔥'}</div>
          : <div className={'w-[32px]'}></div>
        return <div key={index} className={'self-end flex flex-row-reverse items-end gap-4'}>
          {avatar}
          <div className={'w-96 p-3 bg-zinc-900'}>{message.content}</div>
        </div>
      }
    })}
    <div ref={eom} className={'mb-12'}></div>
  </div>
}
