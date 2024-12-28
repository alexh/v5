'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { MidjourneyJob } from '../../lib/midjourney'
import HologramImage from '../../components/HologramImage'

export default function Oracle() {
  const [job, setJob] = useState<MidjourneyJob | null>(null)
  const { currentTheme } = useTheme()
  
  const loadRandomJob = async () => {
    try {
      console.log('Fetching random job')
      const response = await fetch('/api/random-job')
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Received data:', data)
      setJob(data)
    } catch (error) {
      console.error('Error in loadRandomJob:', error)
    }
  }

  useEffect(() => {
    loadRandomJob()
  }, [])

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-2xl text-[#FF671F] font-mono">Consulting the Oracle...</div>
      </div>
    )
  }

  return (
    <main className="h-screen p-4 md:p-8 bg-transparent text-[#FF671F] overflow-hidden flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <h1 className="text-4xl font-bold mb-4 text-center font-mono animate-pulse shrink-0">
          THE ORACLE SPEAKS
        </h1>
        
        <div className="border border-[#FF671F]/30 rounded-lg p-4 md:p-6 bg-black/10 shadow-[0_0_15px_rgba(255,103,31,0.2)] flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 flex flex-col max-h-[70vh]">
            <div className="relative w-full h-full flex items-center justify-center">
              <HologramImage 
                src={`/midjourney/images/${job.id}.png`}
                alt={job.prompt}
                enableMouseInteraction={false}
              />
            </div>
          </div>
          
          <div className="mt-4 shrink-0">
            <p className="text-xl mb-6 font-mono leading-relaxed text-[#FF671F] [text-shadow:_0_0_5px_rgba(255,103,31,0.5)]">
              {'>'} {job.prompt}
            </p>
            
            <div className="flex justify-between items-center border-t border-[#FF671F]/30 pt-6">
              <a 
                href={job.url}
                target="_blank"
                rel="noopener noreferrer" 
                className="hover:scale-105 transition-transform"
              >
                <button className="font-mono text-lg hover:text-[#E55D1C] transition-colors">
                  [View Source]
                </button>
              </a>
              
              <button 
                onClick={loadRandomJob}
                className="font-mono text-lg hover:text-[#E55D1C] transition-colors"
              >
                [Request New Vision]
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 