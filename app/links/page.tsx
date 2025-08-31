'use client'

import React, { useRef, useEffect, useState } from 'react'
import { ThemeSelector } from '../../components/ThemeSelector'
import { InlineThemeSelector } from '../../components/InlineThemeSelector'
import { useTheme } from '../../contexts/ThemeContext'
import SmokeyBackground from '../../components/SmokeyBackground'
import SnowEffect from '../../components/SnowEffect'
import CrtGrid from '../../components/CrtGrid'
import MoonPhase from '../../components/MoonPhase'
import ElevenLabsWidget from '../../components/ElevenLabsWidget'
import ScrambleIn from '../../components/ScrambleIn'
import { ScrambleInHandle } from '../../components/ScrambleIn'
import ParticleText from '../../components/ParticleText'
import Link from 'next/link'

export default function LinksPage() {
  const _currentTheme = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const scrambleRefs = useRef<(ScrambleInHandle | null)[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const links = [
    {
      name: "Utility Materials Inc",
      url: "utility.materials.nyc",
      fullUrl: "https://utility.materials.nyc"
    },
    {
      name: "VIA Terminal",
      url: "via.terminalis.sh",
      fullUrl: "https://via.terminalis.sh"
    },
    {
      name: "Shopalytics",
      url: "shopalytics.ai",
      fullUrl: "https://shopalytics.ai"
    },
    {
      name: "Materials Corporation",
      url: "materials.nyc",
      fullUrl: "https://materials.nyc"
    },
    {
      name: "Creative Tools",
      url: "tools.materials.nyc",
      fullUrl: "https://tools.materials.nyc"
    }
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
    <main className="min-h-screen p-[5%] font-receipt-narrow text-theme-text bg-theme-primary relative" ref={containerRef}>
      <CrtGrid />
      <SnowEffect />
      
      <div className="hidden md:block">
        <MoonPhase />
      </div>

      <div className="hidden md:block">
        <ThemeSelector initialPosition={{ x: 32, y: 32 }} />
      </div>

      <ElevenLabsWidget />

      <div className="max-w-3xl mx-auto relative z-20">
        <div className="flex flex-col">
          <div className="pt-8 flex justify-center z-30 relative">
            <ParticleText
              text="Links"
              className="text-6xl font-extrabold text-center tracking-[.02em] text-theme-text font-['forma-djr-banner'] whitespace-nowrap"
              _fromFontVariationSettings="'wght' 400"
              _toFontVariationSettings="'wght' 900"
              radius={150}
              _falloff="exponential"
              containerRef={containerRef}
            />
          </div>
          
          <h2 className="text-3xl text-center font-forma text-theme-text z-30 relative mb-8">
            Projects & Ventures
          </h2>

          <div className="flex justify-center mb-8 z-30 relative">
            <Link href="/" className="hover:scale-105 transition-transform pointer-events-auto cursor-pointer">
              <button className="font-receipt-narrow text-lg px-4 py-2 rounded-lg">← Back to Home</button>
            </Link>
          </div>

          <div className="relative">
            <SmokeyBackground targetSelector=".links-content" zIndex={10} />
            <div className="links-content">
              <div className="space-y-8 text-lg text-theme-text relative z-20">
                {links.map((link, index) => (
                  <ScrambleIn
                    key={index}
                    ref={(el) => {
                      scrambleRefs.current[index] = el
                    }}
                    text={`<a href="${link.fullUrl}" class="block p-6 border border-theme-text/20 rounded-lg hover:border-theme-secondary transition-colors pointer-events-auto cursor-pointer">
                      <div class="text-2xl font-bold mb-2 text-theme-text">${link.name}</div>
                      <div class="text-theme-text/80">${link.url}</div>
                    </a>`}
                    scrambleSpeed={1}
                    scrambledLetterCount={15}
                    autoStart={false}
                    className="text-theme-text relative"
                    onComplete={() => {
                      if (index < links.length - 1) {
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