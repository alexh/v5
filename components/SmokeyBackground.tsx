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

interface SmokeyBackgroundProps {
  targetSelector?: string;
  opacity?: number;
  zIndex?: number;
  particleCount?: number;
  followText?: boolean;
  color?: string;
}

const SmokeyBackground = ({
  targetSelector = '.text-content',
  opacity = 1,
  zIndex = 1,
  particleCount = 500,
  followText = true,
  color,
}: SmokeyBackgroundProps) => {
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

    const getTextNodes = () => {
      if (!followText) return []
      const textContainer = document.querySelector(targetSelector)
      if (!textContainer) return []
      
      const rect = textContainer.getBoundingClientRect()
      // Shift the entire area downward
      return [{
        top: rect.top + 100,     // Move down by 200px
        bottom: rect.bottom + 300, // Extend bottom further
        left: rect.left - 100,    
        right: rect.right + 100,  
        width: rect.width + 200,  
        height: rect.height + 300,
        x: rect.x - 100,
        y: rect.y + 200,         // Move down by 200px
        toJSON: () => rect.toJSON()
      } as DOMRect]
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

    const isNearText = (x: number, y: number, padding: number = 100) => {  // Increased padding
      return textNodesRef.current.some(rect => {
        return x >= rect.left - padding &&
               x <= rect.right + padding &&
               y >= rect.top - padding &&
               y <= rect.bottom + padding
      })
    }

    const createParticle = (): Point => {
      let x, y;
      let attempts = 0;
      const maxAttempts = 50;
      
      if (followText) {
        do {
          x = Math.random() * canvas.width
          y = Math.random() * canvas.height
          attempts++
          if (attempts > maxAttempts) break
        } while (!isNearText(x, y))
      } else {
        x = Math.random() * canvas.width
        y = Math.random() * canvas.height
      }

      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 0.05,  // Reduced initial velocity
        vy: (Math.random() - 0.5) * 0.05,  // Reduced initial velocity
        life: Math.random() * 400 + 400,
        opacity: Math.random() * 0.5 + 0.3,
        size: Math.random() * 100 + 50
      }
    }

    const initParticles = () => {
      particlesRef.current = Array.from({ length: particleCount }, createParticle)
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
        // Natural movement with reduced velocity
        particle.x += particle.vx * 0.5  // Added dampening factor
        particle.y += particle.vy * 0.5  // Added dampening factor

        // Mouse repulsion with gentler force
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const repulsionRadius = 200
        
        if (distance < repulsionRadius) {
          const force = (repulsionRadius - distance) / repulsionRadius
          particle.vx -= (dx / distance) * force * 0.1  // Reduced force
          particle.vy -= (dy / distance) * force * 0.1  // Reduced force
        }

        // Text attraction with gentler force
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
            particle.vx += (attractX - particle.x) * 0.002  // Reduced attraction force
            particle.vy += (attractY - particle.y) * 0.002  // Reduced attraction force
          }
        }

        // Stronger damping for smoother movement
        particle.vx *= 0.99  // Increased damping
        particle.vy *= 0.99  // Increased damping

        // Enhanced particle drawing with larger core
        const innerSize = particle.size * 0.6
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        )
        
        const particleColor = color || currentTheme.secondary

        // Brighter core with smoother gradient
        gradient.addColorStop(0, hexToRgba(particleColor, particle.opacity * 1.8 * opacity))
        gradient.addColorStop(0.3, hexToRgba(particleColor, particle.opacity * 0.9 * opacity))
        gradient.addColorStop(1, hexToRgba(particleColor, 0))

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
        centerGlow.addColorStop(0, hexToRgba(particleColor, particle.opacity * 2.25 * opacity))
        centerGlow.addColorStop(1, hexToRgba(particleColor, 0))

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
  }, [currentTheme, opacity, targetSelector, particleCount, followText, color])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex }}
    />
  )
}

export default SmokeyBackground 