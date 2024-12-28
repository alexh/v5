import React from 'react'
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
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/qzy8qpi.css" />
      </head>
      <body style={{ fontFamily: "receipt-narrow, sans-serif", fontWeight: 400, fontStyle: "normal" }}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
} 