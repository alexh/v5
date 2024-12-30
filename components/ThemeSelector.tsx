'use client'

import React, { useEffect, useState } from 'react'
import { RetroWindow } from './RetroWindow'
import { useTheme } from '../contexts/ThemeContext'

interface ThemeSelectorProps {
  initialPosition?: { x: number; y: number }
  forcePosition?: boolean
}

export function ThemeSelector({ initialPosition, forcePosition }: ThemeSelectorProps) {
  const _currentTheme = useTheme()
  const [_position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setPosition({ x: 20, y: 20 })
  }, [])

  return (
    <RetroWindow 
      title="Theme Selector" 
      initialPosition={initialPosition}
      forcePosition={forcePosition}
    >
      <select 
        value={_currentTheme.theme}
        onChange={(e) => _currentTheme.setTheme(e.target.value)}
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