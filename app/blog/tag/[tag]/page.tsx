'use client'

import React, { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import SmokeyBackground from '../../../../components/SmokeyBackground'
import SnowEffect from '../../../../components/SnowEffect'
import CrtGrid from '../../../../components/CrtGrid'
import MoonPhase from '../../../../components/MoonPhase'
import { ThemeSelector } from '../../../../components/ThemeSelector'
import { InlineThemeSelector } from '../../../../components/InlineThemeSelector'
import ScrambleIn from '../../../../components/ScrambleIn'

interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  tags?: string[]
  author?: string
}

interface TagPageProps {
  params: {
    tag: string
  }
}

export default function TagPage({ params }: TagPageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const decodedTag = decodeURIComponent(params.tag)

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await fetch('/api/blog')
        if (response.ok) {
          const allPosts = await response.json()
          const filteredPosts = allPosts.filter((post: BlogPost) => 
            post.tags?.includes(decodedTag)
          )
          setPosts(filteredPosts)
        }
      } catch (error) {
        console.error('Failed to load blog posts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPosts()
  }, [decodedTag])

  if (isLoading) {
    return (
      <main className="h-screen overflow-hidden p-[5%] font-receipt-narrow text-theme-text bg-theme-primary relative">
        <CrtGrid />
        <div className="absolute inset-0 z-10">
          <SmokeyBackground targetSelector=".loading-text" zIndex={1} />
        </div>
        <div className="h-full flex items-center justify-center relative z-20">
          <div className="text-4xl loading-text">
            Loading posts...
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen overflow-x-hidden p-[5%] font-receipt-narrow text-theme-text bg-theme-primary relative" ref={containerRef}>
      <CrtGrid />
      <SnowEffect />
      
      <div className="hidden md:block">
        <MoonPhase />
      </div>

      <div className="hidden md:block">
        <ThemeSelector initialPosition={{ x: 32, y: 32 }} />
      </div>

      <div className="max-w-4xl mx-auto relative z-20">
        <div className="pt-8 flex flex-col items-center relative z-30">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center tracking-[.02em] text-theme-text font-forma whitespace-nowrap mb-2">
            #{decodedTag}
          </h1>
          
          <p className="text-lg text-theme-text/80 text-center mb-8 font-receipt-narrow">
            {posts.length} post{posts.length !== 1 ? 's' : ''} tagged with &ldquo;{decodedTag}&rdquo;
          </p>
          
          <div className="mb-8 text-center">
            <Link href="/blog" className="hover:text-theme-secondary transition-colors font-receipt-narrow text-lg">
              ← Back to Blog
            </Link>
          </div>
        </div>

        <div className="relative">
          <SmokeyBackground targetSelector=".blog-content" zIndex={10} />
          <div className="blog-content relative z-20">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <ScrambleIn
                  text={`No posts found with the tag "${decodedTag}"`}
                  scrambleSpeed={1}
                  scrambledLetterCount={15}
                  autoStart={true}
                  className="text-2xl text-theme-text"
                />
              </div>
            ) : (
              <div className="grid gap-8">
                {posts.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`}>
                    <article className="group relative rounded-lg p-6 bg-theme-primary/50 backdrop-blur-sm cursor-pointer transition-all duration-300 border-2 border-transparent hover:border-theme-secondary hover:shadow-xl hover:shadow-theme-secondary/60">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                        <h2 className="text-2xl font-forma font-bold text-theme-text">
                          {post.title}
                        </h2>
                        <time className="text-theme-text/80 text-sm font-receipt-narrow whitespace-nowrap">
                          {new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </time>
                      </div>
                      
                      {post.excerpt && (
                        <p className="text-theme-text/90 mb-4 font-receipt-narrow text-lg leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                      
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`text-xs px-2 py-1 rounded-full font-receipt-narrow ${
                                tag === decodedTag 
                                  ? 'bg-theme-secondary/40 text-theme-text' 
                                  : 'bg-theme-secondary/20 text-theme-text'
                              }`}
                            >
                              {tag}
                            </span>
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