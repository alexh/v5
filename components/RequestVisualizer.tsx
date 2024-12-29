'use client'

import React, { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  progress: number
  speed: number
  curve: number
  size: number
  opacity: number
  trail: Array<{ x: number, y: number }>
  returning: boolean
  completed: boolean
}

interface RequestVisualizerProps {
  isLoading: boolean
  onComplete?: () => void
}

interface StatusPing {
  progress: number
  direction: 'up' | 'down'
  speed: number
  trail: Array<{ x: number, y: number }>
}

interface ProdRequest {
  x: number
  y: number
  progress: number
  speed: number
  curve: number
  size: number
  opacity: number
  trail: Array<{ x: number, y: number }>
  entryPoint: number // Random x position where request enters from top
  completed: boolean
}

export default function RequestVisualizer({ isLoading, onComplete }: RequestVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const completedRef = useRef(false)
  const isAnimatingRef = useRef(false)
  const pulseRef = useRef(0)
  const statusPingRef = useRef<StatusPing>({
    progress: 0,
    direction: 'up',
    speed: 0.01,
    trail: []
  })
  const serverHealthyRef = useRef(false)
  const serverPulseRef = useRef(0)
  const prodRequestsRef = useRef<ProdRequest[]>([])

  // Constants for node positions
  const TOP_NODE_Y = 120  // Changed from 200
  const BOTTOM_NODE_Y = 520 // Changed from 600

  // Move drawing functions outside effects so they're accessible everywhere
  const drawNodeGlow = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    intensity: number,
    pulse: number
  ) => {
    ctx.save()
    // Make pulse effect more pronounced
    const pulseIntensity = intensity * (1 + Math.sin(pulse) * 0.5)
    ctx.shadowColor = color
    ctx.shadowBlur = 25 * pulseIntensity
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.roundRect(x - width/2, y - height/2, width, height, 4)
    ctx.fill()
    ctx.restore()
  }

  const drawNode = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    label: string, 
    isTop: boolean,
    pulse: number
  ) => {
    const width = 180
    const height = 36

    // Draw glow layers with pulse
    if (isTop) {
      drawNodeGlow(ctx, x, y, width, height, '#ffffff', 0.3, pulse)
      drawNodeGlow(ctx, x, y, width, height, '#ffffff', 0.2, pulse)
    } else {
      drawNodeGlow(ctx, x, y, width, height, '#ffffff', 0.4, pulse)
      drawNodeGlow(ctx, x, y, width, height, '#ffffff', 0.3, pulse)
    }

    // Draw main rectangle with gradient
    const gradient = ctx.createLinearGradient(
      x - width/2, y, x + width/2, y
    )
    
    if (isTop) {
      gradient.addColorStop(0, '#1a1a1a')
      gradient.addColorStop(1, '#000000')
    } else {
      gradient.addColorStop(0, '#ffffff')
      gradient.addColorStop(1, '#f0f0f0')
    }

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.roundRect(x - width/2, y - height/2, width, height, 4)
    ctx.fill()

    // Add subtle border with glow
    ctx.strokeStyle = isTop ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.2)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw text with enhanced contrast
    ctx.font = '13px receipt-narrow, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    if (isTop) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'
    }
    
    ctx.fillText(label, x, y)
  }

  const drawConnectingLine = (
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) => {
    ctx.save()
    ctx.setLineDash([5, 5])
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)'
    ctx.lineWidth = 1
    
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
    ctx.stroke()
    
    ctx.restore()
  }

  const calculatePoint = (progress: number, curve: number, returning: boolean) => {
    const startY = returning ? TOP_NODE_Y : BOTTOM_NODE_Y
    const endY = returning ? BOTTOM_NODE_Y : TOP_NODE_Y
    const y = startY + (endY - startY) * progress
    const x = 90 + Math.sin(progress * Math.PI) * (returning ? -curve : curve)
    return { x, y }
  }

  const drawStatusPing = (
    ctx: CanvasRenderingContext2D,
    ping: StatusPing
  ) => {
    const y = ping.direction === 'up' 
      ? BOTTOM_NODE_Y + (TOP_NODE_Y - BOTTOM_NODE_Y) * ping.progress
      : TOP_NODE_Y + (BOTTOM_NODE_Y - TOP_NODE_Y) * ping.progress
    const x = 90

    // Update trail
    ping.trail.push({ x, y })
    if (ping.trail.length > 8) {
      ping.trail.shift()
    }

    // Draw trail
    if (ping.trail.length > 1) {
      ctx.beginPath()
      ping.trail.forEach((point, i) => {
        const alpha = (i / ping.trail.length) * 0.5
        ctx.strokeStyle = `rgba(100, 255, 100, ${alpha})`
        ctx.lineWidth = 2 * (i / ping.trail.length)
        
        if (i === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      })
      ctx.stroke()
    }

    // Draw ping ball with enhanced glow
    ctx.save()
    ctx.shadowColor = 'rgba(100, 255, 100, 0.8)'
    ctx.shadowBlur = 10
    ctx.fillStyle = '#4ade80'
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  const drawServerHealth = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    isHealthy: boolean,
    pulse: number
  ) => {
    if (isHealthy) {
      // Draw pulsing green glow around top node
      ctx.save()
      const intensity = 0.3 + Math.sin(pulse) * 0.2
      ctx.shadowColor = '#4ade80'
      ctx.shadowBlur = 20 * intensity
      ctx.strokeStyle = '#4ade80'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(x - 90, y - 18, 180, 36, 4)
      ctx.stroke()
      ctx.restore()
    }
  }

  // Add function to generate random prod requests
  const generateProdRequest = () => ({
    x: Math.random() * 300, // Random entry point across width
    y: -20, // Start above canvas
    progress: 0,
    speed: 0.2 + Math.random() * 0.3,
    curve: 150 + Math.random() * 100,
    size: 1.2 + Math.random() * 1,
    opacity: 0.6 + Math.random() * 0.4,
    trail: [],
    entryPoint: Math.random() * 300,
    completed: false
  })

  const calculateProdPoint = (progress: number, entryPoint: number, curve: number) => {
    const targetX = 90
    const targetY = TOP_NODE_Y
    
    const x = entryPoint + (targetX - entryPoint) * progress
    const y = 0 + targetY * progress - Math.sin(progress * Math.PI) * curve
    
    return { x, y }
  }

  const drawProdRequest = (
    ctx: CanvasRenderingContext2D,
    request: ProdRequest
  ) => {
    // Draw trail with orange color
    if (request.trail.length > 1) {
      ctx.beginPath()
      request.trail.forEach((p, i) => {
        const alpha = (i / request.trail.length) * request.opacity
        ctx.strokeStyle = `rgba(255, 165, 0, ${alpha})`
        ctx.lineWidth = request.size * 0.8
        if (i === 0) {
          ctx.moveTo(p.x, p.y)
        } else {
          ctx.lineTo(p.x, p.y)
        }
      })
      ctx.stroke()
    }

    // Draw particle with orange glow
    ctx.save()
    ctx.shadowColor = 'rgba(255, 165, 0, 0.8)'
    ctx.shadowBlur = request.size * 4
    ctx.fillStyle = '#ffa500'
    ctx.beginPath()
    ctx.arc(request.x, request.y, request.size * 0.8, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // Separate function to render static elements
  const renderStatic = (ctx: CanvasRenderingContext2D, pulse: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    
    // Draw connecting line between fixed positions
    drawConnectingLine(ctx, 90, TOP_NODE_Y, 90, BOTTOM_NODE_Y)
    
    // Draw server health status
    drawServerHealth(ctx, 90, TOP_NODE_Y, serverHealthyRef.current, serverPulseRef.current)
    
    // Draw prod requests
    prodRequestsRef.current.forEach(request => {
      if (!request.completed) {
        drawProdRequest(ctx, request)
      }
    })
    
    // Draw nodes at fixed positions
    drawNode(ctx, 90, BOTTOM_NODE_Y, 'alexhaynes.org', false, pulse)
    drawNode(ctx, 90, TOP_NODE_Y, 'api.materials.nyc', true, pulse)
    
    // Draw status ping
    drawStatusPing(ctx, statusPingRef.current)
  }

  // Effect for static elements and status ping animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set fixed canvas size
    const CANVAS_HEIGHT = 800 // Fixed canvas height
    
    const dpr = window.devicePixelRatio || 1
    canvas.width = 300 * dpr
    canvas.height = CANVAS_HEIGHT * dpr
    
    ctx.scale(dpr, dpr)
    ctx.imageSmoothingEnabled = false

    let animationFrameId: number

    const animate = () => {
      pulseRef.current += 0.03
      serverPulseRef.current += 0.05

      // Update status ping position
      const ping = statusPingRef.current
      ping.progress += ping.speed

      if (ping.progress >= 1) {
        if (ping.direction === 'up') {
          // Reached server, trigger health status
          serverHealthyRef.current = true
          setTimeout(() => {
            serverHealthyRef.current = false
          }, 1000)
        }
        ping.progress = 0
        ping.direction = ping.direction === 'up' ? 'down' : 'up'
      }

      // Update prod requests
      prodRequestsRef.current.forEach(request => {
        if (!request.completed) {
          request.progress += request.speed / 100
          const point = calculateProdPoint(request.progress, request.entryPoint, request.curve)
          request.x = point.x
          request.y = point.y

          request.trail.push({ x: point.x, y: point.y })
          if (request.trail.length > 10) request.trail.shift()

          if (request.progress >= 1) {
            request.completed = true
          }
        }
      })

      // Randomly add new prod requests
      if (Math.random() < 0.02) { // Adjust frequency as needed
        prodRequestsRef.current.push(generateProdRequest())
      }

      // Clean up completed requests
      prodRequestsRef.current = prodRequestsRef.current.filter(r => 
        !r.completed || r.trail.length > 0
      )

      renderStatic(ctx, pulseRef.current)
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.height = 800 * dpr
      ctx.scale(dpr, dpr)
      ctx.imageSmoothingEnabled = false
      renderStatic(ctx, pulseRef.current)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  // Animation effect
  useEffect(() => {
    if (isLoading && !isAnimatingRef.current) {
      isAnimatingRef.current = true
      completedRef.current = false
      particlesRef.current = Array.from({ length: 15 }, () => ({
        x: 50,
        y: BOTTOM_NODE_Y,
        progress: 0,
        speed: 0.3 + Math.random() * 0.45,
        curve: (Math.random() - 0.5) * 150,
        size: 1.5 + Math.random() * 1.5,
        opacity: 0.7 + Math.random() * 0.3,
        trail: [],
        returning: false,
        completed: false
      }))
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      if (!ctx || !canvas) return

      // Clear and redraw everything
      renderStatic(ctx, pulseRef.current)

      // Draw particles only when loading
      if (isLoading) {
        particlesRef.current.forEach(particle => {
          if (particle.completed) return

          if (particle.progress < 1) {
            particle.progress += particle.speed / 67

            const point = calculatePoint(particle.progress, particle.curve, particle.returning)
            particle.x = point.x
            particle.y = point.y

            particle.trail.push({ x: point.x, y: point.y })
            if (particle.trail.length > 12) particle.trail.shift()

            // Draw enhanced trail
            if (particle.trail.length > 1) {
              ctx.beginPath()
              particle.trail.forEach((p, i) => {
                const alpha = (i / particle.trail.length) * particle.opacity
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.7})`
                ctx.lineWidth = particle.size * 0.8
                if (i === 0) {
                  ctx.moveTo(p.x, p.y)
                } else {
                  ctx.lineTo(p.x, p.y)
                }
              })
              ctx.stroke()
            }

            // Enhanced particle glow
            const glowSize = particle.size * 4
            ctx.save()
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)'
            ctx.shadowBlur = glowSize
            
            // Draw particle core
            ctx.fillStyle = '#ffffff'
            ctx.beginPath()
            ctx.arc(point.x, point.y, particle.size * 0.8, 0, Math.PI * 2)
            ctx.fill()
            
            ctx.restore()
          } else if (!particle.returning) {
            particle.returning = true
            particle.progress = 0
            particle.trail = []
          } else {
            particle.completed = true
          }
        })

        const allCompleted = particlesRef.current.every(p => p.completed)

        if (!allCompleted) {
          animationRef.current = requestAnimationFrame(draw)
        } else if (!completedRef.current) {
          completedRef.current = true
          isAnimatingRef.current = false
          if (onComplete) {
            onComplete()
          }
        }
      }
    }

    if (isLoading) {
      draw()
    } else {
      isAnimatingRef.current = false
      renderStatic(ctx, pulseRef.current)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isLoading, onComplete])

  return (
    <div className="absolute left-32 top-[-40px] w-[300px] h-[800px]">
      <canvas 
        ref={canvasRef}
        className="pointer-events-none"
        style={{ 
          imageRendering: 'pixelated',
          width: '300px',
          height: '800px',
          transform: 'translate3d(0,0,0)',
        }}
      />
    </div>
  )
} 