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
  return (
    <html lang="en" className="bg-theme-primary">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/qzy8qpi.css" />
      </head>
      <body className="min-h-screen text-theme-text bg-theme-primary">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
} 