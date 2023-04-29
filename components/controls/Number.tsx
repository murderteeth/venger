import React, { forwardRef, InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  className?: string
}

const Number = forwardRef<HTMLInputElement, Props>(({ className, ...props }, ref) => {
  return <input ref={ref} type={'number'} {...props}
    className={`px-2 py-2 bg-zinc-900 
    font-mono rounded-lg
    disabled:border-transparent
    ${className}`} />
})

Number.displayName = 'Number'

export default Number
