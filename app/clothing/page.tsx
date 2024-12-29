'use client'

import React from 'react'
import { ThemeSelector } from '../../components/ThemeSelector'
import { useTheme } from '../../contexts/ThemeContext'
import SmokeyBackground from '../../components/SmokeyBackground'
import SnowEffect from '../../components/SnowEffect'
import FloatingImages from '../../components/FloatingImages'

export default function ClothingPage() {
  const { currentTheme } = useTheme()

  return (
    <main className="min-h-screen p-[5%] font-receipt-narrow text-theme-text bg-theme-primary relative">
      <SnowEffect />
      <SmokeyBackground />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="relative z-20">
          <h1 className="text-6xl font-extrabold text-center mb-8 font-forma text-theme-text">
            Designed With Thought
          </h1>
          
          <FloatingImages />

          <div className="text-center mt-8 space-y-4">
            <a 
              href="https://utility.materials.nyc" 
              className="inline-block hover:scale-105 transition-transform"
            >
              <button className="font-receipt-narrow text-lg px-6 py-3 rounded-lg border border-theme-text">
                Visit Store
              </button>
            </a>
          </div>
        </div>
      </div>
      <ThemeSelector />
    </main>
  )
} 