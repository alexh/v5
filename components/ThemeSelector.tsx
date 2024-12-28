'use client'

import React, { useEffect, useState } from 'react'
import { RetroWindow } from './RetroWindow'
import { useTheme } from '../contexts/ThemeContext'

export function ThemeSelector() {
  const { theme, setTheme, currentTheme } = useTheme()
  const [position, setPosition] = useState({ x: 20, y: 20 })

  useEffect(() => {
    setPosition({ x: 20, y: 20 })
  }, [])

  return (
    <RetroWindow 
      title="Theme Selector" 
      initialPosition={position}
    >
      <select 
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="w-full p-2 rounded font-receipt bg-theme-primary text-theme-text border-2 border-theme-secondary"
      >
        <option value="default">Default</option>
        <option value="monochrome">Monochrome</option>
        <option value="cute">Materials Girl</option>
        <option value="night">Night Rider</option>
        <option value="forest">Camo</option>
        <option value="ocean">Under The Sea</option>
        <option value="arctic">Tundra</option>
        <option value="desert">Lisan al Gaib</option>
        <option value="neon">Neon</option>
        <option value="cog">Cog</option>
      </select>
    </RetroWindow>
  )
} 