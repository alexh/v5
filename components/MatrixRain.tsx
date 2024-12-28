'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'

interface MutatedChar {
  char: string
  frames: number
}

interface WordChar {
  word: string
  y: number
  mutatedChars: MutatedChar[]
}

interface JapaneseChar {
  char: string
  mutationFrames: number
}

type MatrixChar = WordChar | JapaneseChar

const MatrixRain = () => {
  const [key, setKey] = useState(0) // Add key to force complete remount
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const englishCanvasRef = useRef<HTMLCanvasElement>(null)
  const intervalRef = useRef<NodeJS.Timeout>()
  const { currentTheme } = useTheme()

  // Force remount of component when theme changes
  useEffect(() => {
    setKey(prev => prev + 1)
  }, [currentTheme])

  useEffect(() => {
    const canvas = canvasRef.current
    const englishCanvas = englishCanvasRef.current
    if (!canvas || !englishCanvas) return

    const ctx = canvas.getContext('2d')
    const englishCtx = englishCanvas.getContext('2d')
    if (!ctx || !englishCtx) return

    // Helper function to darken a color
    const getDarkenedColor = (color: string, factor: number = 0.15) => {
      const r = parseInt(color.slice(1, 3), 16)
      const g = parseInt(color.slice(3, 5), 16)
      const b = parseInt(color.slice(5, 7), 16)
      return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`
    }

    // Use darkened theme background
    const darkenedBackground = getDarkenedColor(currentTheme.background)

    // Reset canvases with darkened background
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    englishCanvas.width = window.innerWidth
    englishCanvas.height = window.innerHeight

    ctx.fillStyle = darkenedBackground
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    englishCtx.clearRect(0, 0, englishCanvas.width, englishCanvas.height)

    const loadWords = async () => {
      const response = await fetch('/matrix-words.txt')
      const text = await response.text()
      return text.split('\n').filter(word => word.trim() !== '')
    }

    const initializeMatrix = async () => {
      const words = await loadWords()
      if (!canvas || !englishCanvas) return

      const ctx = canvas.getContext('2d')
      const englishCtx = englishCanvas.getContext('2d')
      if (!ctx || !englishCtx) return

      const resizeCanvas = () => {
        if (canvas && englishCanvas) {
          canvas.width = englishCanvas.width = window.innerWidth
          canvas.height = englishCanvas.height = window.innerHeight
          // Fill with black on resize
          ctx.fillStyle = '#000000'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
      }

      resizeCanvas()
      window.addEventListener('resize', resizeCanvas)

      const generateShades = (baseColor: string) => {
        const r = parseInt(baseColor.slice(1, 3), 16)
        const g = parseInt(baseColor.slice(3, 5), 16)
        const b = parseInt(baseColor.slice(5, 7), 16)
        
        return [
          `rgba(${r}, ${g}, ${b}, 0.95)`,
          `rgba(${Math.min(r + 30, 255)}, ${Math.min(g + 30, 255)}, ${Math.min(b + 30, 255)}, 0.95)`,
          `rgba(${Math.min(r + 60, 255)}, ${Math.min(g + 60, 255)}, ${Math.min(b + 60, 255)}, 0.95)`,
          `rgba(${Math.max(r - 30, 0)}, ${Math.max(g - 30, 0)}, ${Math.max(b - 30, 0)}, 0.95)`,
        ]
      }

      // Use the theme's primary color for the matrix effect
      const colorShades = generateShades(currentTheme.primary)
      
      // Halve the fontSize to double the density
      const fontSize = 14
      const columns = Math.floor(canvas.width / (fontSize/2)) // Halved the division to double density
      const drops = new Array(columns).fill(1)

      const getRandomJapaneseChar = () => {
        return String.fromCharCode(0x30A0 + Math.random() * (0x30FF - 0x30A0 + 1))
      }

      const getRandomChar = (): MatrixChar => {
        if (Math.random() < 0.1) {
          const word = words[Math.floor(Math.random() * words.length)]
          return {
            word,
            y: -Math.random() * canvas.height,
            mutatedChars: new Array(word.length).fill(null).map(() => ({ char: '', frames: 0 }))
          }
        }
        return { char: getRandomJapaneseChar(), mutationFrames: 0 }
      }

      const chars: MatrixChar[] = new Array(columns).fill(null).map(() => getRandomChar())
      const charOpacity = new Array(columns).fill(1)

      const mutationSequence = ['⚙️', '#', '@', '%', '&']

      const mutateChar = (char: JapaneseChar): string => {
        if (char.mutationFrames > 0) {
          char.mutationFrames--
          return mutationSequence[char.mutationFrames % mutationSequence.length]
        }
        return char.char
      }

      const draw = () => {
        ctx.fillStyle = `${darkenedBackground.slice(0, -1)}, 0.1)`
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        englishCtx.clearRect(0, 0, englishCanvas.width, englishCanvas.height)

        ctx.font = `bold ${fontSize}px monospace`
        englishCtx.font = `bold ${fontSize}px monospace`
        
        for (let i = 0; i < drops.length; i++) {
          const colorIndex = Math.floor(Math.random() * colorShades.length)
          const baseColor = colorShades[colorIndex]

          if ('word' in chars[i]) {
            const wordChar = chars[i] as WordChar
            englishCtx.fillStyle = currentTheme.text
            englishCtx.shadowColor = currentTheme.text
            englishCtx.shadowBlur = 20
            englishCtx.lineWidth = 3
            
            for (let j = 0; j < wordChar.word.length; j++) {
              let displayChar = wordChar.word[j]
              if (wordChar.mutatedChars[j].frames > 0) {
                displayChar = mutationSequence[wordChar.mutatedChars[j].frames % mutationSequence.length]
                wordChar.mutatedChars[j].frames--
              }
              
              const x = i * (fontSize/2)
              const y = wordChar.y + j * fontSize
              
              englishCtx.strokeStyle = currentTheme.secondary
              englishCtx.strokeText(displayChar, x, y)
              
              englishCtx.fillText(displayChar, x, y)
              
              if (Math.random() < 0.01 && wordChar.mutatedChars[j].frames === 0) {
                wordChar.mutatedChars[j] = { char: wordChar.word[j], frames: mutationSequence.length }
              }
            }
            englishCtx.shadowBlur = 0
            
            wordChar.y += 1.0
            
            if (wordChar.y > canvas.height + wordChar.word.length * fontSize) {
              chars[i] = getRandomChar()
              charOpacity[i] = 1
            }
          } else {
            const japaneseChar = chars[i] as JapaneseChar
            ctx.shadowColor = baseColor
            ctx.shadowBlur = 15
            ctx.fillStyle = baseColor
            
            let displayChar = mutateChar(japaneseChar)
            ctx.fillText(displayChar, i * (fontSize/2), drops[i] * fontSize) // Halved the x-position spacing
            ctx.shadowBlur = 0

            if (Math.random() < 0.7) {
              chars[i] = { char: getRandomJapaneseChar(), mutationFrames: 0 }
            }
          }

          charOpacity[i] *= 0.998

          if (drops[i] * fontSize > canvas.height && Math.random() > 0.99) {
            drops[i] = 0
            chars[i] = getRandomChar()
            charOpacity[i] = 1
          }

          drops[i]++
        }
      }

      intervalRef.current = setInterval(draw, 33)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
        window.removeEventListener('resize', resizeCanvas)
      }
    }

    // Longer delay to ensure complete cleanup
    setTimeout(() => {
      initializeMatrix()
    }, 200)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [currentTheme, key]) // Add key to dependencies

  return (
    <>
      <canvas 
        key={`base-${key}`}
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full z-0" 
      />
      <canvas 
        key={`english-${key}`}
        ref={englishCanvasRef} 
        className="absolute top-0 left-0 w-full h-full mix-blend-lighten" 
      />
    </>
  )
}

export default MatrixRain 