import React, { useEffect, useState, createRef } from 'react'
import gifFrames from 'gif-frames'

type AsciiGIFProps = {
  url: string
  charactersPerLine: number
  framesPerSecond?: number
  className?: string
}

type FrameData = {
  getImage: () => HTMLCanvasElement
}

const AsciiGIF: React.FC<AsciiGIFProps> = ({ url, charactersPerLine, framesPerSecond = 8, className }) => {
  const [asciiFrames, setAsciiFrames] = useState<string[][][]>([])
  const [currentFrame, setCurrentFrame] = useState(0)
  const canvasRef = createRef<HTMLCanvasElement>()

  const createAsciiFrames = async (url: string, charactersPerLine: number): Promise<string[][][]> => {
    const newAsciiFrames: string[][][] = []

    try {
      const frames = await gifFrames({ url, frames: 'all', outputType: 'canvas' })

      for (const frame of frames) {
        const sourceCanvas = frame.getImage()
        const newCanvas = document.createElement('canvas')
        const aspectRatio = sourceCanvas.width / sourceCanvas.height
        const characterWidth = newCanvas.width / charactersPerLine
        const characterHeight = characterWidth / aspectRatio

        newCanvas.width = charactersPerLine * characterWidth
        newCanvas.height = charactersPerLine * characterHeight / aspectRatio

        const ctx = newCanvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return newAsciiFrames

        ctx.drawImage(sourceCanvas, 0, 0, newCanvas.width, newCanvas.height)
        const frameData = ctx.getImageData(0, 0, newCanvas.width, newCanvas.height)
        const frameAscii: string[][] = []

        for (let y = 0; y < newCanvas.height; y += characterHeight) {
          const row: string[] = []
          for (let x = 0; x < newCanvas.width; x += characterWidth) {
            const pixelIndex = (Math.floor(y) * newCanvas.width + Math.floor(x)) * 4
            const pixelData = frameData.data.slice(pixelIndex, pixelIndex + 4)
            const asciiChar = pixelToAscii(pixelData)
            row.push(asciiChar)
          }
          frameAscii.push(row)
        }
        newAsciiFrames.push(frameAscii)
      }
    } catch (error) {
      console.error('Error processing GIF:', error)
    }

    return newAsciiFrames
  }

  const pixelToAscii = (pixelData: Uint8ClampedArray): string => {
    const [r, g, b] = Array.from(pixelData)
    const brightness = (r + g + b) / 3
    const asciiChars = ' .:-=+*%@#'
    const charIndex = Math.floor(brightness / 255 * (asciiChars.length - 1))
    return asciiChars[charIndex]
  }

  useEffect(() => {
    createAsciiFrames(url, charactersPerLine).then((newAsciiFrames) => {
      setAsciiFrames(newAsciiFrames)
    })
  }, [url, charactersPerLine])

  useEffect(() => {
    if (asciiFrames.length === 0) {
      return
    }

    const interval = setInterval(() => {
      setCurrentFrame((prevFrame) => (prevFrame + 1) % asciiFrames.length)
    }, 1000 / framesPerSecond)

    return () => clearInterval(interval)
  }, [asciiFrames, framesPerSecond])

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      <div className={`overflow-auto ${className}`}>
        {asciiFrames.length > 0 && (
          <pre className="whitespace-pre-wrap">
            {asciiFrames[currentFrame].map((row) => row.join('')).join('\n')}
          </pre>
        )}
      </div>
    </>
  )
  }
  
  export default AsciiGIF
  