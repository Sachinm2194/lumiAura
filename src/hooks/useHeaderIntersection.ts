"use client"

import { useRef, useEffect, useState } from "react"

export function useHeaderIntersection() {
  const ref = useRef<HTMLDivElement | null>(null)
  const [outOfView, setOutOfView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(([entry]) => setOutOfView(!entry.isIntersecting), { threshold: 1 })

    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  return [ref, outOfView] as const
}
