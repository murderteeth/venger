import React, { forwardRef, ButtonHTMLAttributes } from 'react'
import PropTypes from 'prop-types'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string
  className?: string
  onClick: () => void
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ label, className, children, onClick, ...props }, ref) => (
  <button onClick={onClick} ref={ref} {...props} className={`
    px-6 py-2 flex items-center justify-center
    bg-zinc-950 
    border border-zinc-900 text-zinc-400
    hover:border-red-500 hover:text-red-500
    active:border-red-700 active:text-red-700
    disabled:border-zinc-950 disabled:text-zinc-900
    hover:disabled:border-zinc-950 hover:disabled:text-zinc-900
  ${className}`}>
    {children || label}
  </button>
))

Button.displayName = 'Button'

Button.propTypes = {
  label: PropTypes.string,
  onClick: PropTypes.func.isRequired,
}

Button.defaultProps = {
  label: 'Button',
}

export default Button
