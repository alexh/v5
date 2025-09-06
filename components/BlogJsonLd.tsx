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

interface BlogJsonLdProps {
  post: BlogPost
}

export default function BlogJsonLd({ post }: BlogJsonLdProps) {
  const baseUrl = 'https://alexhaynes.org'
  const postUrl = `${baseUrl}/blog/${post.slug}`
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: postUrl,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: post.author || 'Alex Haynes',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Person',
      name: 'Alex Haynes',
      url: baseUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    image: `${baseUrl}/icons/icon-512x512.png`,
    keywords: post.tags?.join(', ') || '',
    wordCount: post.content.split(' ').length,
    timeRequired: post.readingTime ? `PT${post.readingTime}M` : undefined,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}