import type { Metadata } from 'next'
import { ThemeProvider } from '../contexts/ThemeContext'
import './globals.css'
import 'tailwindcss/tailwind.css'

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
        <script>
          {`
            (function(d) {
              var config = {
                kitId: 'qzy8qpi',
                scriptTimeout: 3000,
                async: true
              },
              h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\bwf-loading\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)
            })(document);
          `}
        </script>
      </head>
      <body className="min-h-screen bg-black text-white">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
} 