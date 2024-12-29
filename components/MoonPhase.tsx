'use client'

import React, { useEffect, useRef, useState } from 'react'

interface Particle {
  x: number
  y: number
  targetX: number
  targetY: number
  size: number
  opacity: number
  color: string
}

export default function MoonPhase() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const [currentFrame, setCurrentFrame] = useState(0)
  const frameDataRef = useRef<ImageData[]>([])
  const animationFrameId = useRef<number>()
  const loadedRef = useRef(false)
  const [currentTime, setCurrentTime] = useState('')
  
  const TOTAL_FRAMES = 22
  const FRAME_DURATION = 3000
  const MOON_SIZE = 96
  const PARTICLE_DENSITY = 3
  const TRANSITION_SPEED = 0.05
  const PARTICLE_SIZE = 3
  const INITIAL_SCATTER = 60
  const FADE_SPEED = 0.03

  const getRGBA = (data: Uint8ClampedArray, i: number) => {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    return {
      color: `rgb(${r}, ${g}, ${b})`,
      opacity: a / 255
    }
  }

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true

    const canvas = canvasRef.current
    if (!canvas) return
    
    canvas.width = MOON_SIZE
    canvas.height = MOON_SIZE
    
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const createParticlesForFrame = (frameData: ImageData) => {
      const particles: Particle[] = []
      const { data } = frameData
      
      for (let y = 0; y < MOON_SIZE; y += PARTICLE_DENSITY) {
        for (let x = 0; x < MOON_SIZE; x += PARTICLE_DENSITY) {
          const i = (y * MOON_SIZE + x) * 4
          const { color, opacity } = getRGBA(data, i)
          
          if (opacity > 0.4) {
            particles.push({
              x: x + (Math.random() - 0.5) * INITIAL_SCATTER,
              y: y + (Math.random() - 0.5) * INITIAL_SCATTER,
              targetX: x,
              targetY: y,
              size: PARTICLE_SIZE,
              opacity: 0, // Start invisible
              color
            })
          }
        }
      }
      
      return particles
    }

    const animate = () => {
      if (!ctx || !frameDataRef.current.length) {
        animationFrameId.current = requestAnimationFrame(animate)
        return
      }
      
      ctx.clearRect(0, 0, MOON_SIZE, MOON_SIZE)
      ctx.imageSmoothingEnabled = false  // Ensure crisp pixels
      
      const particles = particlesRef.current
      
      particles.forEach((particle) => {
        // Move towards target
        particle.x += (particle.targetX - particle.x) * TRANSITION_SPEED
        particle.y += (particle.targetY - particle.y) * TRANSITION_SPEED
        
        // Fade in more slowly
        particle.opacity = Math.min(particle.opacity + FADE_SPEED, 1)
        
        // Draw perfect square pixels
        ctx.globalAlpha = particle.opacity
        ctx.fillStyle = particle.color
        ctx.fillRect(
          Math.floor(particle.x),  // Use floor instead of round
          Math.floor(particle.y),  // Use floor instead of round
          particle.size,
          particle.size
        )
      })
      
      animationFrameId.current = requestAnimationFrame(animate)
    }

    const loadFrames = async () => {
      const frames: ImageData[] = []
      
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        const img = new Image()
        img.src = `/images/moonphases/frame${i}.png`
        
        await new Promise<void>((resolve) => {
          img.onload = () => {
            const tempCanvas = document.createElement('canvas')
            tempCanvas.width = MOON_SIZE
            tempCanvas.height = MOON_SIZE
            const tempCtx = tempCanvas.getContext('2d')
            if (!tempCtx) {
              resolve()
              return
            }

            tempCtx.drawImage(img, 0, 0, MOON_SIZE, MOON_SIZE)
            frames[i] = tempCtx.getImageData(0, 0, MOON_SIZE, MOON_SIZE)
            resolve()
          }
          img.onerror = () => resolve()
        })
      }
      
      frameDataRef.current = frames
      particlesRef.current = createParticlesForFrame(frames[0])
      animate()
      
      // Start frame transitions
      setInterval(() => {
        setCurrentFrame(prev => {
          const nextFrame = (prev + 1) % TOTAL_FRAMES
          if (frameDataRef.current[nextFrame]) {
            particlesRef.current = createParticlesForFrame(frameDataRef.current[nextFrame])
          }
          return nextFrame
        })
      }, FRAME_DURATION)
    }

    loadFrames()

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [])

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }))
    }
    
    updateTime() // Initial update
    const interval = setInterval(updateTime, 1000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed top-12 right-12 z-[15] flex flex-col items-center hidden md:flex">
      <div 
        className="relative w-24 h-24 animate-pulse-glow mb-2"
        style={{
          filter: 'drop-shadow(0 0 15px rgba(255, 245, 224, 0.5))',
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ 
            imageRendering: 'pixelated'
          }}
        />
      </div>
      <div className="font-receipt-narrow text-lg text-theme-text">
        {currentTime}
      </div>
    </div>
  )
} 