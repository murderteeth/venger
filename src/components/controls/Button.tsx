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
    bg-purple-600 hover:bg-purple-500 active:bg-purple-700
    disabled:bg-gray-600
    rounded-lg
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
