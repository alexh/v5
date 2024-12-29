import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '../contexts/ThemeContext'
import ElevenLabsWidget from '../components/ElevenLabsWidget'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Alex Haynes',
  description: 'Alex Haynes',
  icons: {
    icon: [
      { url: '/icons/icon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
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