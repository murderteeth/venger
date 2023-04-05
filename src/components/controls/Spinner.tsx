import React from 'react'
import { Oval } from 'react-loader-spinner'
import colors from 'tailwindcss/colors'

export default function Spinner({ size }: { size: number }) {
  return <Oval 
    width={size}
    height={size}
    color={colors.purple[200]}
    secondaryColor={colors.purple[900]} />
}
