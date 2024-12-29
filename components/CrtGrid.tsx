'use client'

import React from 'react'

export default function CrtGrid() {
  return (
    <div 
      className="pointer-events-none fixed inset-0 z-[5]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0, 0, 0, 0.1) 2px, transparent 2px),
          linear-gradient(90deg, rgba(0, 0, 0, 0.1) 2px, transparent 2px)
        `,
        backgroundSize: '4px 4px',
      }}
    />
  )
} 