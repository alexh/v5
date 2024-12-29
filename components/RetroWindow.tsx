'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useTheme } from '../contexts/ThemeContext'

interface RetroWindowProps {
  title: string
  children: React.ReactNode
  initialPosition?: { x: number; y: number }
  forcePosition?: boolean
}

export function RetroWindow({ 
  title, 
  children, 
  initialPosition = { x: 100, y: 100 },
  forcePosition = false 
}: RetroWindowProps) {
  const { currentTheme } = useTheme()
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)
  const windowRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (forcePosition) return
    e.preventDefault()
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    }
  }, [position, forcePosition])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && dragStartRef.current) {
      e.preventDefault()
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      })
    }
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  useEffect(() => {
    setPosition(initialPosition)
  }, [initialPosition])

  return (
    <div
      ref={windowRef}
      style={{
        position: forcePosition ? 'fixed' : 'absolute',
        left: forcePosition ? '50%' : `${position.x}px`,
        bottom: forcePosition ? '100px' : 'auto',
        top: forcePosition ? 'auto' : `${position.y}px`,
        transform: forcePosition ? 'translateX(-50%)' : 'none',
        cursor: isDragging ? 'grabbing' : 'default',
        backgroundColor: currentTheme.primary,
        color: currentTheme.text,
        fontFamily: '"receipt-narrow", sans-serif',
        zIndex: 10001,
        width: '300px',
        maxWidth: '300px',
      }}
    >
      <div
        style={{
          fontWeight: 'bold',
          marginBottom: '10px',
          cursor: forcePosition ? 'default' : (isDragging ? 'grabbing' : 'grab'),
          backgroundColor: currentTheme.secondary,
          padding: '5px',
          userSelect: 'none',
          color: currentTheme.text,
        }}
        onMouseDown={handleMouseDown}
      >
        {title}
      </div>
      <div style={{ padding: '10px' }}>
        {children}
      </div>
    </div>
  )
} 