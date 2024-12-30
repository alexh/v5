'use client'

import React, { useRef, useEffect, useState } from 'react'
import { ThemeSelector } from '../components/ThemeSelector'
import { InlineThemeSelector } from '../components/InlineThemeSelector'
import { useTheme } from '../contexts/ThemeContext'
import SmokeyBackground from '../components/SmokeyBackground'
import SnowEffect from '../components/SnowEffect'
import CrtGrid from '../components/CrtGrid'
import MoonPhase from '../components/MoonPhase'
import ElevenLabsWidget from '../components/ElevenLabsWidget'
import ScrambleIn from '../components/ScrambleIn'
import { ScrambleInHandle } from '../components/ScrambleIn'
import ParticleText from '../components/ParticleText'
import Link from 'next/link'

export default function Home() {
  const _currentTheme = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const scrambleRefs = useRef<(ScrambleInHandle | null)[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const paragraphs = [
    "I am a software engineer living in New York City, USA.",
    `As a Senior Full Stack Engineer at <a href="https://seek.ai" class="underline hover:text-theme-secondary transition-colors pointer-events-auto">Seek AI</a>, I build features end-to-end across the entire stack. My work spans from crafting intuitive front-end experiences to designing robust backend systems and implementing sophisticated prompt engineering solutions. I specialize in developing distributed systems and handling complex async job processing pipelines. Prior to Seek, I spent four years at Two Sigma Insurance Quantified, where I gained valuable experience in enterprise software development.`,
    `Outside of work, I make full use of my down time - whether skiing, exploring new places, spending time with my dog, <a href="https://www.instagram.com/bolognaboynyc" class="underline hover:text-theme-secondary transition-colors pointer-events-auto cursor-pointer">Bologna</a>, or building and designing for my clothing brand, <a href="https://utility.materials.nyc" class="underline hover:text-theme-secondary transition-colors pointer-events-auto cursor-pointer">Utility Materials, Inc.</a> Additionally, I'm developing a rogue-like platform fighting game.`
  ]

  useEffect(() => {
    // First check if the font is already loaded
    const checkFont = async () => {
      try {
        // Try to load the font if it's not already available
        const font = new FontFace(
          'forma-djr-banner',
          'url(/fonts/forma-djr-banner.woff2)'
        )

        // Wait for the font to load
        await font.load()
        
        // Add it to the document fonts
        document.fonts.add(font)
      } catch (err) {
        console.log('Font already loaded or error loading:', err)
      }

      // Wait for all fonts to be ready
      await document.fonts.ready

      // Add a small delay to ensure everything is rendered properly
      setTimeout(() => {
        setIsLoading(false)
        // Start the scramble effect after loading
        setTimeout(() => {
          scrambleRefs.current[0]?.start()
        }, 100)
      }, 500)
    }

    checkFont()
  }, [])

  if (isLoading) {
    return (
      <main className="h-screen overflow-hidden p-[5%] font-receipt-narrow text-theme-text bg-theme-primary relative">
        <CrtGrid />
        <div className="absolute inset-0 z-10">
          <SmokeyBackground targetSelector=".loading-text" zIndex={1} />
        </div>
        <div className="h-full flex items-center justify-center relative z-20">
          <div className="text-4xl loading-text">
            Loading...
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="h-screen overflow-hidden p-[5%] font-receipt-narrow text-theme-text bg-theme-primary relative" ref={containerRef}>
      <CrtGrid />
      <SnowEffect />
      
      <div className="hidden md:block">
        <MoonPhase />
      </div>

      <div className="hidden md:block">
        <ThemeSelector initialPosition={{ x: 32, y: 32 }} />
      </div>

      <ElevenLabsWidget />

      <div className="h-full max-w-3xl mx-auto relative z-20">
        <div className="h-full flex flex-col">
          <div className="pt-8 flex justify-center z-30 relative">
            <ParticleText
              text="Alex Haynes"
              className="text-6xl font-extrabold text-center tracking-[.02em] text-theme-text font-['forma-djr-banner'] whitespace-nowrap"
              fromFontVariationSettings="'wght' 400"
              toFontVariationSettings="'wght' 900"
              radius={150}
              falloff="exponential"
              containerRef={containerRef}
            />
          </div>
          
          <h2 className="text-3xl text-center font-forma text-theme-text z-30 relative mb-4">
            Software Engineer | Creative
          </h2>

          <div className="flex flex-wrap justify-center items-center gap-4 mb-8 z-30 relative">
            <Link href="/oracle" className="hover:scale-105 transition-transform pointer-events-auto cursor-pointer">
              <button className="font-receipt-narrow text-lg px-4 py-2 rounded-lg">Oracle</button>
            </Link>
            <a href="/api" className="hover:scale-105 transition-transform pointer-events-auto cursor-pointer">
              <button className="font-receipt-narrow text-lg px-4 py-2 rounded-lg">API</button>
            </a>
            <a href="/clothing-design" className="hover:scale-105 transition-transform pointer-events-auto cursor-pointer">
              <button className="font-receipt-narrow text-lg px-4 py-2 rounded-lg">Clothing Design</button>
            </a>
            <a href="https://www.linkedin.com/in/alexhaynes32" className="hover:scale-105 transition-transform pointer-events-auto cursor-pointer">
              <button className="font-receipt-narrow text-lg px-4 py-2 rounded-lg">LinkedIn</button>
            </a>
            <a href="https://www.github.com/alexh" className="hover:scale-105 transition-transform pointer-events-auto cursor-pointer">
              <button className="font-receipt-narrow text-lg px-4 py-2 rounded-lg">GitHub</button>
            </a>
            <a href="mailto:alex@alexhaynes.org" className="hover:scale-105 transition-transform pointer-events-auto cursor-pointer">
              <button className="font-receipt-narrow text-lg px-4 py-2 rounded-lg">Email Me</button>
            </a>
          </div>

          <div className="relative flex-1 min-h-0">
            <SmokeyBackground targetSelector=".text-content" zIndex={10} />
            <div className="absolute inset-0 text-content">
              <div className="space-y-8 text-lg text-theme-text relative z-20">
                {paragraphs.map((text, index) => (
                  <ScrambleIn
                    key={index}
                    ref={(el) => {
                      scrambleRefs.current[index] = el
                    }}
                    text={text}
                    scrambleSpeed={1}
                    scrambledLetterCount={15}
                    autoStart={false}
                    className="text-theme-text relative"
                    scrambledClassName="text-theme-secondary"
                    onComplete={() => {
                      if (index < paragraphs.length - 1) {
                        scrambleRefs.current[index + 1]?.start();
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="block md:hidden mt-auto">
            <InlineThemeSelector />
          </div>

          <footer className="text-center text-theme-text font-receipt-narrow mt-6 md:mt-8">
            © {new Date().getFullYear()}, Built with love ❤️
          </footer>
        </div>
      </div>
    </main>
  )
} 