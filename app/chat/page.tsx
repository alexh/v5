'use client'

import React from 'react'
import ChatInterface from '@/components/ChatInterface'
import SmokeyBackground from '@/components/SmokeyBackground'

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        <SmokeyBackground targetSelector=".chat-content" zIndex={1} />
      </div>
      
      <div className="relative z-10 w-full max-w-4xl mx-auto h-screen p-4">
        <ChatInterface />
      </div>
    </main>
  )
} 