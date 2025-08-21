'use client'

import React, { useState, useEffect } from 'react'

interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  tags?: string[]
  author?: string
  readingTime?: number
}

interface SearchBarProps {
  posts: BlogPost[]
  onFilter: (filteredPosts: BlogPost[]) => void
}

export default function SearchBar({ posts, onFilter }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!searchTerm.trim()) {
      onFilter(posts)
      return
    }

    const filtered = posts.filter(post => {
      const searchLower = searchTerm.toLowerCase()
      const titleMatch = post.title.toLowerCase().includes(searchLower)
      const excerptMatch = post.excerpt.toLowerCase().includes(searchLower)
      const tagMatch = post.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      const authorMatch = post.author?.toLowerCase().includes(searchLower)
      
      return titleMatch || excerptMatch || tagMatch || authorMatch
    })

    onFilter(filtered)
  }, [searchTerm, posts, onFilter])

  return (
    <div className="relative mb-8">
      <div className="relative">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-black/20 backdrop-blur-sm border-2 border-transparent hover:border-theme-secondary/30 focus:border-theme-secondary rounded-lg text-theme-text placeholder-theme-text/60 font-receipt-narrow text-lg focus:outline-none transition-colors"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-text/60">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </div>
      </div>
      
      {searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-2 text-sm text-theme-text/70 font-receipt-narrow">
          {posts.filter(post => {
            const searchLower = searchTerm.toLowerCase()
            const titleMatch = post.title.toLowerCase().includes(searchLower)
            const excerptMatch = post.excerpt.toLowerCase().includes(searchLower)
            const tagMatch = post.tags?.some(tag => tag.toLowerCase().includes(searchLower))
            const authorMatch = post.author?.toLowerCase().includes(searchLower)
            return titleMatch || excerptMatch || tagMatch || authorMatch
          }).length} result(s) found
        </div>
      )}
    </div>
  )
}