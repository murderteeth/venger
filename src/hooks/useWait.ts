import { useEffect, useState } from 'react'

export default function useWait(duration: number) {
  const [doneWaiting, setDoneWaiting] = useState(false)
  useEffect(() => {
    setTimeout(() => setDoneWaiting(true), duration)
  }, [setDoneWaiting, duration])
  return doneWaiting
}
