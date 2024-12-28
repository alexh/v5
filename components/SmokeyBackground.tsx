'use client'

import React, { useEffect, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'

interface Point {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  opacity: number
  size: number
}

interface NearestResult {
  distance: number;
  rect: DOMRect | null;
}

const SmokeyBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { currentTheme } = useTheme()
  const particlesRef = useRef<Point[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const frameRef = useRef<number>()
  const textNodesRef = useRef<DOMRect[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Only target the text content div
    const getTextNodes = () => {
      const textContainer = document.querySelector('.text-content')
      return textContainer ? [textContainer.getBoundingClientRect()] : []
    }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      textNodesRef.current = getTextNodes()
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    // Check if a point is near any text node
    const isNearText = (x: number, y: number, padding: number = 40) => {
      return textNodesRef.current.some(rect => {
        return x >= rect.left - padding &&
               x <= rect.right + padding &&
               y >= rect.top - padding &&
               y <= rect.bottom + padding
      })
    }

    const createParticle = (): Point => {
      let x, y
      do {
        x = Math.random() * canvas.width
        y = Math.random() * canvas.height
      } while (!isNearText(x, y))

      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        life: Math.random() * 400 + 400,
        opacity: Math.random() * 0.5 + 0.3,
        size: Math.random() * 80 + 40
      }
    }

    const initParticles = () => {
      particlesRef.current = Array.from({ length: 500 }, createParticle)
    }

    initParticles()

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle, i) => {
        // Natural movement
        particle.x += particle.vx
        particle.y += particle.vy

        // Enhanced mouse repulsion
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const repulsionRadius = 200
        
        if (distance < repulsionRadius) {
          const force = (repulsionRadius - distance) / repulsionRadius
          particle.vx -= (dx / distance) * force * 0.2
          particle.vy -= (dy / distance) * force * 0.2
        }

        // Keep particles near text with stronger attraction
        if (!isNearText(particle.x, particle.y, 80)) {
          const nearestText = textNodesRef.current.reduce<NearestResult>((nearest, rect) => {
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2
            const d = Math.sqrt(
              Math.pow(particle.x - centerX, 2) + 
              Math.pow(particle.y - centerY, 2)
            )
            
            if (d < nearest.distance) {
              return { distance: d, rect }
            }
            return nearest
          }, { distance: Infinity, rect: null })

          if (nearestText.rect) {
            const attractX = nearestText.rect.left + nearestText.rect.width / 2
            const attractY = nearestText.rect.top + nearestText.rect.height / 2
            particle.vx += (attractX - particle.x) * 0.005
            particle.vy += (attractY - particle.y) * 0.005
          }
        }

        // Even smoother damping
        particle.vx *= 0.98
        particle.vy *= 0.98

        // Enhanced particle drawing with larger core
        const innerSize = particle.size * 0.6
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        )
        
        // Brighter core with smoother gradient
        gradient.addColorStop(0, hexToRgba(currentTheme.secondary, particle.opacity * 1.8))
        gradient.addColorStop(0.3, hexToRgba(currentTheme.secondary, particle.opacity * 0.9))
        gradient.addColorStop(1, hexToRgba(currentTheme.secondary, 0))

        ctx.beginPath()
        ctx.fillStyle = gradient
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.globalAlpha = 0.9
        ctx.fill()
        ctx.globalAlpha = 1

        // Brighter center point
        const centerGlow = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, innerSize
        )
        centerGlow.addColorStop(0, hexToRgba(currentTheme.secondary, particle.opacity * 2.25))
        centerGlow.addColorStop(1, hexToRgba(currentTheme.secondary, 0))

        ctx.beginPath()
        ctx.fillStyle = centerGlow
        ctx.arc(particle.x, particle.y, innerSize, 0, Math.PI * 2)
        ctx.fill()

        // Smoother regeneration
        particle.life--
        if (particle.life <= 0) {
          particle.opacity *= 0.97
          if (particle.opacity < 0.01) {
            particlesRef.current[i] = createParticle()
          }
        }
      })

      frameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [currentTheme])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[1]"
    />
  )
}

export default SmokeyBackground 