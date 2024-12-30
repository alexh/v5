'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { MidjourneyJob } from '../../../lib/midjourney'
import HologramImage from '../../../components/HologramImage'
import OracleButton from '../../../components/OracleButton'
import Toast from '../../../components/Toast'
import SmokeyBackground from '@/components/SmokeyBackground'

export default function OracleVision() {
  const [job, setJob] = useState<MidjourneyJob | null>(null)
  const [themeColor, setThemeColor] = useState('#FF671F')
  const _currentTheme = useTheme()
  const [showToast, setShowToast] = useState(false)
  
  const loadRandomJob = async () => {
    try {
      setJob(null)
      const timestamp = Date.now()
      const response = await fetch(`/api/random-job?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()
      setJob(data)
    } catch (error) {
      console.error('Error in loadRandomJob:', error)
    }
  }

  useEffect(() => {
    loadRandomJob()
  }, [])

  const shareVision = async () => {
    if (!job) return
    
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/oracle/${job.id}`
      )
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2000)
    } catch (err) {
      console.error('Failed to copy share link:', err)
    }
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-2xl font-mono" style={{ color: themeColor }}>
          Consulting the Oracle...
        </div>
      </div>
    )
  }

  return (
    <>
      <main className="h-screen bg-black overflow-hidden flex flex-col"
            style={{ color: themeColor }}>
        <div className="fixed top-4 left-4 md:top-8 md:left-8 z-10" style={{ fontFamily: "receipt-narrow, sans-serif" }}>
          <OracleButton 
            href="/"
            color={themeColor}
            variant="outline"
          >
            [Return]
          </OracleButton>
        </div>

        <div className="w-full pt-2 px-4 md:px-8">
          <h1 className="text-3xl font-bold text-center font-mono animate-pulse h-[48px] flex items-center justify-center">
            THE ORACLE SPEAKS
          </h1>
        </div>
        
        <div className="flex-1 flex items-start justify-center px-4 md:px-8">
          <div className="w-full max-w-7xl">
            <HologramImage 
              src={`/midjourney/images/${job.id}.png`}
              alt={job.prompt}
              enableMouseInteraction={false}
              onColorExtracted={setThemeColor}
            />
          </div>
        </div>
        
        <div className="fixed bottom-0 left-0 right-0 px-4 md:px-8 pb-4 md:pb-8 bg-gradient-to-t from-black via-black/80 to-transparent pt-16"
             style={{ fontFamily: "receipt-narrow, sans-serif" }}>
          <div className="max-w-7xl mx-auto">
            <p className="text-xl mb-6 leading-relaxed max-h-[15vh] overflow-y-auto"
               style={{ 
                 color: themeColor,
                 textShadow: `0 0 5px ${themeColor}80`
               }}>
              {'>'} {job.prompt
                .replace(/^\*\*|\*\*$/g, '')
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                .replace(/https:\/\/s\.mj\.run\/\S+\s*/g, '')
              }
            </p>
            
            <div className="flex justify-between items-center pt-6 space-x-4"
                 style={{ borderTopColor: `${themeColor}30` }}>
              <div className="flex space-x-4">
                <OracleButton 
                  onClick={shareVision}
                  color={themeColor}
                  variant="outline"
                  key={`share-${job.id}`}
                >
                  [Share Vision]
                </OracleButton>
              </div>
              
              <OracleButton 
                onClick={loadRandomJob}
                color={themeColor}
                variant="outline"
                key={`vision-${job.id}`}
              >
                [Request New Vision]
              </OracleButton>
            </div>
          </div>
        </div>
        
        <Toast 
          message="Link copied to clipboard"
          isVisible={showToast}
          color={themeColor}
        />
      </main>
      <SmokeyBackground 
        opacity={0.04}
        zIndex={9999}
        particleCount={600}
        followText={false}
        color="#666666"
      />
    </>
  )
} 