import React, { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { MessageGram } from '../components/Messenger'

export interface Messages {
	messages: MessageGram[],
	setMessages: React.Dispatch<React.SetStateAction<MessageGram[]>>,
	resetMessages: () => void
}

export const messagesContext = createContext<Messages>({} as Messages)

export const useMessages = () => useContext(messagesContext)

export default function MessagesProvider({children}: {children: ReactNode}) {
  const [savedMessages, setSavedMessages] = useLocalStorage<MessageGram[]>('messages', [])
  const [messages, setMessages] = useState<MessageGram[]>([])

	useEffect(() => {
		if(savedMessages.length > 0 && messages.length === 0) {
			setMessages(savedMessages)
		}
	}, [savedMessages, messages, setMessages])

	useEffect(() => {
		setSavedMessages(messages.filter(m => m.contentType !== 'busy'))
	}, [messages, setSavedMessages])

	const resetMessages = useCallback(() => {
		setMessages([])
		setSavedMessages([])
	}, [setMessages, setSavedMessages])

	return <messagesContext.Provider value={{messages, setMessages, resetMessages}}>
		{children}
	</messagesContext.Provider>
}
