'use client'

import React, { useState, useEffect, useRef } from 'react'
import OracleButton from './OracleButton'
import { useTheme } from '../contexts/ThemeContext'

type Message = {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [chatId, setChatId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  
  // Add welcome message on first load
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        text: "INITIALIZING K.O.R.A. TERMINAL // Knowledge & Operations Resource Algorithm v3.5 // UTILITY MATERIALS INC. // CRANE DIVISION // AWAITING INPUT...",
        sender: 'ai',
        timestamp: new Date()
      }
    ])
  }, [])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return
    
    // Add user message to the chat
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setError(null)
    
    try {
      // Prepare request body
      const requestBody: Record<string, any> = {
        message: inputMessage
      }
      
      // Include chatId for continuing conversations
      if (chatId) {
        requestBody.chat_id = chatId
      }
      
      // Send request through the proxy endpoint
      const endpoint = '/api/chat/message/';
      const response = await fetch(`/api/proxy?endpoint=${encodeURIComponent(endpoint)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }
      
      const data = await response.json()
      
      // Store the chat ID for future messages
      if (data.chat_id) {
        setChatId(data.chat_id)
      }
      
      // Add AI response to the chat
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: data.response,
        sender: 'ai',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Generates a random glitch animation duration
  const getRandomGlitchClass = () => {
    const options = ['animate-pulse', '', '', '']
    return options[Math.floor(Math.random() * options.length)]
  }

  return (
    <div className="flex flex-col h-full font-mono border border-orange-500/30 rounded-md overflow-hidden relative">
      {/* Terminal scanlines overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,_rgba(0,0,0,0.02)_50%)] bg-[length:100%_4px] z-50 opacity-10"></div>
      
      {/* Header bar */}
      <div className="border-b border-orange-500/50 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
        </div>
        <h1 className="text-orange-500 text-lg tracking-widest font-bold">K.O.R.A. TERMINAL</h1>
        <div className="flex items-center">
          <span className="text-xs text-orange-500/70 mr-2">[UMI-OS 3.0]</span>
          <OracleButton href="/" color={theme || '#f97316'}>
            EXIT
          </OracleButton>
        </div>
      </div>
      
      {/* Connection status bar */}
      <div className="bg-orange-900/20 border-b border-orange-500/30 py-1 px-2 text-xs flex justify-between text-orange-400">
        <span>CONNECTION: SECURE</span>
        <span className="animate-pulse">SYSTEM STATUS: ONLINE</span>
        <span>SESSION ID: {chatId ? chatId.substring(0, 8) : 'INITIALIZING...'}</span>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500/30 scrollbar-track-transparent chat-content py-4 px-2">
        <div className="space-y-4">
          {messages.map(message => (
            <div 
              key={message.id}
              className={`border-l-4 pl-2 py-1 my-2 ${getRandomGlitchClass()} ${
                message.sender === 'user' 
                  ? 'border-blue-500 text-blue-300 bg-blue-900/10' 
                  : 'border-orange-500 text-orange-300 bg-orange-900/10'
              }`}
            >
              <div className="flex items-center mb-1">
                <div className={`w-2 h-2 rounded-full mr-2 ${message.sender === 'ai' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                <span className={`text-xs tracking-wider ${message.sender === 'ai' ? 'text-orange-400' : 'text-blue-400'}`}>
                  {message.sender === 'ai' ? 'K.O.R.A. // ' : 'USER // '}
                  <span className="opacity-70">{message.timestamp.toLocaleTimeString()}</span>
                </span>
              </div>
              <div className="ml-4 leading-relaxed text-sm break-words">
                {message.text}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="border-l-4 border-orange-500 pl-2 py-1 bg-orange-900/10 animate-pulse">
              <div className="flex items-center mb-1">
                <div className="w-2 h-2 rounded-full mr-2 bg-orange-500"></div>
                <span className="text-xs tracking-wider text-orange-400">
                  K.O.R.A. // <span className="opacity-70">PROCESSING</span>
                </span>
              </div>
              <div className="ml-4 text-orange-300">
                <span className="inline-block w-2 h-4 bg-orange-500 animate-pulse mr-1"></span>
                <span className="inline-block w-2 h-4 bg-orange-500 animate-pulse delay-75 mr-1"></span>
                <span className="inline-block w-2 h-4 bg-orange-500 animate-pulse delay-150"></span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="border-l-4 border-red-500 pl-2 py-1 bg-red-900/10 text-red-300">
              <div className="flex items-center mb-1">
                <div className="w-2 h-2 rounded-full mr-2 bg-red-500"></div>
                <span className="text-xs tracking-wider text-red-400">
                  SYSTEM ERROR
                </span>
              </div>
              <div className="ml-4 text-sm">
                {error}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input area */}
      <div className="border-t border-orange-500/30 p-3">
        <div className="flex items-center text-orange-300 text-sm mb-1">
          <span className="animate-pulse mr-2">❯</span>
          <span>ENTER COMMAND:</span>
        </div>
        <div className="flex relative">
          <textarea
            className="w-full border border-orange-500/50 rounded-none p-2 text-orange-300 focus:outline-none focus:border-orange-400 resize-none font-mono bg-transparent"
            style={{ 
              minHeight: '60px',
              maxHeight: '150px',
            }}
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
          />
          <button
            className="absolute right-3 bottom-3 p-1 hover:bg-orange-900/30 rounded border border-orange-500/50 transition-colors"
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
          >
            <span className="text-orange-500 font-mono text-xs px-2">SEND</span>
          </button>
        </div>
        
        <div className="flex justify-between text-xs text-orange-500/50 mt-1">
          <span>UTILITY MATERIALS INC. SECURE TERMINAL</span>
          <span>© 2044 UMI CRANE DIVISION</span>
        </div>
      </div>
    </div>
  )
} 