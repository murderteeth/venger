import React, { ReactNode } from 'react'
import { useEffect, useState } from 'react'

export default function Theme({ className, children }: { className: string, children: ReactNode }) {
  const [theme] = useState('dark')
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [setMounted])
  return <div className={`
    ${mounted && theme === 'dark' ? 'dark' : ''}
    ${className}`}>
      <div className={'w-full h-full dark:text-white'}>
        {children}
      </div>
    </div>
}
