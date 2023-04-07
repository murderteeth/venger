import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Theme from './components/Theme'
import BusyProvider from './components/Busy'
import Ahoy from './components/Ahoy'
import MessagesProvider from './hooks/useMessages'

function App() {
  return <BrowserRouter>
    <BusyProvider>
      <MessagesProvider>
        <Theme className={'w-full h-full'}>
          <Routes>
            <Route path={'/'} element={<Ahoy />} />
          </Routes>
        </Theme>
      </MessagesProvider>
    </BusyProvider>
  </BrowserRouter>
}

export default App
