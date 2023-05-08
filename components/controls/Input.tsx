import React, { forwardRef, InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  className?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input ref={ref} {...props} className={`
    px-4 py-2 
    text-xl text-red-700
    bg-zinc-950 
    border border-zinc-900 
    hover:border-red-500
    focus:border-red-700
    disabled:text-gray-800 hover:disabled:border-zinc-900 disabled:placeholder-gray-800
    focus:ring-0 focus:outline-none
  ${className}`} />
))

Input.displayName = 'Input'

export default Input
