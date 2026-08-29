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
  /** HTML string to reveal. Prefer `children` for anything with markup:
   * browsers re-serialize HTML (`<br />` -> `<br>`), so a non-canonical
   * string here fails React's hydration compare. */
  text?: string
  children?: React.ReactNode
  /** Wrapper element. Use "div" when children contain block content. */
  as?: "p" | "div"
  scrambleSpeed?: number
  /** Total reveal duration. When set, overrides scrambleSpeed with a
   * time-based reveal so long paragraphs finish just as fast as short ones. */
  durationMs?: number
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

const ScrambleIn = forwardRef<ScrambleInHandle, ScrambleInProps>(
  (
    {
      text,
      children,
      as: Tag = "p",
      scrambleSpeed = 50,
      durationMs,
      scrambledLetterCount = 2,
      characters = "abcdefghijklmnopqrstuvwxyz!@#$%^&*()_+",
      className = "",
      autoStart = true,
      onStart,
      onComplete,
    },
    ref
  ) => {
    const paragraphRef = useRef<HTMLElement | null>(null)
    const cachedNodesRef = useRef<CachedTextNode[]>([])
    const totalLengthRef = useRef(0)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const rafRef = useRef(0)
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
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
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

    const finishAnimation = useCallback(() => {
      for (const cn of cachedNodesRef.current) {
        cn.node.textContent = cn.originalText
      }
      stopInterval()
      if (!completedRef.current) {
        completedRef.current = true
        onCompleteRef.current?.()
      }
    }, [stopInterval])

    const startAnimation = useCallback(() => {
      if (cachedNodesRef.current.length === 0) return
      stopInterval()
      visibleCountRef.current = 0
      completedRef.current = false
      onStartRef.current?.()

      // Reduced motion: skip the reveal entirely
      if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        finishAnimation()
        return
      }

      renderProgress()

      // Time-based reveal: total time is constant regardless of text length,
      // so long paragraphs never leave the page stuck in scrambled gibberish.
      // Falls back to per-character pacing when durationMs isn't provided.
      const total = totalLengthRef.current
      const totalDuration = durationMs ?? total * scrambleSpeed
      const startTime = performance.now()

      const tick = (now: number) => {
        const progress = Math.min(1, (now - startTime) / totalDuration)
        const target = Math.floor(progress * total)
        if (target !== visibleCountRef.current) {
          visibleCountRef.current = target
          renderProgress()
        }
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          finishAnimation()
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }, [scrambleSpeed, durationMs, renderProgress, stopInterval, finishAnimation])

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

      // Originals come from the live DOM (restored by this effect's cleanup,
      // so a Strict Mode double-invocation never sees blanked nodes).
      const cached: CachedTextNode[] = []
      let totalLength = 0
      const walker = document.createTreeWalker(
        el,
        NodeFilter.SHOW_TEXT,
        null
      )
      let node: Node | null
      while ((node = walker.nextNode()) !== null) {
        const textNode = node as Text
        const original = textNode.textContent || ""
        cached.push({
          node: textNode,
          startOffset: totalLength,
          originalText: original,
        })
        totalLength += original.length
      }
      cachedNodesRef.current = cached
      totalLengthRef.current = totalLength
      const plainText = cached.map((cn) => cn.originalText).join("")

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
      return () => {
        for (const cn of cached) {
          cn.node.textContent = cn.originalText
        }
      }
      // `children` is intentionally excluded: a parent re-render mid-reveal
      // would re-cache the half-scrambled text as the original.
      // eslint-disable-next-line react-hooks/exhaustive-deps
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

    if (children !== undefined) {
      return (
        <Tag ref={paragraphRef as React.RefObject<HTMLParagraphElement>} className={className}>
          {children}
        </Tag>
      )
    }
    return (
      <Tag
        ref={paragraphRef as React.RefObject<HTMLParagraphElement>}
        className={className}
        dangerouslySetInnerHTML={{ __html: text ?? "" }}
      />
    )
  }
)

ScrambleIn.displayName = "ScrambleIn"
export default ScrambleIn
