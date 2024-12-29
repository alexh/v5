'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const JacketViewer = dynamic(
  () => import('@/components/JacketViewer'),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-[#000033] flex items-center justify-center">
        <div className="text-[#00ffff] text-xl font-mono">
          INITIALIZING VIEWER...
        </div>
      </div>
    )
  }
)

export default function ClothingDesign() {
  return (
    <main className="h-screen overflow-hidden">
      <JacketViewer />
    </main>
  )
} 