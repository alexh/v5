'use client'

import React, { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import SmokeyBackground from '../../../components/SmokeyBackground'
import SnowEffect from '../../../components/SnowEffect'
import CrtGrid from '../../../components/CrtGrid'
import MoonPhase from '../../../components/MoonPhase'
import { ThemeSelector } from '../../../components/ThemeSelector'
import { InlineThemeSelector } from '../../../components/InlineThemeSelector'
import ParticleText from '../../../components/ParticleText'
import ScrambleIn from '../../../components/ScrambleIn'
import CopyButton from '../../../components/CopyButton'
import PostNavigation from '../../../components/PostNavigation'
import RelatedPosts from '../../../components/RelatedPosts'
import ReadingProgress from '../../../components/ReadingProgress'
import BlogJsonLd from '../../../components/BlogJsonLd'

interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  content: string
  tags?: string[]
  author?: string
  readingTime?: number
}

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [post, setPost] = useState<BlogPost | null>(null)
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null)
  const [adjacentPosts, setAdjacentPosts] = useState<{ prev: BlogPost | null, next: BlogPost | null }>({ prev: null, next: null })
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const loadPost = async () => {
      try {
        const response = await fetch(`/api/blog/${params.slug}`)
        
        if (!response.ok) {
          setNotFound(true)
          setIsLoading(false)
          return
        }

        const blogPost = await response.json()
        setPost(blogPost)
        
        const mdxSourceResult = await serialize(blogPost.content, {
          mdxOptions: {
            development: process.env.NODE_ENV === 'development',
          },
        })
        
        setMdxSource(mdxSourceResult)

        // Load adjacent posts
        const adjacentResponse = await fetch(`/api/blog/${params.slug}/adjacent`)
        if (adjacentResponse.ok) {
          const adjacent = await adjacentResponse.json()
          setAdjacentPosts(adjacent)
        }

        // Load related posts
        const relatedResponse = await fetch(`/api/blog/${params.slug}/related`)
        if (relatedResponse.ok) {
          const related = await relatedResponse.json()
          setRelatedPosts(related)
        }

        // Update meta tags for Open Graph
        if (blogPost) {
          document.title = `${blogPost.title} - Alex Haynes`
          
          // Update or create meta tags
          const updateMetaTag = (property: string, content: string) => {
            let meta = document.querySelector(`meta[property="${property}"]`) || 
                      document.querySelector(`meta[name="${property}"]`)
            if (!meta) {
              meta = document.createElement('meta')
              if (property.startsWith('og:') || property.startsWith('twitter:')) {
                meta.setAttribute('property', property)
              } else {
                meta.setAttribute('name', property)
              }
              document.head.appendChild(meta)
            }
            meta.setAttribute('content', content)
          }

          updateMetaTag('description', blogPost.excerpt)
          updateMetaTag('og:title', blogPost.title)
          updateMetaTag('og:description', blogPost.excerpt)
          updateMetaTag('og:type', 'article')
          updateMetaTag('og:url', `https://alexhaynes.org/blog/${blogPost.slug}`)
          updateMetaTag('twitter:card', 'summary_large_image')
          updateMetaTag('twitter:title', blogPost.title)
          updateMetaTag('twitter:description', blogPost.excerpt)
          
          if (blogPost.tags && blogPost.tags.length > 0) {
            updateMetaTag('keywords', blogPost.tags.join(', '))
          }
        }
      } catch (error) {
        console.error('Failed to load blog post:', error)
        setNotFound(true)
      } finally {
        setIsLoading(false)
      }
    }

    loadPost()
  }, [params.slug])

  if (isLoading) {
    return (
      <main className="h-screen overflow-hidden p-[5%] font-receipt-narrow text-theme-text bg-theme-primary relative">
        <CrtGrid />
        <div className="absolute inset-0 z-10">
          <SmokeyBackground targetSelector=".loading-text" zIndex={1} />
        </div>
        <div className="h-full flex items-center justify-center relative z-20">
          <div className="text-4xl loading-text">
            Loading post...
          </div>
        </div>
      </main>
    )
  }

  if (notFound || !post || !mdxSource) {
    return (
      <main className="h-screen overflow-hidden p-[5%] font-receipt-narrow text-theme-text bg-theme-primary relative" ref={containerRef}>
        <CrtGrid />
        <SnowEffect />
        
        <div className="hidden md:block">
          <MoonPhase />
        </div>

        <div className="hidden md:block">
          <ThemeSelector initialPosition={{ x: 32, y: 32 }} />
        </div>

        <div className="h-full flex flex-col items-center justify-center relative z-20 max-w-2xl mx-auto text-center">
          <ParticleText
            text="404"
            className="text-8xl font-extrabold text-center tracking-[.02em] text-theme-text font-['forma-djr-banner'] whitespace-nowrap mb-6"
            _fromFontVariationSettings="'wght' 400"
            _toFontVariationSettings="'wght' 900"
            radius={150}
            _falloff="exponential"
            containerRef={containerRef}
          />
          
          <ScrambleIn
            text="Blog post not found"
            scrambleSpeed={1}
            scrambledLetterCount={15}
            autoStart={true}
            className="text-2xl text-theme-text mb-6"
          />
          
          <Link 
            href="/blog" 
            className="hover:text-theme-secondary transition-colors font-receipt-narrow text-lg"
          >
            ← Back to Blog
          </Link>
        </div>
      </main>
    )
  }

  const mdxComponents = {
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="text-4xl font-bold mb-6 font-forma text-theme-text">
        {children}
      </h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-3xl font-semibold mb-4 mt-8 font-forma text-theme-text">
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-2xl font-medium mb-3 mt-6 font-forma text-theme-text">
        {children}
      </h3>
    ),
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="text-lg mb-4 text-theme-text font-receipt-narrow leading-relaxed">
        {children}
      </p>
    ),
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a 
        href={href} 
        className="underline hover:text-theme-secondary transition-colors text-theme-text"
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc list-inside mb-4 text-theme-text font-receipt-narrow space-y-2">
        {children}
      </ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal list-inside mb-4 text-theme-text font-receipt-narrow space-y-2">
        {children}
      </ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="text-lg text-theme-text">
        {children}
      </li>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-4 border-theme-secondary pl-4 italic mb-4 text-theme-text font-receipt-narrow">
        {children}
      </blockquote>
    ),
    code: ({ children }: { children?: React.ReactNode }) => (
      <code className="bg-theme-secondary/20 px-2 py-1 rounded text-sm font-mono text-theme-text">
        {children}
      </code>
    ),
    pre: ({ children }: { children?: React.ReactNode }) => {
      const codeContent = React.isValidElement(children) && children.props?.children
        ? typeof children.props.children === 'string' 
          ? children.props.children 
          : children.props.children.toString()
        : children?.toString() || ''

      return (
        <div className="group relative">
          <pre className="bg-theme-secondary/20 p-4 rounded-lg overflow-x-auto mb-4 text-theme-text font-mono text-sm">
            {children}
          </pre>
          <CopyButton text={codeContent} />
        </div>
      )
    },
    ScrambleIn,
    ParticleText,
  }

  return (
    <>
      <BlogJsonLd post={post} />
      <ReadingProgress />
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
        <div className="mb-8">
          <Link href="/blog" className="hover:text-theme-secondary transition-colors font-receipt-narrow text-lg">
            ← Back to Blog
          </Link>
        </div>

        <article className="relative">
          <SmokeyBackground targetSelector=".blog-post-content" zIndex={10} />
          <div className="blog-post-content relative z-20">
            <header className="mb-8 text-center">
              <div className="w-full px-4">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-center tracking-[.02em] text-theme-text font-forma mb-4 leading-tight hover:text-theme-secondary transition-colors duration-300">
                  {post.title}
                </h1>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center gap-2 sm:gap-6 text-theme-text/80">
                <time className="font-receipt-narrow">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
                {post.readingTime && (
                  <span className="font-receipt-narrow">
                    {post.readingTime} min read
                  </span>
                )}
                {post.author && (
                  <span className="font-receipt-narrow">
                    by {post.author}
                  </span>
                )}
              </div>
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog/tag/${encodeURIComponent(tag)}`}
                      className="text-xs px-3 py-1 bg-theme-secondary/20 text-theme-text rounded-full font-receipt-narrow hover:bg-theme-secondary/40 hover:text-theme-text transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </header>

            <div className="prose prose-lg max-w-none">
              <MDXRemote {...mdxSource} components={mdxComponents} />
            </div>

            <RelatedPosts posts={relatedPosts} />
            <PostNavigation prev={adjacentPosts.prev} next={adjacentPosts.next} />
          </div>
        </article>

        <div className="block md:hidden mt-12">
          <InlineThemeSelector />
        </div>

        <footer className="text-center text-theme-text font-receipt-narrow mt-12">
          © {new Date().getFullYear()}, Built with love ❤️
        </footer>
      </div>
    </main>
    </>
  )
}