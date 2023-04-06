import React, { useCallback, useMemo } from 'react'
import { MessageGram } from '../Messenger'
import { Button } from '../controls'

export default function AssistantMessage({message}: {message: MessageGram}) {
  const contentType = useMemo(() => {
    return message.contentType || 'text'
  }, [message])

  const onOption = useCallback(async (option: string) => {

  }, [])

  return <div className={'w-96 flex flex-col gap-4'}>
    {contentType === 'text' && message.content}
    {contentType === 'options' && (message.content as string[]).map((option, index) => {
      return <Button key={index} onClick={() => onOption(option)}>{option}</Button>
    })}
  </div>
}
