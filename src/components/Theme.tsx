import React, { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import Embers from './Embers'

export default function Theme({ className, children }: { className: string, children: ReactNode }) {
  const [theme] = useState('dark')
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [setMounted])
  return <div className={`relative
    ${mounted && theme === 'dark' ? 'dark' : ''}
    ${className}`}>
      <Embers disabled={false} className={'absolute z-1 inset-0'} />
      <div className={'absolute inset-0 z-10 dark:text-white'}>
        {children}
      </div>
    </div>
}
