import React, { ReactNode, createContext, useContext } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { MessageGram } from '../components/Messenger'

export interface Messages {
	messages: MessageGram[],
	setMessages: React.Dispatch<React.SetStateAction<MessageGram[]>>
}

export const messagesContext = createContext<Messages>({} as Messages)

export const useMessages = () => useContext(messagesContext)

export default function MessagesProvider({children}: {children: ReactNode}) {
  const [messages, setMessages] = useLocalStorage<MessageGram[]>('messages', [])
	return <messagesContext.Provider value={{messages, setMessages}}>
		{children}
	</messagesContext.Provider>
}
