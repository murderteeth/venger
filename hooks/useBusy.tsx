'use client'

import React, { createContext, ReactNode, useContext, useState } from 'react'

interface IBusy {
  busy: boolean,
  setBusy: React.Dispatch<React.SetStateAction<boolean>>
}

const	BusyContext = createContext({} as IBusy)

export const useBusy = () => useContext(BusyContext)

export default function BusyProvider({ children } : { children: ReactNode }) {
  const [busy, setBusy] = useState(false)
  return <BusyContext.Provider value={{ busy, setBusy }}>
    {children}
  </BusyContext.Provider>
}
