import { useEffect, useState } from 'react'

// A phone in landscape can be 800-930px wide, so width alone isn't enough:
// a coarse pointer with no hover is a touch device regardless of viewport.
const MOBILE_QUERY = '(max-width: 767px), ((hover: none) and (pointer: coarse))'

// null until first client render so SSR markup stays stable; callers should
// avoid mounting expensive desktop-only trees until this resolves to false.
export function useIsMobile(query = MOBILE_QUERY): boolean | null {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const update = () => setIsMobile(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [query])

  return isMobile
}
