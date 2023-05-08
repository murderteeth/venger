import Embers from '@/components/Embers'
import './globals.css'
import { Space_Mono as Font } from 'next/font/google'
import BusyProvider from '@/hooks/useBusy'
import MessagesProvider from '@/hooks/useMessages'
import GameDataProvider from '@/hooks/useGameData'
import GmProvider from '@/hooks/useGameMaster'

const font = Font({ weight: "400", subsets: ["latin"] })

export const metadata = {
  title: 'Venger',
  description: 'Embark on a text-based adventure fueled by GPT, where your choices guide you through a world of mystery, puzzles, and exploration. Unravel secrets and navigate an interactive narrative in this immersive, AI-driven experience.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <html lang="en">
    <head>
      <title>{metadata.title}</title>
      <meta name='description' content={metadata.description} />
      <link rel="icon" href="/favicon.png" />
    </head>
    <body className={`relative w-screen h-screen ${font.className}`}>
      <Embers disabled={false} className={'absolute z-1 inset-0 w-full h-full'} />
      <div className={'absolute inset-0 z-10 text-white bg-transparent'}>
        <BusyProvider>
          <MessagesProvider>
            <GameDataProvider>
              <GmProvider>
                {children}
              </GmProvider>
            </GameDataProvider>
          </MessagesProvider>
        </BusyProvider>
      </div>
    </body>
  </html>
}
