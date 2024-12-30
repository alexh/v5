'use client'

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react"
import { useAnimationFrame } from "framer-motion"

type Position = { x: number; y: number }

const useMousePosition = () => {
  const position = useRef<Position>({ x: 0, y: 0 })

  useEffect(() => {
    const updatePosition = (x: number, y: number) => {
      position.current = { x, y }
    }

    const handleMouseMove = (ev: MouseEvent) => {
      updatePosition(ev.clientX, ev.clientY)
    }

    const handleTouchMove = (ev: TouchEvent) => {
      const touch = ev.touches[0]
      updatePosition(touch.clientX, touch.clientY)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchmove", handleTouchMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchmove", handleTouchMove)
    }
  }, [])

  return position
}

interface FloatingContextType {
  registerElement: (id: string, element: HTMLDivElement, depth: number) => void
  unregisterElement: (id: string) => void
}

const FloatingContext = createContext<FloatingContextType | null>(null)

interface FloatingProps {
  children: ReactNode
  className?: string
  sensitivity?: number
  easingFactor?: number
}

const Floating = ({
  children,
  className = "",
  sensitivity = 1,
  easingFactor = 0.05,
}: FloatingProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mousePosition = useMousePosition()
  const elementsMap = useRef(
    new Map<
      string,
      {
        element: HTMLDivElement
        depth: number
        currentPosition: Position
      }
    >()
  )

  const registerElement = useCallback(
    (id: string, element: HTMLDivElement, depth: number) => {
      elementsMap.current.set(id, {
        element,
        depth,
        currentPosition: { x: 0, y: 0 },
      })
    },
    []
  )

  const unregisterElement = useCallback((id: string) => {
    elementsMap.current.delete(id)
  }, [])

  useAnimationFrame(() => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    elementsMap.current.forEach((data) => {
      const strength = (data.depth * sensitivity) / 20

      // Calculate relative mouse position from center
      const relativeX = (mousePosition.current.x - centerX) * strength
      const relativeY = (mousePosition.current.y - centerY) * strength

      // Update position with easing
      data.currentPosition.x += (relativeX - data.currentPosition.x) * easingFactor
      data.currentPosition.y += (relativeY - data.currentPosition.y) * easingFactor

      data.element.style.transform = `translate3d(${data.currentPosition.x}px, ${data.currentPosition.y}px, 0)`
    })
  })

  return (
    <FloatingContext.Provider value={{ registerElement, unregisterElement }}>
      <div
        ref={containerRef}
        className={`absolute top-0 left-0 w-full h-full ${className}`}
      >
        {children}
      </div>
    </FloatingContext.Provider>
  )
}

export default Floating

interface FloatingElementProps {
  children: ReactNode
  className?: string
  depth?: number
  style?: React.CSSProperties
}

export const FloatingElement = ({
  children,
  className = "",
  depth = 1,
  style = {},
}: FloatingElementProps) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(Math.random().toString(36).substring(7))
  const context = useContext(FloatingContext)

  useEffect(() => {
    if (!elementRef.current || !context) return
    context.registerElement(idRef.current, elementRef.current, depth)
    return () => context.unregisterElement(idRef.current)
  }, [depth, context])

  return (
    <div
      ref={elementRef}
      className={`absolute will-change-transform ${className}`}
      style={style}
    >
      {children}
    </div>
  )
} 