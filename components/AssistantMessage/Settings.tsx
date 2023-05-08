import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useKeypress from 'react-use-keypress'
import { Button, Input } from '../controls'
import { useGameData } from '../../hooks/useGameData'
import { useWorldPromptIntroduction } from '../../hooks/useGameMaster/useWorldPrompt'
import Switch from '../controls/Switch'

export default function Settings({disabled}: {disabled?: boolean}) {
  const {setOpenAiApiKey, setModel} = useGameData()
  const introduceWorldPrompt = useWorldPromptIntroduction()
  const input = useRef<HTMLInputElement>(null)
  const [focus, setFocus] = useState(false)
  const [gpt4, setGpt4] = useState(false)
  const [disableOk, setDisableOk] = useState(!input.current?.value)
  useEffect(() => input.current?.focus(), [])

  const onChangeApiKey = useCallback(() => {
    setDisableOk(!input.current?.value)
  },[setDisableOk, input])

  const onToggleGpt4 = useCallback(() => {
    setGpt4(current => !current)
  }, [setGpt4])

  const onOk = useCallback(() => {
    if(!(input.current && input.current.value) || disabled) return
    setOpenAiApiKey(input.current.value)
    setModel(gpt4 ? 'gpt-4' : 'gpt-3.5-turbo')
    introduceWorldPrompt()
  }, [input, disabled, setOpenAiApiKey, gpt4, setModel, introduceWorldPrompt])

  const onEnter = useCallback(() => {
    if(!focus) return
    onOk()
  }, [focus, onOk])

  useKeypress(['Enter'], () => onEnter())

  return <div className={'my-6 flex flex-col items-end gap-6'}>
    <Input 
      ref={input} 
      disabled={disabled}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      onChange={onChangeApiKey}
      type={'password'}
      name={'open-ai-api-key'}
      autoComplete="off"
      maxLength={80}
      placeholder={'Your OpenAI API Key'} />
    <div className={'flex items-center gap-4'}>
      <div onClick={onToggleGpt4} className={`
        cursor-pointer
        ${gpt4 ? 'text-red-600' : ''}`}>
        {'Enable GPT4'}
      </div>
      <Switch disabled={disabled} checked={gpt4} onChange={onToggleGpt4} />
    </div>
    <Button disabled={disabled || disableOk} onClick={onOk}>{'Ok'}</Button>
  </div>
}
