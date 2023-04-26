import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Theme from './components/Theme'
import BusyProvider from './components/Busy'
import Hail from './components/Hail'
import MessagesProvider from './hooks/useMessages'
import GameDataProvider from './hooks/useGameData'
import GmProvider from './hooks/useGameMaster'

function App() {
  return <BrowserRouter>
    <BusyProvider>
      <MessagesProvider>
        <GameDataProvider>
          <GmProvider>
            <Theme className={'w-full h-full'}>
              <Routes>
                <Route path={'/'} element={<Hail />} />
              </Routes>
            </Theme>
          </GmProvider>
        </GameDataProvider>
      </MessagesProvider>
    </BusyProvider>
  </BrowserRouter>
}

export default App
