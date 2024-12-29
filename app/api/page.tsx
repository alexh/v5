'use client'

import React from 'react'
import ApiDisplay from '../../components/ApiDisplay'

// Create a layout wrapper that doesn't include the effects
function SimpleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      {children}
    </div>
  )
}

export default function ApiPage() {
  return (
    <SimpleLayout>
      <main className="p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-6xl font-bold mb-12"></div>
          <ApiDisplay />
        </div>
      </main>
    </SimpleLayout>
  )
} 