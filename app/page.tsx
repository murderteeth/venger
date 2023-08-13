'use client'

import Image from 'next/image'
import useKeypress from 'react-use-keypress'
import { useBusy } from '@/hooks/useBusy'
import { useGameData } from '@/hooks/useGameData'
import { useGm } from '@/hooks/useGameMaster'
import { useMessages } from '@/hooks/useMessages'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import { A, Button, Input } from '@/components/controls'
import Player from '@/components/Player'
import Messenger from '@/components/Messenger'
import { AiFillFire } from 'react-icons/ai'

function Panel({className, children}: {className?: string, children?: ReactNode}) {
  return <div className={`
    bg-white/5
    border border-zinc-900
    ${className}`}>
    {children}
  </div>
}

function ResetButton() {
  const { busy } = useBusy()
  const { resetMessages } = useMessages()
  const { reset: resetGame, resetAll: reseGameAndSettings } = useGameData()
  const [hover, setHover] = useState(false)

  const onReset = useCallback(() => {
    resetMessages()
    resetGame()
  }, [resetMessages, resetGame])

  const onResetAll = useCallback(() => {
    resetMessages()
    reseGameAndSettings()
  }, [resetMessages, reseGameAndSettings])

  return <div className={'relative'}>
    <Button 
      onClick={onReset} 
      onLongClick={onResetAll}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
      disabled={busy}>
      {'RESET'}
    </Button>
    {hover && <div className={'absolute -bottom-10 text-center text-xs text-zinc-400'}>
      {'longpress to reset all'}
    </div>}
  </div>
}

export default function Hail() {
  const { busy } = useBusy()
  const { messages, setMessages } = useMessages()
  const { model, ready, player } = useGameData()
  const mediumBreakpoint = useMediaQuery({minWidth: 768});
  const promptInput = useRef<HTMLInputElement>(null)
  const { promptType, gamePrompt } = useGm()
  const [prompterFocus, setPrompterFocus] = useState(false)

  useEffect(() => promptInput.current?.focus(), [])

  const focusPrompter = useCallback(() => {
    if(!mediumBreakpoint) return
    setTimeout(() => promptInput.current?.focus(), 0)
  }, [mediumBreakpoint, promptInput])

  const onPrompt = useCallback(async () => {
    if(!promptInput.current) return
    let userPrompt = promptInput.current?.value

    if(!userPrompt) {
      const lastMessage = messages[messages.length - 1]
      if(lastMessage.contentType === 'options') {
        userPrompt = (lastMessage.content as string[])[0]
      } else {
        userPrompt = '..'
      }
    }

    setMessages(current => {
      return [...current, 
        {role: 'user', content: userPrompt}
      ]
    })

    await gamePrompt(userPrompt)

    promptInput.current.value = ''
    focusPrompter()
  }, [promptInput, messages, setMessages, gamePrompt, focusPrompter])

  useKeypress(['/'], () => focusPrompter())
  useKeypress(['Enter'], useCallback(() => {
    if(!prompterFocus) return
    onPrompt()
  }, [prompterFocus, onPrompt]))

  return <main className={`w-full h-full flex items-center justify-center`}>
    <Panel className={'hidden sm:block w-[30%] h-full p-8 flex flex-col items-start justify-start gap-12'}>
      {player && <Player player={player} />}
    </Panel>

    <div className={`relative w-full sm:w-[40%] h-full sm:pb-4 flex flex-col items-center justify-between gap-4`}>
      <div className={'sm:hidden fixed top-2 right-2'}>
        <ResetButton />
      </div>
      <Messenger />
      <div className={'relative w-full px-2 sm:px-6 py-4'}>
        <div className={'w-full flex items-center gap-2 sm:gap-4'}>
          <Input 
            ref={promptInput} 
            type={'text'} 
            disabled={!ready || busy}
            onFocus={() => setPrompterFocus(true)}
            onBlur={() => setPrompterFocus(false)}
            maxLength={280} 
            className={'grow w-64 h-12 pl-24'} />
          <Button onClick={onPrompt} disabled={!ready || busy} className={'h-12'}>
            <AiFillFire size={20} />
          </Button>
          <div className={`absolute z-1 left-4 sm:left-8 w-22 px-2 py-1 text-sm 
            ${(!ready || busy) ? 'text-zinc-900 bg-zinc-950' : 'text-red-800 bg-zinc-900'}`}>
            {`/${promptType}:`}
          </div>
        </div>
      </div>
    </div>

    <Panel className={'hidden w-[30%] h-full py-0 sm:flex flex-col items-center justify-between'}>
      <div className={'pt-12 text-xl'}>
        <ResetButton />
      </div>
      <div className={'relative w-3/4 h-96 flex flex-col items-center'}>
        <div className={'absolute z-10 bottom-0 pb-4 bg-black/20 backdrop-blur-lg flex flex-col items-center'}>
          <div className={'z-50 font-[LadyRadical] text-6xl text-red-600'}>{'Venger'}</div>
          <div className={'z-10'}>{`rpg-bot 0.1 / ${model || 'model not set'}`}</div>
          <div className={'z-10 '}>
          </div>
        </div>
        <Image src={'/venger.png'} alt={'venger'} width={318} height={318} className={'absolute z-1 bottom-0'} />
      </div>
    </Panel>
  </main>
}
