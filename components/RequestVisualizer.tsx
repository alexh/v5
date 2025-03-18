'use client'

import React, { useEffect, useRef } from 'react'

interface RequestVisualizerProps {
  isLoading: boolean
  onComplete: () => void
}

export default function RequestVisualizer({ isLoading }: RequestVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (!isLoading || !containerRef.current) return

    const container = containerRef.current
    const nycX = container.offsetWidth * 0.6  // Adjust based on globe position
    const nycY = container.offsetHeight * 0.4  // Adjust based on globe position

    // Store current animation frame ref value at effect run time
    const animationFrameId = animationFrameRef.current

    const createParticle = () => {
      const particle = document.createElement('div')
      
      // Random starting point on visible part of globe
      const angle = (Math.random() * Math.PI) - Math.PI/2 // Concentrate on visible hemisphere
      const distance = 100 + Math.random() * 50
      
      const startX = nycX + Math.cos(angle) * distance
      const startY = nycY + Math.sin(angle) * distance

      particle.className = 'absolute w-1 h-1 bg-[#7FDBFF] rounded-full'
      particle.style.left = `${startX}px`
      particle.style.top = `${startY}px`
      
      // Animate to NYC point
      const duration = 1000 + Math.random() * 1000
      particle.animate([
        { left: `${startX}px`, top: `${startY}px`, opacity: 1, scale: 1 },
        { left: `${nycX}px`, top: `${nycY}px`, opacity: 0, scale: 0.5 }
      ], {
        duration,
        easing: 'ease-out'
      })

      container.appendChild(particle)
      setTimeout(() => particle.remove(), duration)
    }

    const interval = setInterval(createParticle, 200)

    return () => {
      clearInterval(interval)
      // Use the captured value instead of reading current ref
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isLoading])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" />
  )
} 