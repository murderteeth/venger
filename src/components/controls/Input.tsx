import React, { ChangeEvent, ReactNode } from 'react'

interface IInput {
  _ref?: React.LegacyRef<HTMLInputElement> | undefined,
  type: string,
  defaultValue?: string,
  placeholder?: string,
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void,
  disabled?: boolean,
  className?: string,
  min?: number,
  max?: number,
  step?: number,
  children?: ReactNode
}

export default function Input(
  {
    _ref, 
    type, 
    defaultValue, 
    placeholder, 
    onChange, 
    disabled, 
    className, 
    min, 
    max, 
    step, 
    children
  } : IInput) {
  return <input ref={_ref}
    type={type}
    defaultValue={defaultValue}
    placeholder={placeholder}
    onChange={onChange} 
    disabled={disabled}
    min={min}
    max={max}
    step={step}
    className={`
    px-4 py-2 
    text-xl text-red-700
    bg-zinc-950 border-zinc-900 
    hover:border-red-500
    focus:border-red-700
    disabled:text-gray-800 hover:disabled:border-zinc-900
    rounded-lg focus:ring-0
    ${className}`}>
    {children}
  </input>
}
