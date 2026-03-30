'use client'

import React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export default function ShuffleControl({ paramName = 'shuffle', label = 'SHUFFLE' }: { paramName?: string, label?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleShuffle = () => {
    const params = new URLSearchParams(searchParams.toString())
    // Generate a new random seed
    const newSeed = Math.random().toString(36).substring(7)
    params.set(paramName, newSeed)
    
    // @ts-ignore
    if (document.startViewTransition) {
      // @ts-ignore
      document.startViewTransition(() => {
        return new Promise((resolve) => {
          router.push(`${pathname}?${params.toString()}`)
          // Next.js doesn't provide a way to wait for the page to render.
          // We use a small timeout to allow the initial render to start.
          setTimeout(resolve, 300)
        })
      })
    } else {
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  return (
    <button 
      onClick={handleShuffle}
      className="shuffle-btn"
      title="Shuffle Playlist"
      aria-label="Shuffle Playlist"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
        <polyline points="16 3 21 3 21 8"></polyline>
        <line x1="4" y1="20" x2="21" y2="3"></line>
        <polyline points="21 16 21 21 16 21"></polyline>
        <line x1="15" y1="15" x2="21" y2="21"></line>
        <line x1="4" y1="4" x2="9" y2="9"></line>
      </svg>
      {label}
    </button>
  )
}
