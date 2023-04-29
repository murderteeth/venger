// adapted from https://codepen.io/jet/pen/gwFGl

'use client'

import React, { useEffect, useState } from 'react'

const EMBERCOUNT = 48
const MAXVELOCITY = 3

const palette = ['#ff0000', '#00ff00', '#ffffff', '#ffff00', '#ffff00', '#ffff00']
const flicka = [] as string[]
for(let i = 0; i < 100; i++) {
  const rdx = Math.floor(Math.random() * palette.length)
  flicka.push(palette[rdx])
}

function emberfield(canvas: HTMLCanvasElement) {
  const result = []
  for (let i = 0; i < EMBERCOUNT; i++) {
    const vy = Math.ceil(Math.random() * MAXVELOCITY)
    const ember = {
      x: Math.floor(Math.random() * canvas.width - 1),
      y: Math.floor(Math.random() * (canvas.height - 8)),
      vy,
      size: vy + 1,
      flicka: Math.floor(Math.random() * flicka.length)
    }
    result.push(ember)
  }
  return result
}

export default function Embers({ disabled, className }: { disabled?: boolean, className?: string }) {
  const canvas = React.createRef<HTMLCanvasElement>()
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if(!window) return
    setSize({ width: window.innerWidth, height: window.innerHeight })
  }, [setSize])

  useEffect(() => {
    if(disabled || !canvas.current) return

    const emberList = emberfield(canvas.current)
    const frameDelay = 32
    const ctx = canvas.current?.getContext('2d')
    ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    let frame : number
    let timeout : NodeJS.Timeout

    (function loop() {
      timeout = setTimeout(() => {
        if(!ctx) return
        frame = requestAnimationFrame(loop)
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        let ember
        for(let i = 0, max = emberList.length; i < max; i++) {
          ember = emberList[i]
          ember.y = ember.y - ember.vy

          if(ember.y < 0) {
            ember.y = ctx.canvas.height
            ember.x = Math.floor(Math.random() * (ctx.canvas.width - 1))
            ember.vy = Math.ceil(Math.random() * MAXVELOCITY)
            ember.size = ember.vy + 1
            ember.flicka = Math.floor(Math.random() * flicka.length)
          }

          ctx.fillStyle = flicka[ember.flicka]
          ember.flicka = (ember.flicka + 1) % (flicka.length - 1)
          ctx.beginPath()
          ctx.fillRect(ember.x, ember.y, ember.size, ember.size)
          ctx.closePath()
          ctx.fill()

        }

      }, frameDelay)
    }())

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timeout)
    }

  }, [disabled, canvas])

  return <canvas 
    ref={canvas}
    width={size.width}
    height={size.height}
    className={`w-full h-full ${className}`} />
}
