import React from 'react'
import Embers from './Embers'

export default function Ahoy() {
  React.useEffect(() => {
    fetch('/api/ping').then(response => {
      response.json().then(json => {
        console.log('json', json)
      })
    })
  }, [])

  return <div className={`relative w-full h-full
    flex flex-col items-center justify-center bg-black`}>
    <Embers className={'absolute z-1 inset-0'} />
    <div className={'font-[LadyRadical] text-4xl'}>{'dread.cat'}</div>
    <div className={''}>{'😼 - Ahoy!!'}</div>
  </div>
}
