import './globals.css'
import { ThemeProvider } from '../contexts/ThemeContext'
import { Metadata } from 'next'

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
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
} 