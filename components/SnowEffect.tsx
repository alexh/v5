'use client'

import React, { useEffect, useRef, useState } from 'react'

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
  const [moonPattern, setMoonPattern] = useState<number[][]>([])

  useEffect(() => {
    const loadMoonImage = async () => {
      try {
        const img = new Image()
        img.src = '/images/moon.png'
        
        console.log('Loading moon image...')
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            console.log('Image loaded:', { width: img.width, height: img.height })
            resolve(null)
          }
          img.onerror = reject
        })

        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, img.width, img.height)
        const { data } = imageData

        // Sample some pixels to understand the color range
        console.log('Sampling colors from different areas:')
        for (let y = 0; y < img.height; y += img.height/4) {
          for (let x = 0; x < img.width; x += img.width/4) {
            const i = (Math.floor(y) * img.width + Math.floor(x)) * 4
            console.log(`Color at (${Math.floor(x)},${Math.floor(y)}):`, {
              r: data[i],
              g: data[i+1],
              b: data[i+2],
              a: data[i+3]
            })
          }
        }

        const sampleRate = 2
        const pattern: number[][] = []
        let totalPixels = 0
        let moonPixels = 0
        
        const getBrightness = (r: number, g: number, b: number): number => {
            // Convert the color to a brightness value between 0 and 1
            // Using perceived brightness formula: (0.299*R + 0.587*G + 0.114*B)
            const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255
            
            // If it's close to background color, return 0
            const isBackground = 
                Math.abs(r - 116) < 30 && 
                Math.abs(g - 128) < 30 && 
                Math.abs(b - 209) < 30
            
            return isBackground ? 0 : brightness
        }

        for (let y = 0; y < img.height; y += sampleRate) {
            const row: number[] = []
            for (let x = 0; x < img.width; x += sampleRate) {
                const i = (y * img.width + x) * 4
                const r = data[i]
                const g = data[i + 1]
                const b = data[i + 2]

                totalPixels++
                const opacity = getBrightness(r, g, b)
                
                if (opacity > 0) {
                    moonPixels++
                }
                row.push(opacity)
            }
            pattern.push(row)
        }

        console.log('Pattern generation results:', {
          totalPixels,
          moonPixels,
          rows: pattern.length,
          cols: pattern[0]?.length,
          sampleRow: pattern[0]?.slice(0, 10)
        })

        if (moonPixels > 0) {
          console.log('Setting moon pattern with pixels:', moonPixels)
          console.log('About to set moon pattern:', {
            patternSize: {
                rows: pattern.length,
                cols: pattern[0]?.length
            },
            sampleRows: {
                first: pattern[0]?.slice(0, 10),
                middle: pattern[Math.floor(pattern.length/2)]?.slice(0, 10),
                last: pattern[pattern.length-1]?.slice(0, 10)
            }
          })
          setMoonPattern(pattern)
        } else {
          console.error('No moon pixels detected in the image')
          // For debugging, let's use a simple pattern
          const debugPattern = [
            [0,1,1,1,0],
            [1,1,1,1,1],
            [1,1,1,1,1],
            [1,1,1,1,1],
            [0,1,1,1,0]
          ]
          console.log('Using debug pattern instead')
          setMoonPattern(debugPattern)
        }
      } catch (error) {
        console.error('Error processing moon image:', error)
      }
    }

    loadMoonImage()
  }, [])

  const drawMoon = (ctx: CanvasRenderingContext2D) => {
    if (!moonPattern || moonPattern.length === 0) {
        console.log('No moon pattern available')
        return
    }

    const moonX = ctx.canvas.width - 400
    const moonY = 100
    const scale = 0.625

    let pixelsDrawn = 0
    let firstPixelPosition = null
    let lastPixelPosition = null

    moonPattern.forEach((row, i) => {
        row.forEach((opacity, j) => {
            if (opacity > 0) {
                pixelsDrawn++
                const x = moonX + j * scale
                const y = moonY + i * scale
                
                if (!firstPixelPosition) {
                    firstPixelPosition = { x, y, i, j }
                }
                lastPixelPosition = { x, y, i, j }

                ctx.fillStyle = `rgba(255, 250, 245, ${opacity})`
                ctx.fillRect(x, y, scale, scale)
            }
        })
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    console.log('Animation effect running, moonPattern length:', moonPattern.length)

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
    let isFirstFrame = true
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      if (isFirstFrame) {
          console.log('First animation frame:', {
              canvasWidth: canvas.width,
              canvasHeight: canvas.height,
              moonPatternExists: moonPattern.length > 0
          })
          isFirstFrame = false
      }
      
      // Only draw the moon if the pattern is available
      if (moonPattern.length > 0) {
          console.log('Attempting to draw moon with pattern size:', {
              rows: moonPattern.length,
              cols: moonPattern[0]?.length
          })
          drawMoon(ctx)
      } else {
          console.log('No moon pattern available for drawing')
      }
      
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
      snowflakes.current.forEach((flake, index) => {
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
  }, [moonPattern])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-75"
      style={{ mixBlendMode: 'screen' }}
    />
  )
} 