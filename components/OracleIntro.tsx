'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion, useAnimate } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import Floating, { FloatingElement } from './Floating'
import Float from './Float'

// Vision type definition
type Vision = {
  id: string
  prompt: string
  url: string
  x: number
  y: number
  scale: number
  delay: number
  depth: number
  timestamp: number
  left: number
  top: number
  aspectRatio?: number
}

const VISION_LIFETIME = 15000 // Increased to 15 seconds
const VISION_FADE = 3000 // Increased fade time to 3 seconds
const MAX_VISIONS = 16 // More visions on screen
const VISION_INTERVAL = 1500 // Spawn slightly faster

const getRandomPosition = () => {
  // Padding from edges (in percentage)
  const padding = 15
  
  // Available space accounting for image size and padding
  const availableWidth = 100 - (padding * 2)
  const availableHeight = 100 - (padding * 2)
  
  // Create a grid with more sections
  const sections = 5 // 5x5 grid
  const sectionWidth = availableWidth / sections
  const sectionHeight = availableHeight / sections
  
  // Pick a random grid section
  const gridX = Math.floor(Math.random() * sections)
  const gridY = Math.floor(Math.random() * sections)
  
  // Add some random offset within the grid section
  const offsetX = (Math.random() - 0.5) * sectionWidth * 0.8 // 80% of section width
  const offsetY = (Math.random() - 0.5) * sectionHeight * 0.8 // 80% of section height
  
  // Calculate final position with padding
  const left = padding + (gridX * sectionWidth) + (sectionWidth/2) + offsetX
  const top = padding + (gridY * sectionHeight) + (sectionHeight/2) + offsetY
  
  // Ensure we stay within safe bounds
  return {
    left: Math.max(padding, Math.min(100 - padding, left)),
    top: Math.max(padding, Math.min(100 - padding, top))
  }
}

// Add HTMLImageElement to avoid confusion with Next.js Image
const createImage = (): HTMLImageElement => {
  return document.createElement('img')
}

// Add glow animation keyframes to tailwind config if not already there
// tailwind.config.js:
// theme: {
//   extend: {
//     keyframes: {
//       glow: {
//         '0%, 100%': { textShadow: '0 0 4px rgb(34,211,238, 0.5)' },
//         '50%': { textShadow: '0 0 16px rgb(34,211,238, 0.8)' }
//       }
//     },
//     animation: {
//       glow: 'glow 3s ease-in-out infinite'
//     }
//   }
// }

interface GlowingTextProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const GlowingText = ({ children, className = "", delay = 0 }: GlowingTextProps) => {
  const glowIntensity = useRef(Math.random() * 0.3 + 0.7)
  const glowDuration = useRef(2 + Math.random())

