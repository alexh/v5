import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '../contexts/ThemeContext'
import ElevenLabsWidget from '../components/ElevenLabsWidget'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  metadataBase: new URL('https://alexhaynes.org'),
  title: {
    default: 'Alex Haynes',
    template: '%s - Alex Haynes'
  },
  description: 'Technical insights on AI development, creative engineering, and innovative projects by Alex Haynes',
  keywords: ['Alex Haynes', 'AI development', 'engineering', 'technology', 'blog', 'creative coding'],
  authors: [{ name: 'Alex Haynes', url: 'https://alexhaynes.org' }],
  creator: 'Alex Haynes',
  publisher: 'Alex Haynes',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://alexhaynes.org',
    siteName: 'Alex Haynes',
    title: 'Alex Haynes',
    description: 'Technical insights on AI development, creative engineering, and innovative projects',
    images: [
      {
        url: 'https://alexhaynes.org/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'Alex Haynes'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alex Haynes',
    description: 'Technical insights on AI development, creative engineering, and innovative projects',
    images: ['https://alexhaynes.org/icons/icon-512x512.png'],
  },
  icons: {
    icon: [
      { url: '/icons/icon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  alternates: {
    types: {
      'application/rss+xml': [
        { url: '/blog/rss.xml', title: 'Alex Haynes Blog RSS' }
      ]
    }
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/qzy8qpi.css" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-8BDD7C0K90"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-8BDD7C0K90');
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <ElevenLabsWidget />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
} 