'use client'

import React from 'react'
import Link from 'next/link'

interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  tags?: string[]
  author?: string
  readingTime?: number
}

interface PostNavigationProps {
  prev: BlogPost | null
  next: BlogPost | null
}

export default function PostNavigation({ prev, next }: PostNavigationProps) {
  if (!prev && !next) {
    return null
  }

  return (
    <nav className="flex flex-col sm:flex-row justify-between gap-4 mt-12 pt-8 border-t border-theme-secondary/30">
      {prev ? (
        <Link 
          href={`/blog/${prev.slug}`}
          className="group flex-1 p-4 rounded-lg border border-theme-secondary/30 hover:border-theme-secondary transition-colors bg-theme-primary/30 backdrop-blur-sm"
        >
          <div className="text-sm text-theme-text/70 font-receipt-narrow mb-2">
            ← Previous Post
          </div>
          <div className="text-lg font-forma font-bold text-theme-text group-hover:text-theme-secondary transition-colors">
            {prev.title}
          </div>
          {prev.readingTime && (
            <div className="text-xs text-theme-text/60 font-receipt-narrow mt-2">
              {prev.readingTime} min read
            </div>
          )}
        </Link>
      ) : (
        <div className="flex-1"></div>
      )}

      {next ? (
        <Link 
          href={`/blog/${next.slug}`}
          className="group flex-1 p-4 rounded-lg border border-theme-secondary/30 hover:border-theme-secondary transition-colors bg-theme-primary/30 backdrop-blur-sm text-right"
        >
          <div className="text-sm text-theme-text/70 font-receipt-narrow mb-2">
            Next Post →
          </div>
          <div className="text-lg font-forma font-bold text-theme-text group-hover:text-theme-secondary transition-colors">
            {next.title}
          </div>
          {next.readingTime && (
            <div className="text-xs text-theme-text/60 font-receipt-narrow mt-2">
              {next.readingTime} min read
            </div>
          )}
        </Link>
      ) : (
        <div className="flex-1"></div>
      )}
    </nav>
  )
}