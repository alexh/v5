import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react"

interface ScrambleInProps {
  text: string
  scrambleSpeed?: number
  scrambledLetterCount?: number
  characters?: string
  className?: string
  scrambledClassName?: string
  autoStart?: boolean
  onStart?: () => void
  onComplete?: () => void
}

export interface ScrambleInHandle {
  start: () => void
  reset: () => void
}

const ScrambleIn = forwardRef<ScrambleInHandle, ScrambleInProps>(
  (
    {
      text,
      scrambleSpeed = 50,
      scrambledLetterCount = 2,
      characters = "abcdefghijklmnopqrstuvwxyz!@#$%^&*()_+",
      className = "",
      _scrambledClassName = "",
      autoStart = true,
      onStart,
      onComplete,
    },
    ref
  ) => {
    const [displayText, setDisplayText] = useState("")
    const [isAnimating, setIsAnimating] = useState(false)
    const [visibleLetterCount, setVisibleLetterCount] = useState(0)

    const startAnimation = useCallback(() => {
      setIsAnimating(true)
      setVisibleLetterCount(0)
      onStart?.()
    }, [onStart])

    const reset = useCallback(() => {
      setIsAnimating(false)
      setVisibleLetterCount(0)
      setDisplayText("")
    }, [])

    useImperativeHandle(ref, () => ({
      start: startAnimation,
      reset,
    }))

    useEffect(() => {
      if (autoStart) {
        startAnimation()
      }
    }, [autoStart, startAnimation])

    useEffect(() => {
      let interval: NodeJS.Timeout

      if (isAnimating) {
        interval = setInterval(() => {
          if (visibleLetterCount < text.length) {
            setVisibleLetterCount((prev) => prev + 1)
            
            const scrambledPart = Array(scrambledLetterCount)
              .fill(0)
              .map(() => characters[Math.floor(Math.random() * characters.length)])
              .join("")

            // Create a temporary div to parse HTML
            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = text

            // Get all text nodes
            const textNodes: Node[] = []
            const walker = document.createTreeWalker(
              tempDiv,
              NodeFilter.SHOW_TEXT,
              null
            )

            let node;
            while ((node = walker.nextNode()) !== null) {
              textNodes.push(node)
            }

            // Calculate total text length
            let currentPos = 0
            textNodes.forEach(node => {
              const nodeText = node.textContent || ""
              if (currentPos + nodeText.length >= visibleLetterCount) {
                const visiblePart = nodeText.slice(0, visibleLetterCount - currentPos)
                node.textContent = visiblePart + scrambledPart
              }
              currentPos += nodeText.length
            })

            setDisplayText(tempDiv.innerHTML)
          } else {
            setDisplayText(text)
            clearInterval(interval)
            setIsAnimating(false)
            onComplete?.()
          }
        }, scrambleSpeed)
      }

      return () => {
        if (interval) clearInterval(interval)
      }
    }, [isAnimating, text, visibleLetterCount, scrambledLetterCount, characters, scrambleSpeed, onComplete])

    return (
      <p className={className} dangerouslySetInnerHTML={{ __html: displayText }} />
    )
  }
)

ScrambleIn.displayName = "ScrambleIn"
export default ScrambleIn 