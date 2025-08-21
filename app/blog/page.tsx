'use client'

import React, { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import SmokeyBackground from '../../components/SmokeyBackground'
import SnowEffect from '../../components/SnowEffect'
import CrtGrid from '../../components/CrtGrid'
import MoonPhase from '../../components/MoonPhase'
import { ThemeSelector } from '../../components/ThemeSelector'
import { InlineThemeSelector } from '../../components/InlineThemeSelector'
import ScrambleIn from '../../components/ScrambleIn'
import ParticleText from '../../components/ParticleText'
import SearchBar from '../../components/SearchBar'

interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  tags?: string[]
  author?: string
  readingTime?: number
}

export default function BlogPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await fetch('/api/blog')
        if (response.ok) {
          const blogPosts = await response.json()
          setPosts(blogPosts)
          setFilteredPosts(blogPosts)
        }
      } catch (error) {
        console.error('Failed to load blog posts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPosts()
  }, [])

  if (isLoading) {
    return (
      <main className="h-screen overflow-hidden p-[5%] font-receipt-narrow text-theme-text bg-theme-primary relative">
        <CrtGrid />
        <div className="absolute inset-0 z-10">
          <SmokeyBackground targetSelector=".loading-text" zIndex={1} />
        </div>
        <div className="h-full flex items-center justify-center relative z-20">
          <div className="text-4xl loading-text">
            Loading blog...
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-[5%] font-receipt-narrow text-theme-text bg-theme-primary relative" ref={containerRef}>
      <CrtGrid />
      <SnowEffect />
      
      <div className="hidden md:block">
        <MoonPhase />
      </div>

      <div className="hidden md:block">
        <ThemeSelector initialPosition={{ x: 32, y: 32 }} />
      </div>

      <div className="max-w-4xl mx-auto relative z-20">
        <div className="pt-8 flex flex-col items-center">
          <ParticleText
            text="Blog"
            className="text-6xl font-extrabold text-center tracking-[.02em] text-theme-text font-['forma-djr-banner'] whitespace-nowrap mb-4"
            _fromFontVariationSettings="'wght' 400"
            _toFontVariationSettings="'wght' 900"
            radius={150}
            _falloff="exponential"
            containerRef={containerRef}
          />
          
          <div className="mb-8 text-center">
            <Link href="/" className="hover:text-theme-secondary transition-colors font-receipt-narrow text-lg">
              ← Back to Home
            </Link>
          </div>
        </div>

        <div className="relative">
          <SmokeyBackground targetSelector=".blog-content" zIndex={10} />
          <div className="blog-content relative z-20">
            <SearchBar posts={posts} onFilter={setFilteredPosts} />
            
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <ScrambleIn
                  text="No blog posts yet. Check back soon!"
                  scrambleSpeed={1}
                  scrambledLetterCount={15}
                  autoStart={true}
                  className="text-2xl text-theme-text"
                />
              </div>
            ) : (
              <div className="grid gap-8">
                {filteredPosts.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`}>
                    <article className="group relative rounded-lg p-6 bg-theme-primary/50 backdrop-blur-sm cursor-pointer transition-all duration-300 border-2 border-transparent hover:border-theme-secondary hover:shadow-xl hover:shadow-theme-secondary/60">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                        <h2 className="text-2xl font-forma font-bold text-theme-text">
                          {post.title}
                        </h2>
                        <div className="text-theme-text/80 text-sm font-receipt-narrow whitespace-nowrap">
                          <time>
                            {new Date(post.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </time>
                          {post.readingTime && (
                            <div className="mt-1">
                              {post.readingTime} min read
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {post.excerpt && (
                        <p className="text-theme-text/90 mb-4 font-receipt-narrow text-lg leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                      
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag) => (
                            <Link 
                              key={tag} 
                              href={`/blog/tag/${encodeURIComponent(tag)}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs px-2 py-1 bg-theme-secondary/20 text-theme-text rounded-full font-receipt-narrow hover:bg-theme-secondary/40 hover:text-theme-text transition-colors"
                            >
                              #{tag}
                            </Link>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-theme-secondary font-receipt-narrow">
                        Read more →
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="block md:hidden mt-12">
          <InlineThemeSelector />
        </div>

        <footer className="text-center text-theme-text font-receipt-narrow mt-12">
          © {new Date().getFullYear()}, Built with love ❤️
        </footer>
      </div>
    </main>
  )
}