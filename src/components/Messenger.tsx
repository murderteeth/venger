import React from 'react'
import AssistantMessage from './AssistantMessage'

export interface MessageGram {
  role: 'system' | 'user' | 'assistant',
  contentType?: 'text' | 'options',
  content: string | string[],
}

export default function Messenger({messages}: {messages: MessageGram[]}) {
  return <div className={'w-full h-full grow px-6 flex flex-col gap-4 overflow-y-auto'}>
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
          ? <div className={'w-[32px] h-[32px] flex items-center justify-center rounded-full border border-zinc-900'}>{'🔥'}</div>
          : <div className={'w-[32px]'}></div>
        return <div key={index} className={'flex flex-row-reverse items-end gap-4'}>
          {avatar}
          {message.content}
        </div>
      }
    })}
  </div>
}
