import React, { createContext, ReactNode, useContext, useState } from 'react'
import TopBarProgress from 'react-topbar-progress-indicator'
import colors from 'tailwindcss/colors'

TopBarProgress.config({
  barColors: {
    '0': colors.purple[400],
    '0.75': colors.amber[300],
    '1.0': colors.purple[400]
  },
  shadowBlur: 5
})

interface IBusy {
  busy: boolean,
  setBusy: React.Dispatch<React.SetStateAction<boolean>>
}

const	BusyContext = createContext({} as IBusy)

export const useBusy = () => useContext(BusyContext)

export default function BusyProvider({ children } : { children: ReactNode }) {
  const [busy, setBusy] = useState(false)
  return <BusyContext.Provider value={{ busy, setBusy }}>
    <div className={'absolute top-0 left-0 w-full pointer-events-none'}>
      {/* {busy && <TopBarProgress  />} */}
    </div>
    {children}
  </BusyContext.Provider>
}
