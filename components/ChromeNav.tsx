'use client'

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useMousePositionRef } from '../hooks/use-mouse-position-ref'
import { useIsMobile } from '../hooks/use-is-mobile'
import type { LabelRect } from './ChromeNavCanvas'

// three.js + R3F only load on desktop, where the 3D nav actually mounts.
const ChromeNavCanvas = dynamic(() => import('./ChromeNavCanvas'), {
  ssr: false,
})

type ChromeNavProps = {
  className?: string
  children: React.ReactNode
}

const ChromeNav: React.FC<ChromeNavProps> = ({ className = '', children }) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const mouseRef = useMousePositionRef(wrapperRef)
  // 3D chrome text is desktop-only: on mobile the WebGL cost isn't worth it
  // and the unlit metal reads as washed-out gray, so the DOM buttons render
  // directly instead.
  const isMobile = useIsMobile()

  const [fontsReady, setFontsReady] = useState(false)
  const [positions, setPositions] = useState<LabelRect[]>([])
  const [wrapperSize, setWrapperSize] = useState({ w: 0, h: 0 })

  // Font-loading gate for Typekit — the DOM buttons must be using
  // receipt-narrow metrics before we measure their rects
  useEffect(() => {
    if (isMobile !== false) return
    let cancelled = false
    document.fonts.ready.then(() => {
      setTimeout(() => {
        if (!cancelled) setFontsReady(true)
      }, 150)
    })
    return () => {
      cancelled = true
    }
  }, [isMobile])

  useLayoutEffect(() => {
    if (!fontsReady || isMobile !== false) return
    const wrapper = wrapperRef.current
    if (!wrapper) return

    let rafId = 0
    const measure = () => {
      const wrapperRect = wrapper.getBoundingClientRect()
      const buttons = Array.from(wrapper.querySelectorAll('button'))
      const next: LabelRect[] = buttons.map((btn) => {
        const r = btn.getBoundingClientRect()
        return {
          label: btn.textContent || '',
          x: r.left - wrapperRect.left,
          y: r.top - wrapperRect.top,
          w: r.width,
          h: r.height,
        }
      })
      setPositions(next)
      setWrapperSize({ w: wrapperRect.width, h: wrapperRect.height })
    }

    const scheduleMeasure = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(measure)
    }

    measure()
    const ro = new ResizeObserver(scheduleMeasure)
    ro.observe(wrapper)
    window.addEventListener('resize', scheduleMeasure)
    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      window.removeEventListener('resize', scheduleMeasure)
    }
  }, [fontsReady, isMobile])

  const active =
    isMobile === false && fontsReady && positions.length > 0 && wrapperSize.w > 0

  return (
    <div
      ref={wrapperRef}
      className={`${className} ${active ? 'chrome-nav-active' : ''} ${isMobile ? 'chrome-nav-mobile' : ''}`}
      style={{ position: 'relative' }}
    >
      {active && (
        <style>{`.chrome-nav-active button { color: transparent !important; }`}</style>
      )}
      {isMobile && (
        <style>{`
          .chrome-nav-mobile button {
            color: var(--theme-text);
            border: 1px solid color-mix(in oklab, var(--theme-text) 25%, transparent);
            min-height: 44px;
          }
          .chrome-nav-mobile button:active {
            color: var(--theme-accent);
            border-color: var(--theme-accent);
          }
        `}</style>
      )}
      {children}
      {active && (
        <ChromeNavCanvas
          positions={positions}
          wrapperSize={wrapperSize}
          mouseRef={mouseRef}
        />
      )}
    </div>
  )
}

export default ChromeNav
