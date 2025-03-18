'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface Particle {
  x: number
  y: number
  originX: number
  originY: number
  size: number
  color: string
  speedX: number
  speedY: number
  life: number
  maxLife: number
  initialX: number
  initialY: number
  arrivalTime: number
  arriving: boolean
  velocityX: number
  velocityY: number
  targetX: number
  targetY: number
  isDead?: boolean
}

interface MeltingParticle {
  x: number
  y: number
  size: number
  color: string
  speedX: number
  speedY: number
  opacity: number
  life: number
  maxLife: number
}

interface HologramImageProps {
  src: string
  alt: string
  enableMouseInteraction?: boolean
  onColorExtracted?: (color: string) => void
}

export default function HologramImage({ 
  src, 
  alt, 
  enableMouseInteraction = false,
  onColorExtracted
}: HologramImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const startTimeRef = useRef<number>(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showOriginal, setShowOriginal] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const meltingParticlesRef = useRef<MeltingParticle[]>([])
  const canStartMeltingRef = useRef(false)
  const _meltingCanvasRef = useRef<HTMLCanvasElement>(null)
  const _motion = motion
  
  const drawParticle = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    size: number, 
    color: string, 
    alpha: number
  ) => {
    ctx.globalAlpha = alpha
    ctx.fillStyle = color
    ctx.fillRect(x - size/2, y - size/2, size, size)
  }

  const drawGlow = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    size: number, 
    color: string, 
    alpha: number
  ) => {
    ctx.globalAlpha = alpha
    ctx.shadowColor = color
    ctx.shadowBlur = 3
    ctx.fillRect(x - size, y - size, size * 2, size * 2)
    ctx.shadowBlur = 0
  }

  const createParticlesFromImage = (
    ctx: CanvasRenderingContext2D, 
    image: HTMLImageElement,
    containerWidth: number,
    containerHeight: number
  ) => {
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return []

    // Calculate max height (60vh) and account for top padding
    const maxHeight = window.innerHeight * 0.6
    const topPadding = window.innerHeight * 0.05 // 5vh padding

    // Calculate image dimensions and position within container
    const imageAspect = image.width / image.height
    const containerAspect = containerWidth / containerHeight
    let finalImageWidth: number, finalImageHeight: number, finalImageX: number, finalImageY: number

    if (imageAspect > containerAspect) {
      // Image is wider than container
      finalImageWidth = containerWidth
      finalImageHeight = containerWidth / imageAspect
      if (finalImageHeight > maxHeight) {
        // Scale down if height exceeds max
        finalImageHeight = maxHeight
        finalImageWidth = maxHeight * imageAspect
      }
      finalImageX = containerRect.left + (containerWidth - finalImageWidth) / 2
      finalImageY = containerRect.top + topPadding // Add top padding
    } else {
      // Image is taller than container
      finalImageHeight = Math.min(containerHeight, maxHeight)
      finalImageWidth = finalImageHeight * imageAspect
      finalImageX = containerRect.left + (containerWidth - finalImageWidth) / 2
      finalImageY = containerRect.top + topPadding // Add top padding
    }

    // Create temporary canvas for sampling
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = finalImageWidth
    tempCanvas.height = finalImageHeight
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })
    if (!tempCtx) return []

    const sampleRate = 5
    const skipChance = 0.4
    const particles: Particle[] = []
    
    const scaleFactor = 0.5
    tempCanvas.width = finalImageWidth * scaleFactor
    tempCanvas.height = finalImageHeight * scaleFactor
    tempCtx.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height)
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
    const pixels = imageData.data?.map(Number) ?? []

    for(let y = 0; y < finalImageHeight; y += sampleRate) {
      for(let x = 0; x < finalImageWidth; x += sampleRate) {
        if (Math.random() < skipChance) continue

        const sX = Math.floor(x * scaleFactor)
        const sY = Math.floor(y * scaleFactor)
        const i = ((sY * Math.floor(tempCanvas.width)) + sX) * 4
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        const a = pixels[i + 3]
        
        if (a > 100 && (r + g + b) > 30) {
          // Calculate final position relative to the image position in the container
          const finalX = finalImageX + x
          const finalY = finalImageY + y

          // Generate starting position from screen edges
          let initialX, initialY
          const edge = Math.floor(Math.random() * 4)
          
          switch(edge) {
            case 0: // Top
              initialX = Math.random() * window.innerWidth
              initialY = -20
              break
            case 1: // Right
              initialX = window.innerWidth + 20
              initialY = Math.random() * window.innerHeight
              break
            case 2: // Bottom
              initialX = Math.random() * window.innerWidth
              initialY = window.innerHeight + 20
              break
            default: // Left
              initialX = -20
              initialY = Math.random() * window.innerHeight
          }

          particles.push({
            x: initialX,
            y: initialY,
            originX: finalX,
            originY: finalY,
            size: Math.random() * 1.2 + 0.8,
            color: `rgb(${r},${g},${b})`,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            life: 1,
            maxLife: 0.7 + Math.random() * 0.3,
            initialX,
            initialY,
            arrivalTime: Math.random() * 2000 + 1000,
            arriving: true,
            velocityX: 0,
            velocityY: 0,
            targetX: finalX,
            targetY: finalY,
          })
        }
      }
    }
    
    return particles
  }

  // Preload image and get data
  useEffect(() => {
    let mounted = true

    const loadImage = async () => {
      try {
        setImageLoaded(false)
        setShowOriginal(false)
        canStartMeltingRef.current = false
        particlesRef.current = []
        meltingParticlesRef.current = [] // Clear melting particles

        const img = new (Image as unknown as { new(width?: number, height?: number): HTMLImageElement })(0)
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            if (!mounted) return
            imageRef.current = img
            resolve()
          }
          img.onerror = reject
          img.src = src
        })

        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container || !mounted) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        startTimeRef.current = performance.now()
        particlesRef.current = createParticlesFromImage(ctx, img, container.clientWidth, container.clientHeight)
        
        if (mounted) {
          setImageLoaded(true)
          // Start fade-in after particles have time to arrive
          setTimeout(() => {
            if (mounted) {
              setShowOriginal(true)
              // Start melting effect immediately when image starts to fade in
            //   canStartMeltingRef.current = true // Start melting immediately
            }
          }, 3000)
        }
      } catch (error) {
        console.error('Error loading image:', error)
      }
    }

    loadImage()

    return () => {
      mounted = false
      particlesRef.current = []
      meltingParticlesRef.current = []
      canStartMeltingRef.current = false
    }
  }, [src])

  // Animation effect
  useEffect(() => {
    let animationFrame: number
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to window size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    // Animation loop
    const animate = (timestamp: number) => {
      if (!ctx) {
        animationFrame = requestAnimationFrame(animate)
        return
      }

      const elapsed = timestamp - startTimeRef.current
      const time = timestamp * 0.001

      // Clear with less opacity for better performance
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Batch similar operations
      ctx.shadowBlur = 3
      const particles = particlesRef.current
      const visibleParticles = particles.filter(p => {
        return p.x >= -50 && p.x <= canvas.width + 50 && 
               p.y >= -50 && p.y <= canvas.height + 50 &&
               !p.isDead
      })

      // Draw all base particles first
      for (const p of visibleParticles) {
        if (p.arriving && elapsed < p.arrivalTime) {
          const progress = elapsed / p.arrivalTime
          const easeProgress = progress < .5 
            ? 4 * progress * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2

          p.x = p.initialX + (p.originX - p.initialX) * easeProgress
          p.y = p.initialY + (p.originY - p.initialY) * easeProgress

          if (elapsed >= p.arrivalTime) {
            p.arriving = false
          }
        } else {
          // Enhanced wave motion with diagonal waves
          const waveX = 
            Math.sin(time * 0.5 + p.originY * 0.02) * 8 +
            Math.sin(time * 0.3 + p.originX * 0.01) * 4 +
            Math.cos(time * 0.7 + p.originY * 0.03) * 3 +
            Math.sin(time * 1.1 + (p.originX + p.originY) * 0.02) * 2 // Diagonal wave
          
          const waveY = 
            Math.cos(time * 0.5 + p.originX * 0.02) * 8 +
            Math.cos(time * 0.3 + p.originY * 0.01) * 4 +
            Math.sin(time * 0.7 + p.originX * 0.03) * 3 +
            Math.cos(time * 1.1 + (p.originX + p.originY) * 0.02) * 2 // Diagonal wave

          // Calculate target position with enhanced waves
          const targetX = p.originX + waveX
          const targetY = p.originY + waveY
          
          // Smoother movement to target
          p.x += (targetX - p.x) * 0.03
          p.y += (targetY - p.y) * 0.03

          if (enableMouseInteraction) {
            const mouseX = mousePosition.x * window.innerWidth
            const mouseY = mousePosition.y * window.innerHeight
            const distX = mouseX - p.x
            const distY = mouseY - p.y
            const dist = Math.sqrt(distX * distX + distY * distY)
            
            const interactionRadius = 200
            if (dist < interactionRadius) {
              const force = (1 - dist / interactionRadius) * 8
              const angle = Math.atan2(distY, distX)
              
              const repelX = -Math.cos(angle) * force
              const repelY = -Math.sin(angle) * force
              
              p.velocityX = p.velocityX * 0.9 + repelX * 0.4
              p.velocityY = p.velocityY * 0.9 + repelY * 0.4
            }
            
            p.x += p.velocityX
            p.y += p.velocityY
            
            const returnForceX = (p.targetX - p.x) * 0.05
            const returnForceY = (p.targetY - p.y) * 0.05
            
            p.velocityX += returnForceX
            p.velocityY += returnForceY
            
            p.velocityX *= 0.95
            p.velocityY *= 0.95
            
            if (Math.abs(p.velocityX) > 0.1 || Math.abs(p.velocityY) > 0.1) {
              ctx.globalAlpha = 0.1
              ctx.beginPath()
              ctx.moveTo(p.x, p.y)
              ctx.lineTo(p.x - p.velocityX * 2, p.y - p.velocityY * 2)
              ctx.strokeStyle = p.color
              ctx.stroke()
            }
          } else {
            p.velocityX *= 0.95
            p.velocityY *= 0.95
            p.x += p.velocityX
            p.y += p.velocityY
          }
        }

        const alpha = 0.95 + Math.sin(time + p.initialX) * 0.05
        drawParticle(ctx, p.x, p.y, p.size, p.color, alpha)
      }

      // Then draw all glows
      for (const p of visibleParticles) {
        drawGlow(ctx, p.x, p.y, p.size, p.color, 0.3)
      }

      // Optimize melting particles
      const meltingParticles = meltingParticlesRef.current
      if (canStartMeltingRef.current && meltingParticles.length < 24000) {
        const containerRect = containerRef.current?.getBoundingClientRect()
        const img = imageRef.current
        if (containerRect && img) {
          // Calculate max height (60vh) and account for top padding
          const maxHeight = window.innerHeight * 0.6
          const topPadding = window.innerHeight * 0.05 // 5vh padding
          
          // Calculate max height and constrained dimensions
          const imageAspect = img.width / img.height
          const containerAspect = containerRect.width / containerRect.height
          let imageWidth, imageHeight, _imageX, _imageY

          if (imageAspect > containerAspect) {
            imageWidth = containerRect.width
            imageHeight = containerRect.width / imageAspect
            if (imageHeight > maxHeight) {
              imageHeight = maxHeight
              imageWidth = maxHeight * imageAspect
            }
          } else {
            imageHeight = Math.min(containerRect.height, maxHeight)
            imageWidth = imageHeight * imageAspect
          }

          // Center the image
          const finalImageX = containerRect.left + (containerRect.width - imageWidth) / 2
          const finalImageY = containerRect.top + topPadding // Add top padding

          // Draw the image onto temp canvas with correct dimensions
          const tempCanvas = document.createElement('canvas')
          tempCanvas.width = imageWidth
          tempCanvas.height = imageHeight
          const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })
          if (!tempCtx) return

          tempCtx.drawImage(img, 0, 0, imageWidth, imageHeight)

          // Generate fewer particles per frame
          const particlesToAdd = Math.min(150, 24000 - meltingParticles.length)
          
          for (let i = 0; i < particlesToAdd; i++) {
            const edge = Math.floor(Math.random() * 4)
            let x = 0, y = 0, sampleX = 0, sampleY = 0
            let normalX = 0, normalY = 0
            
            const insetAmount = 5
            const edgeVariation = 15

            switch(edge) {
              case 0: // Top
                sampleX = Math.floor(Math.random() * imageWidth)
                sampleY = insetAmount + Math.random() * edgeVariation
                x = finalImageX + sampleX
                y = finalImageY + sampleY
                normalX = Math.random() * 0.4 - 0.2
                normalY = -1
                break
              case 1: // Right
                sampleX = imageWidth - 1 - (insetAmount + Math.random() * edgeVariation)
                sampleY = Math.floor(Math.random() * imageHeight)
                x = finalImageX + sampleX
                y = finalImageY + sampleY
                normalX = 1
                normalY = Math.random() * 0.4 - 0.2
                break
              case 2: // Bottom
                sampleX = Math.floor(Math.random() * imageWidth)
                sampleY = imageHeight - 1 - insetAmount
                x = finalImageX + sampleX
                y = finalImageY + sampleY
                normalX = 0
                normalY = 1
                break
              case 3: // Left
                sampleX = insetAmount
                sampleY = Math.floor(Math.random() * imageHeight)
                x = finalImageX + sampleX
                y = finalImageY + sampleY
                normalX = -1
                normalY = 0
                break
            }

            try {
              const pixel = tempCtx.getImageData(sampleX, sampleY, 1, 1).data
              const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`
              const baseSpeed = 4 + Math.random() * 1
              
              meltingParticles.push({
                x,
                y,
                size: 2.5 + Math.random() * 3,
                color,
                speedX: normalX * (baseSpeed + Math.random() * 2),
                speedY: normalY * (baseSpeed + Math.random() * 2),
                opacity: 1,
                life: 100 + Math.random() * 50,
                maxLife: 100 + Math.random() * 50
              })
            } catch (error) {
              console.error('Error sampling pixel:', error)
              continue
            }
          }
        }
      }

      // Batch melting particle operations
      ctx.shadowBlur = 12
      const visibleMeltingParticles = meltingParticles.filter(p => {
        return p.x >= -50 && p.x <= canvas.width + 50 && 
               p.y >= -50 && p.y <= canvas.height + 50
      })

      // Update positions first
      for (const p of visibleMeltingParticles) {
        p.x += p.speedX
        p.y += p.speedY
        p.life -= 16.67
      }

      // Then draw all base shapes
      for (const p of visibleMeltingParticles) {
        if (p.life <= 0) continue
        const lifeRatio = p.life / p.maxLife
        const angle = Math.atan2(p.speedY, p.speedX)
        
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(angle)
        const rgbValues = p.color.match(/\d+/g)?.map(Number) ?? [255, 255, 255]
        ctx.fillStyle = `rgba(${rgbValues},${Math.min(1, p.opacity * lifeRatio * 1.5)})`
        ctx.fillRect(-p.size/2, -p.size/4, p.size * 2, p.size/1.5)
        ctx.restore()
      }

      // Then draw all glows with enhanced effects
      ctx.shadowBlur = 12
      for (const p of visibleMeltingParticles) {
        if (p.life <= 0) continue
        const lifeRatio = p.life / p.maxLife
        const angle = Math.atan2(p.speedY, p.speedX)
        
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(angle)
        ctx.globalAlpha = Math.min(1, 0.8 * lifeRatio)
        ctx.shadowColor = p.color
        ctx.fillRect(-p.size * 1.2, -p.size/1.5, p.size * 2.4, p.size * 1.2)
        
        // Add second glow layer for more intensity
        ctx.globalAlpha = Math.min(1, 0.4 * lifeRatio)
        ctx.shadowBlur = 20
        ctx.fillRect(-p.size * 1.5, -p.size/1.2, p.size * 3, p.size * 1.5)
        ctx.restore()
      }

      // Clean up dead particles periodically instead of every frame
      if (timestamp % 60 < 16.67) { // Clean up roughly once per second
        meltingParticlesRef.current = meltingParticles.filter(p => p.life > 0)
      }

      ctx.globalAlpha = 1
      animationFrame = requestAnimationFrame(animate)
    }

    animate(performance.now())

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
      cancelAnimationFrame(animationFrame)
    }
  }, [src, enableMouseInteraction, mousePosition.x, mousePosition.y])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    if (showOriginal) {
      // Increase delay to 500ms before despawning
      setTimeout(() => {
        particlesRef.current = particlesRef.current.filter(() => Math.random() > 0.5)
      }, 500)
    }
  }, [showOriginal])

  const extractAverageColor = (img: HTMLImageElement) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return '#FF671F'
    
    // Scale down for performance
    canvas.width = 50
    canvas.height = 50
    ctx.drawImage(img, 0, 0, 50, 50)
    
    const imageData = ctx.getImageData(0, 0, 50, 50)
    const data = imageData.data
    
    let r = 0, g = 0, b = 0, count = 0
    
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
      if (brightness > 20) { // Skip very dark pixels
        r += data[i]
        g += data[i + 1]
        b += data[i + 2]
        count++
      }
    }
    
    if (count === 0) return '#FF671F'
    
    r = Math.round(r / count)
    g = Math.round(g / count)
    b = Math.round(b / count)
    
    // Increase saturation
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const d = max - min
    const s = max === 0 ? 0 : d / max
    const boost = Math.min(1.5, 1 + (1 - s))
    
    r = Math.min(255, Math.round((r - min) * boost + min))
    g = Math.min(255, Math.round((g - min) * boost + min))
    b = Math.min(255, Math.round((b - min) * boost + min))
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const container = containerRef.current
    if (container && e.target instanceof HTMLImageElement) {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d', { willReadFrequently: true })
      if (ctx && canvas && container) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        particlesRef.current = createParticlesFromImage(
          ctx, 
          e.target, 
          container.clientWidth, 
          container.clientHeight
        )
      }
      
      // Extract and pass up the color
      const color = extractAverageColor(e.target)
      onColorExtracted?.(color)
    }
  }

  useEffect(() => {
    // Disable dragging on all images
    const images = document.querySelectorAll('img')
    images.forEach(img => {
      img.draggable = false
    })
  }, [])

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-black"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="relative w-full">
        {/* Hidden preload image */}
        <Image
          src={src}
          alt="Hologram image"
          width={500}
          height={300}
          className="w-full h-auto opacity-0"
          onLoad={handleImageLoad}
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
        />

        {/* Base image layer with max height constraint */}
        {imageLoaded && (
          <div 
            className="absolute inset-0 flex items-start justify-center pt-[5vh]"
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="relative w-full max-h-[60vh]">
              <Image
                src={src}
                alt={alt}
                className={`w-full h-auto max-h-[60vh] object-contain transition-opacity duration-[3000ms] mix-blend-lighten ${
                  showOriginal ? 'opacity-70' : 'opacity-0'
                }`}
                style={{ 
                  filter: 'blur(0.5px)'
                }}
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
              />
            </div>
          </div>
        )}
        
        {/* Main particle canvas stays fullscreen */}
        <canvas
          ref={canvasRef}
          className="fixed top-0 left-0 w-screen h-screen pointer-events-none transition-opacity duration-[3000ms]"
          style={{ 
            zIndex: 1,
            mixBlendMode: 'screen'
          }}
        />

        {/* Melting particles canvas - separate layer */}
        {/* <canvas
          ref={meltingCanvasRef}
          className="fixed top-0 left-0 w-screen h-screen pointer-events-none"
          style={{ 
            zIndex: 2,
            mixBlendMode: 'screen'
          }}
        /> */}
        
        {/* Subtle ethereal glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-10 pointer-events-none mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-10 pointer-events-none mix-blend-overlay" />
      </div>
    </div>
  )
} 