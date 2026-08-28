'use client'

import React, { useRef, useEffect } from 'react'
import { ThemeSelector } from '../../components/ThemeSelector'
import { InlineThemeSelector } from '../../components/InlineThemeSelector'
import SmokeyBackground from '../../components/SmokeyBackground'
import SnowEffect from '../../components/SnowEffect'
import CrtGrid from '../../components/CrtGrid'
import MoonPhase from '../../components/MoonPhase'
import ScrambleIn from '../../components/ScrambleIn'
import { ScrambleInHandle } from '../../components/ScrambleIn'
import ParticleText from '../../components/ParticleText'
import { useIsMobile } from '../../hooks/use-is-mobile'
import Link from 'next/link'

export default function LinksPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrambleRefs = useRef<(ScrambleInHandle | null)[]>([])
  const isMobile = useIsMobile()

  const links = [
    {
      name: "Utility Materials Inc",
      url: "utility.materials.nyc",
      fullUrl: "https://utility.materials.nyc",
      description: ["Clothing Brand"]
    },
    {
      name: "Digital Materials",
      url: "digital.materials.nyc",
      fullUrl: "https://digital.materials.nyc",
      description: ["Game Studio subsidiary of Utility Materials.", "Currently building a rogue-like platform fighter."]
    },
    {
      name: "VIA Terminal",
      url: "via.terminalis.sh",
      fullUrl: "https://via.terminalis.sh",
      description: ["iOS Terminal App"]
    },
    {
      name: "Shopalytics",
      url: "shopalytics.ai",
      fullUrl: "https://shopalytics.ai",
      description: ["Shopify Analytics Conversational Platform"]
    },
    {
      name: "From the River to the Sea",
      url: "from.the.river.to.the.sea.giving",
      fullUrl: "https://from.the.river.to.the.sea.giving",
      description: ["Gazan Genocide Awareness Page"]
    },
    {
      name: "Materials Corporation",
      url: "materials.nyc",
      fullUrl: "https://materials.nyc",
      description: ["Holding Company"]
    },
    {
      name: "Utility Tools",
      url: "tools.materials.nyc",
      fullUrl: "https://tools.materials.nyc",
      description: ["macOS Apps for Creatives"]
    }
  ]

  useEffect(() => {
    // Stagger the link cards in parallel; each card reveals quickly instead
    // of chaining behind the previous one.
    const timers = links.map((_, i) =>
      setTimeout(() => scrambleRefs.current[i]?.start(), 200 + i * 120)
    )
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="min-h-screen overflow-x-hidden p-[5%] font-receipt-narrow text-theme-text bg-theme-primary relative" ref={containerRef}>
      <CrtGrid />
      <SnowEffect />

      {isMobile === false && (
        <>
          <MoonPhase />
          <ThemeSelector initialPosition={{ x: 32, y: 32 }} />
        </>
      )}

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
                    as="div"
                    durationMs={700}
                    scrambledLetterCount={15}
                    autoStart={false}
                    className="text-theme-text relative"
                  >
                    <a
                      href={link.fullUrl}
                      className="block p-5 sm:p-6 border border-theme-text/20 rounded-lg hover:border-theme-accent active:border-theme-accent transition-colors pointer-events-auto cursor-pointer"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <div className="text-2xl font-bold text-theme-text">{link.name}</div>
                          <div className="text-theme-text/70 text-base mt-1">
                            {link.description.map((line, i) => (
                              <span key={i} className="block">{line}</span>
                            ))}
                          </div>
                        </div>
                        <div className="text-theme-text/80 md:text-right text-sm md:text-base">{link.url}</div>
                      </div>
                    </a>
                  </ScrambleIn>
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