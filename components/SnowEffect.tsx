'use client'

import React, { useEffect, useRef } from 'react'

interface Snowflake {
  x: number
  y: number
  radius: number
  speed: number
  wind: number
}

interface ShootingStar {
  x: number
  y: number
  length: number
  speed: number
  angle: number
  progress: number
}

export default function SnowEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const snowflakes = useRef<Snowflake[]>([])
  const shootingStar = useRef<ShootingStar | null>(null)
  const windOffset = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    // Initialize snowflakes
    const createSnowflakes = () => {
      const flakeCount = Math.floor((canvas.width * canvas.height) / 10000)
      snowflakes.current = Array.from({ length: flakeCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        speed: Math.random() * 1 + 0.5,
        wind: Math.random() * 0.5 - 0.25
      }))
    }
    createSnowflakes()

    // Create a shooting star
    const createShootingStar = () => {
      const angle = 2 // Perfectly horizontal angle (0 degrees)
      shootingStar.current = {
        x: -50,
        y: Math.random() * (canvas.height / 2) + canvas.height / 4, // Random height in middle third
        length: 50,
        speed: 10, // Slower speed
        angle: angle,
        progress: 0
      }
    }

    // Schedule shooting stars
    const shootingStarInterval = setInterval(() => {
      createShootingStar()
    }, 30000) // Every 30 seconds

    const drawPixelStar = (x: number, y: number) => {
      // Star pixel art pattern (5x5)
      const starPattern = [
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [1, 1, 1, 1, 1],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0]
      ]
      
      const pixelSize = 2 // Size of each pixel in the star
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      
      starPattern.forEach((row, i) => {
        row.forEach((pixel, j) => {
          if (pixel) {
            ctx.fillRect(
              Math.round(x + j * pixelSize - (starPattern[0].length * pixelSize) / 2),
              Math.round(y + i * pixelSize - (starPattern.length * pixelSize) / 2),
              pixelSize,
              pixelSize
            )
          }
        })
      })
    }

    // Animation loop
    let animationFrameId: number
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Update wind
      windOffset.current += 0.002
      const globalWind = Math.sin(windOffset.current) * 1.5

      // Draw shooting star if active
      if (shootingStar.current) {
        const star = shootingStar.current
        
        // Update position
        star.x += Math.cos(star.angle) * star.speed
        star.y += Math.sin(star.angle) * star.speed
        star.progress += 0.01

        // Draw pixel star
        drawPixelStar(star.x, star.y)

        // Draw trail
        ctx.save()
        const trailLength = 8 // Number of trail particles
        for (let i = 0; i < trailLength; i++) {
          const trailX = star.x - Math.cos(star.angle) * (i * 6)
          const trailY = star.y - Math.sin(star.angle) * (i * 6)
          const opacity = (1 - i / trailLength) * 0.5
          
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
          ctx.fillRect(
            Math.round(trailX),
            Math.round(trailY),
            2,
            2
          )
        }
        ctx.restore()

        // Reset if completed
        if (star.x > canvas.width + 100 || star.y < -100) {
          shootingStar.current = null
        }
      }

      // Draw and update snowflakes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      snowflakes.current.forEach((flake) => {
        // Update position
        flake.y += flake.speed
        flake.x += flake.wind + globalWind

        // Reset if out of bounds
        if (flake.y > canvas.height) {
          flake.y = -5
          flake.x = Math.random() * canvas.width
        }
        if (flake.x > canvas.width) {
          flake.x = 0
        } else if (flake.x < 0) {
          flake.x = canvas.width
        }

        // Draw pixelated snowflake
        ctx.fillRect(
          Math.round(flake.x),
          Math.round(flake.y),
          Math.ceil(flake.radius),
          Math.ceil(flake.radius)
        )
      })

      animationFrameId = requestAnimationFrame(animate)
    }
    animate()

    // Trigger first shooting star after a short delay
    setTimeout(createShootingStar, 2000)

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
      cancelAnimationFrame(animationFrameId)
      clearInterval(shootingStarInterval)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-75"
      style={{ mixBlendMode: 'screen' }}
    />
  )
} 