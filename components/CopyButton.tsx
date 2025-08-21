'use client'

import React, { useState } from 'react'

interface CopyButtonProps {
  text: string
  className?: string
}

export default function CopyButton({ text, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`absolute top-2 right-2 px-2 py-1 text-xs bg-theme-secondary/20 hover:bg-theme-secondary/40 text-theme-text rounded transition-all duration-200 font-receipt-narrow opacity-0 group-hover:opacity-100 ${className}`}
      aria-label="Copy code"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}