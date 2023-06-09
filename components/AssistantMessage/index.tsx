import React, { useCallback, useMemo } from 'react'
import colors from 'tailwindcss/colors'
import { MessageGram } from '../Messenger'
import { Button } from '../controls'
import { useMessages } from '../../hooks/useMessages'
import { BeatLoader } from 'react-spinners'
import { useGm } from '../../hooks/useGameMaster'
import Settings from './Settings'

function parseRollData(input: string) {
  const regex = /^[Rr]oll (\d+)[ ]?d(\d+)$/
  const match = input.match(regex)
  const isRoll = !!match
  const numberOfDice = isRoll ? parseInt(match[1]) : undefined
  const numberOfSides = isRoll ? parseInt(match[2]) : undefined
  return { isRoll, numberOfDice, numberOfSides }
}

function rollDice(numberOfDice: number, numberOfSides: number): number {
  let result = 0;
  for (let i = 0; i < numberOfDice; i++) {
    result += Math.floor(Math.random() * numberOfSides) + 1;
  }
  return result;
}

const errorMessage = 'An arcane glitch has befallen our adventure! Gather your wits, try again!'

export default function AssistantMessage({message, latestMessage}: {message: MessageGram, latestMessage: boolean}) {
  const {setMessages} = useMessages()
  const {gamePrompt} = useGm()

  const contentType = useMemo(() => {
    return message.contentType || 'text'
  }, [message])

  const factory = useCallback((component: string) => {
    switch(component) {
      case 'settings':
        return <Settings disabled={!latestMessage} />
      default:
        return <>{'component' + component}</>
    }
  }, [latestMessage])

  const onOption = useCallback((option: string) => {
    const rollData = parseRollData(option)
    if(rollData.isRoll && rollData.numberOfDice && rollData.numberOfSides) {
      const roll = rollDice(rollData.numberOfDice, rollData.numberOfSides)
      setMessages(current => [...current, {role: 'user', content: `I roll ${roll}`}])
      gamePrompt(`I roll ${roll}`)
    } else {
      setMessages(current => [...current, {role: 'user', content: option}])
      gamePrompt(option)
    }
  }, [setMessages, gamePrompt])

  return <div className={'w-64 sm:w-96 flex flex-col gap-4'}>
    {contentType === 'text' && message.content}
    {contentType === 'options' && (message.content as string[]).map((option, index) => {
      return <Button disabled={!latestMessage} key={index} onClick={() => onOption(option)}>{option}</Button>
    })}
    {contentType === 'component' && <div>
      {factory(message.content as string)}
    </div>}
    {contentType === 'busy' && <BeatLoader size={12} color={colors.red[500]} className={'mb-2'} />}
    {contentType === 'error' && <div className={'text-red-700'}>{errorMessage}</div>}
  </div>
}