  return (
    <motion.span
      className={`inline-block ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay }}
      style={{
        textShadow: `0 0 8px rgba(255,255,255,${glowIntensity.current})`,
        animation: `glow ${glowDuration.current}s ease-in-out infinite`
      }}
    >
      {children}
    </motion.span>
  )
}

export default function OracleIntro() {
  const [visions, setVisions] = useState<Vision[]>([])
  const [_loading, setLoading] = useState(true)
  const [_animate] = useAnimate()
  const loadedImages = useRef(0)
  const jobsCache = useRef<Record<string, unknown>[]>([])

  // Preload jobs
  useEffect(() => {
    const loadAllJobs = async () => {
      try {
        const response = await fetch('/api/random-jobs?count=30')
        const data = await response.json()
        jobsCache.current = data
        addNewVision() // Add initial vision
      } catch (error) {
        console.error('Error loading visions:', error)
      }
    }

    loadAllJobs()
  }, [])

  const addNewVision = () => {
    if (jobsCache.current.length === 0) return

    const job = jobsCache.current.pop()
    const position = getRandomPosition()
    
    const img = createImage()
    img.src = `/midjourney/images/${job.id}.png`
    
    const newVision: Vision = {
      id: job.id,
      prompt: job.prompt,
      url: job.url,
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 20,
      scale: 0.8 + Math.random() * 0.4,
      delay: 0,
      depth: 0.5 + Math.random() * 2,
      timestamp: Date.now(),
      left: position.left,
      top: position.top
    }

    setVisions(prev => {
      const now = Date.now()
      // Keep more recent visions
      const filtered = prev
        .filter(v => now - v.timestamp < VISION_LIFETIME)
        .slice(-MAX_VISIONS + 1)
      return [...filtered, newVision]
    })

    img.onload = () => {
      const aspectRatio = img.width / img.height
      setVisions(prev => 
        prev.map(v => 
          v.id === newVision.id 
            ? { ...v, aspectRatio } 
            : v
        )
      )
    }
  }

  // Periodically add new visions
  useEffect(() => {
    const interval = setInterval(addNewVision, VISION_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  const handleImageLoad = () => {
    loadedImages.current += 1
    if (loadedImages.current >= 3) { // Show UI after first few images load
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden" ref={_animate}>
      {/* Mystical background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/30 via-zinc-900/20 to-black" />
      
      {/* Oracle text and button */}
      <motion.div 
        className="absolute inset-0 flex flex-col items-center justify-center text-center z-50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.88, delay: 0.5 }}
      >
        <motion.h1 
          className="text-6xl font-receipt-narrow text-white mb-4 tracking-[0.25em] uppercase"
          style={{
            fontFeatureSettings: "'calt' 1", // Enable contextual alternates
            fontVariantLigatures: 'contextual' // Enable contextual ligatures
          }}
        >
          {"THE ORACLE AWAITS".split('').map((char, i) => (
            <GlowingText key={i} delay={0.2 + (i * 0.05)}>
              {char === ' ' ? '\u00A0' : char}
            </GlowingText>
          ))}
        </motion.h1>

        <motion.p
          className="text-xl text-gray-300 max-w-md font-receipt-narrow mb-8 tracking-[0.15em] uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{
            textShadow: '0 0 8px rgba(255,255,255,0.3)',
            fontFeatureSettings: "'calt' 1",
            fontVariantLigatures: 'contextual'
          }}
        >
          Seek wisdom through the veil of time and space
        </motion.p>
        
        <Link 
          href="/oracle/vision"
          className="px-8 py-3 bg-white/10 text-white border border-white/50 
                   hover:bg-white/20 transition-colors duration-300 font-receipt-narrow
                   cursor-pointer z-50 tracking-[0.15em] uppercase"
          style={{
            textShadow: '0 0 8px rgba(255,255,255,0.3)',
            fontFeatureSettings: "'calt' 1",
            fontVariantLigatures: 'contextual'
          }}
        >
          ENTER THE ORACLE
        </Link>
      </motion.div>

      {/* Floating visions */}
      <Floating sensitivity={1} className="overflow-hidden">
        {visions.map((vision, index) => {
          const age = Date.now() - vision.timestamp
          const opacity = age < VISION_FADE 
            ? Math.pow(age / VISION_FADE, 0.5)
            : Math.pow(Math.max(0, 1 - ((age - (VISION_LIFETIME - VISION_FADE)) / VISION_FADE)), 0.5)

          const baseSize = 25
          
          let width = `${baseSize}vmin`
          let height = `${baseSize}vmin`
          
          if (vision.aspectRatio) {
            if (vision.aspectRatio > 1) {
              height = `${baseSize / vision.aspectRatio}vmin`
            } else {
              width = `${baseSize * vision.aspectRatio}vmin`
            }
          }

          return (
            <FloatingElement 
              key={vision.id} 
              depth={vision.depth}
              className="absolute"
              style={{
                left: `${vision.left}%`,
                top: `${vision.top}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <Float
                speed={0.3}
                amplitude={[5, 5, 5]}
                rotationRange={[3, 3, 2]}
                timeOffset={index * 123.45} // Random offset based on index
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity, 
                    scale: 1,
                    filter: `brightness(${0.8 + (opacity * 0.2)}) grayscale(0.5)`
                  }}
                  className="relative"
                  transition={{ duration: 0.5 }}
                >
                  <div 
                    className="relative rounded-lg overflow-hidden"
                    style={{ 
                      width,
                      height,
                      minWidth: '80px',
                    }}
                  >
                    <Image
                      src={`/midjourney/images/${vision.id}.png`}
                      alt={vision.prompt}
                      fill
                      className="object-cover hover:scale-105 duration-200 cursor-pointer transition-transform"
                      onLoad={handleImageLoad}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                </motion.div>
              </Float>
            </FloatingElement>
          )
        })}
      </Floating>

      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <div 
          className="w-full h-full animate-scanline bg-gradient-to-b from-transparent via-white/10 to-transparent" 
          style={{
            backgroundSize: '100% 4px',
            backgroundRepeat: 'repeat',
          }}
        />
      </div>
    </div>
  )
} 