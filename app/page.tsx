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
import ChromeNav from '../components/ChromeNav'
import Link from 'next/link'

export default function Home() {
  const _currentTheme = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const scrambleRefs = useRef<(ScrambleInHandle | null)[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const paragraphs = [
    "I am a software engineer living in New York City, USA.",
    `I'm a Founding Engineer at <a href="https://outersignal.com" class="underline hover:text-[var(--theme-accent)] transition-colors pointer-events-auto">OuterSignal</a>, where we're building customer intelligence that goes beyond what a transaction can tell you — giving brands a real understanding of who their customers are, what makes them valuable, and how to reach them in a way that actually feels personal. Before this, I was a Senior Full Stack Engineer at <a href="https://seek.ai" class="underline hover:text-[var(--theme-accent)] transition-colors pointer-events-auto">Seek AI</a> (acquired by <a href="https://ibm.com" class="underline hover:text-[var(--theme-accent)] transition-colors pointer-events-auto">IBM</a> in June 2024), where I built enterprise-grade agentic data assistants, and spent four years before that at Two Sigma Insurance Quantified.`,
    `Two years ago I founded <a href="https://utility.materials.nyc" class="underline hover:text-[var(--theme-accent)] transition-colors pointer-events-auto cursor-pointer">Utility Materials, Inc.</a>, an NYC-based clothing brand running on Shopify. Operating UMI taught me what it feels like to stare at order data and wish you understood something deeper about the people buying from you — you can see what sold, but the person behind the order stays invisible. That gap always frustrated me, and it's exactly the problem OuterSignal makes visible. I'm building something from the ground up with people I believe in on a problem I've lived firsthand.`,
    `Outside of work, I make full use of my down time — whether skiing, exploring new places, spending time with my dog <a href="https://www.instagram.com/bolognaboynyc" class="underline hover:text-[var(--theme-accent)] transition-colors pointer-events-auto cursor-pointer">Bologna</a>, or developing a <a href="https://digital.materials.nyc/this-god-is-not-final" class="underline hover:text-[var(--theme-accent)] transition-colors pointer-events-auto cursor-pointer">rogue-like platform fighting game</a>.`
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
      <main className="h-screen md:overflow-hidden overflow-auto p-[5%] font-receipt-narrow text-theme-text bg-theme-primary relative">
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
    <main className="min-h-screen overflow-x-hidden overflow-y-auto px-[5%] pt-[1.5%] pb-[40px] md:pb-[5%] font-receipt-narrow text-theme-text bg-theme-primary relative" ref={containerRef}>
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
          <div className="flex justify-center z-30 relative">
            <ParticleText
              text="Alex Haynes"
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-center tracking-[.02em] text-theme-text font-['forma-djr-banner'] whitespace-nowrap"
              _fromFontVariationSettings="'wght' 400"
              _toFontVariationSettings="'wght' 900"
              radius={150}
              _falloff="exponential"
              containerRef={containerRef}
            />
          </div>
          
          <h2 className="text-xl sm:text-2xl md:text-3xl text-center font-monaspace-krypton text-theme-text z-30 relative mb-4 px-4">
            Software Engineer | Creative
          </h2>

          <ChromeNav className="flex flex-wrap justify-center items-center gap-x-8 gap-y-6 px-4 mb-16 z-30">
            <Link href="/blog" className="pointer-events-auto cursor-pointer">
              <button className="font-receipt-narrow text-2xl px-4 py-2 rounded-lg tracking-wide transition-all duration-200">Blog</button>
            </Link>
            <Link href="/oracle" className="pointer-events-auto cursor-pointer">
              <button className="font-receipt-narrow text-2xl px-4 py-2 rounded-lg tracking-wide transition-all duration-200">Generative AI Art</button>
            </Link>
            <Link href="/chat" className="pointer-events-auto cursor-pointer">
              <button className="font-receipt-narrow text-2xl px-4 py-2 rounded-lg tracking-wide transition-all duration-200">Chat with K.O.R.A.</button>
            </Link>
            <Link href="/links" className="pointer-events-auto cursor-pointer">
              <button className="font-receipt-narrow text-2xl px-4 py-2 rounded-lg tracking-wide transition-all duration-200">Links</button>
            </Link>
            <a href="/clothing-design" className="pointer-events-auto cursor-pointer">
              <button className="font-receipt-narrow text-2xl px-4 py-2 rounded-lg tracking-wide transition-all duration-200">Clothing Design</button>
            </a>
            <a href="https://www.linkedin.com/in/alexhaynes32" className="pointer-events-auto cursor-pointer">
              <button className="font-receipt-narrow text-2xl px-4 py-2 rounded-lg tracking-wide transition-all duration-200">LinkedIn</button>
            </a>
            <a href="https://www.github.com/alexh" className="pointer-events-auto cursor-pointer">
              <button className="font-receipt-narrow text-2xl px-4 py-2 rounded-lg tracking-wide transition-all duration-200">GitHub</button>
            </a>
            <a href="https://alexh.github.io/vintage-icons/" className="pointer-events-auto cursor-pointer">
              <button className="font-receipt-narrow text-2xl px-4 py-2 rounded-lg tracking-wide transition-all duration-200">Vintage Icons</button>
            </a>
            <a href="mailto:alex@alexhaynes.org" className="pointer-events-auto cursor-pointer">
              <button className="font-receipt-narrow text-2xl px-4 py-2 rounded-lg tracking-wide transition-all duration-200">Email Me</button>
            </a>
          </ChromeNav>

          <div className="relative mb-8">
            <SmokeyBackground targetSelector=".text-content" zIndex={10} />
            <div className="text-content">
              <div className="space-y-8 text-lg text-theme-text relative z-20 font-monaspace-krypton">
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

          <div className="block md:hidden mb-8 relative z-30">
            <InlineThemeSelector />
          </div>

          <footer className="text-center text-theme-text font-receipt-narrow mt-6 md:mt-8 relative z-20">
            © {new Date().getFullYear()}, Built with love ❤️
          </footer>
        </div>
      </div>
    </main>
  )
} 