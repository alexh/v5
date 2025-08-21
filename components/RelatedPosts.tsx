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

interface RelatedPostsProps {
  posts: BlogPost[]
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) {
    return null
  }

  return (
    <section className="mt-12 pt-8 border-t border-theme-secondary/30">
      <h3 className="text-2xl font-forma font-bold text-theme-text mb-6">
        Related Posts
      </h3>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <article className="group p-4 rounded-lg border border-theme-secondary/30 hover:border-theme-secondary transition-colors bg-theme-primary/30 backdrop-blur-sm h-full flex flex-col">
              <h4 className="text-lg font-forma font-bold text-theme-text group-hover:text-theme-secondary transition-colors mb-2 line-clamp-2">
                {post.title}
              </h4>
              
              {post.excerpt && (
                <p className="text-sm text-theme-text/80 font-receipt-narrow mb-3 flex-1 line-clamp-3">
                  {post.excerpt}
                </p>
              )}
              
              <div className="flex justify-between items-center text-xs text-theme-text/60 font-receipt-narrow">
                <time>
                  {new Date(post.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </time>
                {post.readingTime && (
                  <span>{post.readingTime} min read</span>
                )}
              </div>
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-theme-secondary/20 text-theme-text rounded-full font-receipt-narrow"
                    >
                      {tag}
                    </span>
                  ))}
                  {post.tags.length > 2 && (
                    <span className="text-xs px-2 py-1 text-theme-text/60 font-receipt-narrow">
                      +{post.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
}