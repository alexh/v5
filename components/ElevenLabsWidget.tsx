'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { useEffect, useState } from 'react'

export default function ElevenLabsWidget() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (pathname !== '/' || !mounted) {
    return null
  }

  return (
    <div className="relative z-30">
      <div 
        dangerouslySetInnerHTML={{
          __html: '<elevenlabs-convai agent-id="6qcPB2H0djQWOg2r4Eb6"></elevenlabs-convai>'
        }}
      />
      <Script 
        src="https://elevenlabs.io/convai-widget/index.js" 
        strategy="afterInteractive"
      />
    </div>
  )
} 