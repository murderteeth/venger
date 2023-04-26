import React, { useCallback, useEffect, useRef, useState } from 'react'
import useKeypress from 'react-use-keypress'
import { Button, Input } from '../controls'
import { useGameData } from '../../hooks/useGameData'
import { useWorldPromptIntroduction } from '../../hooks/useGameMaster/useWorldPrompt'

export default function OpenAiApiKey({disabled}: {disabled?: boolean}) {
  const {setOpenAiApiKey} = useGameData()
  const introduceWorldPrompt = useWorldPromptIntroduction()
  const input = useRef<HTMLInputElement>(null)
  const [focus, setFocus] = useState(false)
  useEffect(() => input.current?.focus(), [])

  const onClick = useCallback(() => {
    if(!(input.current && input.current.value) || disabled) return
    setOpenAiApiKey(input.current.value)
    introduceWorldPrompt()
  }, [input, disabled, setOpenAiApiKey, introduceWorldPrompt])

  const onEnter = useCallback(() => {
    if(!focus) return
    onClick()
  }, [focus, onClick])

  useKeypress(['Enter'], () => onEnter())

  return <div className={'flex items-center gap-4'}>
    <Input 
      ref={input} 
      disabled={disabled}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      type={'password'}
      name={'open-ai-api-key'}
      autoComplete="off"
      maxLength={80}
      placeholder={'Your Open AI API Key'} />
    <Button disabled={disabled} onClick={onClick}>{'Set'}</Button>
  </div>
}
