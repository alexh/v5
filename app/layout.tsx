import type { Metadata } from 'next'
import { ThemeProvider } from '../contexts/ThemeContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'Alex Haynes',
  description: 'Software Engineer | Creative',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (typeof window !== 'undefined') {
    console.log('Styles loaded:', document.styleSheets.length)
  }
  
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
} 