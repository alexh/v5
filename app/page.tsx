'use client'

import React from 'react'
import { ThemeSelector } from '../components/ThemeSelector'
import { useTheme } from '../contexts/ThemeContext'
import MatrixRain from '../components/MatrixRain'
import SmokeyBackground from '../components/SmokeyBackground'

export default function Home() {
  const { currentTheme } = useTheme()

  return (
    <main className="min-h-screen p-[5%] font-receipt text-theme-text bg-theme-primary relative">
      <MatrixRain />
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
            <a href="/Alex_Haynes.pdf" className="hover:scale-105 transition-transform pointer-events-auto cursor-pointer">
              <button className="font-receipt text-xl px-4 py-2 rounded-lg">Resume</button>
            </a>
            <a href="https://www.linkedin.com/in/alexhaynes32" className="hover:scale-105 transition-transform pointer-events-auto cursor-pointer">
              <button className="font-receipt text-xl px-4 py-2 rounded-lg">LinkedIn</button>
            </a>
            <a href="https://www.github.com/alexh" className="hover:scale-105 transition-transform pointer-events-auto cursor-pointer">
              <button className="font-receipt text-xl px-4 py-2 rounded-lg">GitHub</button>
            </a>
            <a href="mailto:alex@alexhaynes.org" className="hover:scale-105 transition-transform pointer-events-auto cursor-pointer">
              <button className="font-receipt text-xl px-4 py-2 rounded-lg">Email Me</button>
            </a>
            <a href="/oracle" className="hover:scale-105 transition-transform pointer-events-auto cursor-pointer">
              <button className="font-receipt text-xl px-4 py-2 rounded-lg">Oracle</button>
            </a>
          </div>

          <div className="space-y-12 text-xl text-theme-text text-content relative">
            <p>
              I am a software engineer living in New York City, USA.
            </p>
            
            <p>
              As a Senior Full Stack Engineer at <a href="https://seek.ai" className="underline hover:text-theme-secondary transition-colors pointer-events-auto">Seek AI</a>, I build features end-to-end across the entire stack. My work 
              spans from crafting intuitive front-end experiences to designing robust backend systems and implementing 
              sophisticated prompt engineering solutions. I specialize in developing distributed systems and handling 
              complex async job processing pipelines. Prior to Seek, I spent four years at Two Sigma Insurance Quantified, 
              where I gained valuable experience in enterprise software development.
            </p>
            
            <p>
              Beyond the world of coding, I make full use of my down time, whether it's skiing; exploring new places; 
              spending time with my dog, <a 
                href="https://www.instagram.com/bolognaboynyc"
                className="underline hover:text-theme-secondary transition-colors pointer-events-auto cursor-pointer"
              >Bologna</a>; or building and designing for my clothing brand, <a 
                href="https://utility.materials.nyc"
                className="underline hover:text-theme-secondary transition-colors pointer-events-auto cursor-pointer"
              >Utility Materials, Inc.</a>, my clothing brand. Additionally, I'm developing a rogue-like 
              platform fighting game.
            </p>
          </div>

          <footer className="text-center mt-12 text-theme-text">
            © {new Date().getFullYear()}, Built with love ❤️
          </footer>
        </div>
      </div>
      <ThemeSelector />
    </main>
  )
} 