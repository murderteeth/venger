import React, { forwardRef, ButtonHTMLAttributes, useCallback } from 'react'
import { useLongPress } from 'use-long-press'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string
  onClick?: () => void
  onLongClick?: () => void
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, children, onClick, onLongClick, ...props }, ref) => {
  const onLongPress = useCallback(() => {
    if(props.disabled == true) return;
    onLongClick?.()
  }, [props, onLongClick])

  const bindClicks = useLongPress(onLongPress, {
    onCancel: useCallback(() => {
      if(props.disabled == true) return;
      onClick?.()
    }, [props, onClick])
  })

  return <button {...bindClicks()} ref={ref} {...props} className={`
  px-6 py-2 flex items-center justify-center
  bg-zinc-950 
  border border-zinc-900 text-zinc-400
  hover:border-red-500 hover:text-red-500
  active:border-red-700 active:text-red-700
  disabled:border-zinc-950 disabled:text-zinc-800
  hover:disabled:border-zinc-950 hover:disabled:text-zinc-800
  ${className}`}>
    {children}
  </button>
})

Button.displayName = 'Button'

export default Button
