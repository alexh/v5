import { useEffect, useState } from 'react'

// null until first client render so SSR markup stays stable; callers should
// avoid mounting expensive desktop-only trees until this resolves to false.
export function useIsMobile(query = '(max-width: 767px)'): boolean | null {
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
