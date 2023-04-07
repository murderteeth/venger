import React, { useCallback, useMemo } from 'react'
import { MessageGram } from '../Messenger'
import { Button } from '../controls'
import { useMessages } from '../../hooks/useMessages'

export default function AssistantMessage({message}: {message: MessageGram}) {
  const {setMessages} = useMessages()

  const contentType = useMemo(() => {
    return message.contentType || 'text'
  }, [message])

  const onOption = useCallback((option: string) => {
    setMessages(current => [...current, {role: 'user', content: option}])
  }, [setMessages])

  return <div className={'w-96 flex flex-col gap-4'}>
    {contentType === 'text' && message.content}
    {contentType === 'options' && (message.content as string[]).map((option, index) => {
      return <Button key={index} onClick={() => onOption(option)}>{option}</Button>
    })}
  </div>
}
