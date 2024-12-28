'use client'

import React, { createContext, useState, useContext, useEffect } from 'react'

export const themes = {
  default: {
    primary: '#FF671F',
    secondary: '#E55D1C',
    text: '#FFFFFF',
    background: '#FF671F',
  },
  monochrome: {
    primary: '#1A1A1A',
    secondary: '#333333',
    text: '#FFFFFF',
    background: '#000000',
  },
  cute: {
    primary: '#FF69B4',
    secondary: '#FFB6C1',
    text: '#008db4',
    background: '#FFC0CB',
  },
  night: {
    primary: '#1A1A1A',
    secondary: '#2C2C2C',
    text: '#FF0000',
    background: '#000000',
  },
  forest: {
    primary: '#0f280f',
    secondary: '#b89d54',
    text: '#F0FFF0',
    background: '#013220',
  },
  ocean: {
    primary: '#4169E1',
    secondary: '#1E90FF',
    text: '#F0F8FF',
    background: '#00008B',
  },
  arctic: {
    primary: '#E0FFFF',
    secondary: '#dbdbdb',
    text: '#0000FF',
    background: '#FFFFFF',
  },
  desert: {
    primary: '#D2691E',
    secondary: '#DEB887',
    text: '#8B4513',
    background: '#F4A460',
  },
  neon: {
    primary: '#000000',
    secondary: '#ff33f8',
    text: '#00e5ff',
    background: '#000000',
  },
  cog: {
    primary: '#A9A9A9',
    secondary: '#D3D3D3',
    text: '#FFA500',
    background: '#696969',
  }
}

interface ThemeContextType {
  theme: string
  setTheme: (theme: string) => void
  currentTheme: typeof themes.default
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  setTheme: () => {},
  currentTheme: themes.default,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('default')
  const currentTheme = themes[theme as keyof typeof themes]

  useEffect(() => {
    // Apply theme to document root
    document.documentElement.style.setProperty('--theme-primary', currentTheme.primary)
    document.documentElement.style.setProperty('--theme-secondary', currentTheme.secondary)
    document.documentElement.style.setProperty('--theme-text', currentTheme.text)
    document.documentElement.style.setProperty('--theme-background', currentTheme.background)
    // Also set the body background
    document.body.style.backgroundColor = currentTheme.primary
  }, [theme, currentTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext) 