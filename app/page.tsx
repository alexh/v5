'use client'

import React from 'react'
import { ThemeSelector } from '../components/ThemeSelector'
import { useTheme } from '../contexts/ThemeContext'
import SmokeyBackground from '../components/SmokeyBackground'
import SnowEffect from '../components/SnowEffect'

export default function Home() {
  const { currentTheme } = useTheme()

  return (
    <main className="min-h-screen p-[5%] font-receipt-narrow text-theme-text bg-theme-primary relative">
      <SnowEffect />
      <SmokeyBackground />
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="relative z-20">
          <h1 className="text-8xl font-extrabold italic text-center mb-1 pl-3 font-forma text-theme-text">
            Alex Haynes
          </h1>
          
          <h2 className="text-4xl text-center mb-12 font-forma text-theme-text">
            Software Engineer | Creative
          </h2>

          <div className="flex justify-center items-center gap-4 mb-12">
            <a href="/oracle" className="hover:scale-105 transition-transform pointer-events-auto cursor-pointer">
              <button className="font-receipt-narrow text-lg px-4 py-2 rounded-lg">Oracle</button>
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

          <div className="space-y-12 text-lg text-theme-text text-content relative font-receipt-narrow">
            <p>
              I am a software engineer living in New York City, USA.
            </p>
            
            <p>
            At <a href="https://seek.ai" className="underline hover:text-theme-secondary transition-colors pointer-events-auto">Seek AI</a>, I work as a Senior Full Stack Engineer building features end-to-end, from frontend to backend to prompt engineering. 
            I enjoy working on distributed systems and agentic AI workflows.
            Before Seek, I spent four years at Two Sigma Insurance Quantified working on enterprise software.
            </p>
            
            <p>
              Outside of work, I enjoy skiing, golfing, and spending time with my dog, <a 
                href="https://www.instagram.com/bolognaboynyc"
                className="underline hover:text-theme-secondary transition-colors pointer-events-auto cursor-pointer"
              >Bologna</a>.
              I also enjoy building and designing for my clothing brand, <a 
                href="https://utility.materials.nyc"
                className="underline hover:text-theme-secondary transition-colors pointer-events-auto cursor-pointer"
              >Utility Materials Inc</a>.
              Additionally, I'm developing a 2-D rogue-like platform fighter in GameMaker Studio.
            </p>
          </div>

          <footer className="text-center mt-12 text-theme-text font-receipt-narrow">
            © {new Date().getFullYear()}, Built with love ❤️
          </footer>
        </div>
      </div>
      <ThemeSelector />
    </main>
  )
} 