import React, { useRef, useEffect, useState } from 'react'
import { motion, useAnimationFrame } from "framer-motion"
import { useMousePositionRef } from '../hooks/use-mouse-position-ref'
import { useTheme } from '../contexts/ThemeContext'

interface Particle {
  x: number
  y: number
  targetX: number
  targetY: number
  baseX: number
  baseY: number
  size: number
  color: string
  initialX: number
  initialY: number
  phase: number
}

interface ParticleTextProps {
  text: string
  className?: string
  containerRef: React.RefObject<HTMLDivElement>
  fromFontVariationSettings: string
  toFontVariationSettings: string
  radius?: number
  falloff?: "linear" | "exponential" | "gaussian"
}

const ParticleText: React.FC<ParticleTextProps> = ({
  text,
  className = "",
  containerRef,
  fromFontVariationSettings,
  toFontVariationSettings,
  radius = 150,
  falloff = "exponential"
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mousePositionRef = useMousePositionRef(containerRef)
  const timeRef = useRef(0)
  const { currentTheme } = useTheme()
  const [fontLoaded, setFontLoaded] = useState(false)

  useEffect(() => {
    // Wait for font to load
    document.fonts.ready.then(() => {
      // Add additional delay to ensure font is rendered
      setTimeout(() => {
        setFontLoaded(true)
      }, 500)
    })
  }, [])

  useEffect(() => {
    if (!fontLoaded) return

    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = 800
    canvas.height = 100

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const fontSize = 60
    ctx.font = `bold ${fontSize}px "forma-djr-banner"`
    ctx.fillStyle = currentTheme.text
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    
    const particles: Particle[] = []
    const gridSize = 4
    
    for (let y = 0; y < canvas.height; y += gridSize) {
      for (let x = 0; x < canvas.width; x += gridSize) {
        let hasPixel = false
        const sampleSize = 2
        
        for (let sy = 0; sy < sampleSize; sy++) {
          for (let sx = 0; sx < sampleSize; sx++) {
            const sampleX = x + sx
            const sampleY = y + sy
            if (sampleX < canvas.width && sampleY < canvas.height) {
              const alpha = imageData.data[((sampleY * canvas.width + sampleX) * 4) + 3]
              if (alpha > 128) {
                hasPixel = true
                break
              }
            }
          }
          if (hasPixel) break
        }

        if (hasPixel) {
          particles.push({
            x,
            y,
            targetX: x,
            targetY: y,
            baseX: x,
            baseY: y,
            size: 2,
            color: currentTheme.text,
            initialX: x,
            initialY: y,
            phase: Math.random() * Math.PI * 2
          })
        }
      }
    }
    particlesRef.current = particles
  }, [text, currentTheme, fontLoaded])

  useAnimationFrame(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    timeRef.current += 0.01

    particlesRef.current.forEach(particle => {
      const waveAmplitude = 6.0
      const waveLength = canvas.width / 2
      const waveProgress = (particle.initialX / waveLength) - (timeRef.current / 2)
      
      const verticalOffset = Math.sin(waveProgress * Math.PI * 2) * waveAmplitude
      
      particle.baseX = particle.initialX
      particle.baseY = particle.initialY + verticalOffset

      const distance = Math.sqrt(
        Math.pow(mousePositionRef.current.x - particle.x, 2) +
        Math.pow(mousePositionRef.current.y - particle.y, 2)
      )

      if (distance < radius) {
        const force = (1 - distance / radius) * 5
        particle.targetX = particle.baseX + (particle.x - mousePositionRef.current.x) * force
        particle.targetY = particle.baseY + (particle.y - mousePositionRef.current.y) * force
      } else {
        particle.targetX = particle.baseX
        particle.targetY = particle.baseY
      }

      particle.x += (particle.targetX - particle.x) * 0.15
      particle.y += (particle.targetY - particle.y) * 0.15

      ctx.fillStyle = particle.color
      ctx.fillRect(particle.x, particle.y, particle.size * 1.5, particle.size * 1.5)
    })
  })

  if (!fontLoaded) {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ mixBlendMode: 'screen' }}
    />
  )
}

export default ParticleText 