'use client'

import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

export function InlineThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="w-full max-w-xs mx-auto mb-8 px-4">
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
    </div>
  )
} 