import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react"
import { prepare, layout } from "@chenglou/pretext"

interface ScrambleInProps {
  text: string
  scrambleSpeed?: number
  scrambledLetterCount?: number
  characters?: string
  className?: string
  autoStart?: boolean
  onStart?: () => void
  onComplete?: () => void
}

export interface ScrambleInHandle {
  start: () => void
  reset: () => void
}

interface CachedTextNode {
  node: Text
  startOffset: number
  originalText: string
}

const stripHtml = (html: string): string => {
  if (typeof document === "undefined") return ""
  const div = document.createElement("div")
  div.innerHTML = html
  return div.textContent || ""
}

const ScrambleIn = forwardRef<ScrambleInHandle, ScrambleInProps>(
  (
    {
      text,
      scrambleSpeed = 50,
      scrambledLetterCount = 2,
      characters = "abcdefghijklmnopqrstuvwxyz!@#$%^&*()_+",
      className = "",
      autoStart = true,
      onStart,
      onComplete,
    },
    ref
  ) => {
    const paragraphRef = useRef<HTMLParagraphElement | null>(null)
    const cachedNodesRef = useRef<CachedTextNode[]>([])
    const totalLengthRef = useRef(0)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const visibleCountRef = useRef(0)
    const completedRef = useRef(false)

    // Keep callback refs current without triggering re-renders
    const onStartRef = useRef(onStart)
    const onCompleteRef = useRef(onComplete)
    onStartRef.current = onStart
    onCompleteRef.current = onComplete

    const stopInterval = useCallback(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }, [])

    const renderProgress = useCallback(() => {
      const visibleCount = visibleCountRef.current
      const tail = Array(scrambledLetterCount)
        .fill(0)
        .map(() => characters[Math.floor(Math.random() * characters.length)])
        .join("")

      for (const cn of cachedNodesRef.current) {
        const nodeEnd = cn.startOffset + cn.originalText.length
        if (visibleCount >= nodeEnd) {
          if (cn.node.textContent !== cn.originalText) {
            cn.node.textContent = cn.originalText
          }
        } else if (visibleCount > cn.startOffset) {
          cn.node.textContent =
            cn.originalText.slice(0, visibleCount - cn.startOffset) + tail
        } else {
          if (cn.node.textContent !== "") {
            cn.node.textContent = ""
          }
        }
      }
    }, [characters, scrambledLetterCount])

    const startAnimation = useCallback(() => {
      if (cachedNodesRef.current.length === 0) return
      stopInterval()
      visibleCountRef.current = 0
      completedRef.current = false
      onStartRef.current?.()
      renderProgress()

      intervalRef.current = setInterval(() => {
        if (visibleCountRef.current < totalLengthRef.current) {
          visibleCountRef.current++
          renderProgress()
        } else {
          for (const cn of cachedNodesRef.current) {
            cn.node.textContent = cn.originalText
          }
          stopInterval()
          if (!completedRef.current) {
            completedRef.current = true
            onCompleteRef.current?.()
          }
        }
      }, scrambleSpeed)
    }, [scrambleSpeed, renderProgress, stopInterval])

    const reset = useCallback(() => {
      stopInterval()
      visibleCountRef.current = 0
      completedRef.current = false
      for (const cn of cachedNodesRef.current) {
        cn.node.textContent = ""
      }
    }, [stopInterval])

    useImperativeHandle(
      ref,
      () => ({ start: startAnimation, reset }),
      [startAnimation, reset]
    )

    // Cache live DOM text nodes and apply pretext min-height — no state changes
    useLayoutEffect(() => {
      const el = paragraphRef.current
      if (!el) return

      // Parse original texts from the HTML prop (not live DOM, which may be
      // blank from a prior Strict Mode double-invocation)
      const parser = document.createElement("div")
      parser.innerHTML = text
      const originalTexts: string[] = []
      const parserWalker = document.createTreeWalker(
        parser,
        NodeFilter.SHOW_TEXT,
        null
      )
      let pNode: Node | null
      while ((pNode = parserWalker.nextNode()) !== null) {
        originalTexts.push(pNode.textContent || "")
      }

      // Walk live DOM text nodes and pair with parsed originals
      const cached: CachedTextNode[] = []
      let totalLength = 0
      const walker = document.createTreeWalker(
        el,
        NodeFilter.SHOW_TEXT,
        null
      )
      let node: Node | null
      let i = 0
      while ((node = walker.nextNode()) !== null) {
        const textNode = node as Text
        const original = i < originalTexts.length ? originalTexts[i] : ""
        cached.push({
          node: textNode,
          startOffset: totalLength,
          originalText: original,
        })
        totalLength += original.length
        i++
      }
      cachedNodesRef.current = cached
      totalLengthRef.current = totalLength

      // Measure final height with pretext and apply directly to DOM
      try {
        const cs = getComputedStyle(el)
        const fontSizePx = parseFloat(cs.fontSize) || 16
        const font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
        const lineHeight =
          cs.lineHeight === "normal"
            ? fontSizePx * 1.5
            : parseFloat(cs.lineHeight) || fontSizePx * 1.5
        const widthPx = el.clientWidth
        const plainText = stripHtml(text)
        if (widthPx > 0 && plainText.length > 0) {
          const prepared = prepare(plainText, font)
          const result = layout(prepared, widthPx, lineHeight)
          el.style.minHeight = `${Math.ceil(result.height)}px`
        }
      } catch {
        el.style.minHeight = `${el.offsetHeight}px`
      }

      // Blank all text nodes before first paint
      for (const cn of cached) {
        cn.node.textContent = ""
      }
    }, [text])

    // Auto-start after layout effect has cached nodes
    useEffect(() => {
      if (autoStart && cachedNodesRef.current.length > 0) {
        startAnimation()
      }
    }, [autoStart, startAnimation])

    // Cleanup on unmount
    useEffect(() => {
      return () => stopInterval()
    }, [stopInterval])

    return (
      <p
        ref={paragraphRef}
        className={className}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    )
  }
)

ScrambleIn.displayName = "ScrambleIn"
export default ScrambleIn
