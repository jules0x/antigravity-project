'use client'

import React, { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface VideoPlayerProps {
  youtubeID: string
  nextUrl?: string
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void
    YT: any
  }
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ youtubeID, nextUrl }) => {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const nextUrlRef = useRef(nextUrl)
  const router = useRouter()

  // Update ref whenever nextUrl changes without re-running the player setup
  useEffect(() => {
    nextUrlRef.current = nextUrl
  }, [nextUrl])

  useEffect(() => {
    // Load YouTube API if not already present
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }

    const onPlayerReady = (event: any) => {
      // Auto-play is handled by the iframe src normally
    }

    const onPlayerStateChange = (event: any) => {
      // YT.PlayerState.ENDED is 0
      if (event.data === 0 && nextUrlRef.current) {
        // @ts-ignore
        if (document.startViewTransition) {
          // @ts-ignore
          document.startViewTransition(() => {
            router.push(nextUrlRef.current!)
          })
        } else {
          router.push(nextUrlRef.current)
        }
      }
    }

    const initPlayer = () => {
      if (containerRef.current) {
        playerRef.current = new window.YT.Player(containerRef.current, {
          height: '100%',
          width: '100%',
          videoId: youtubeID,
          playerVars: {
            autoplay: 1,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
          },
        })
      }
    }

    if (window.YT && window.YT.Player) {
      initPlayer()
    } else {
      window.onYouTubeIframeAPIReady = initPlayer
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [youtubeID, router])

  return (
    <div className="video-player-wrapper video-player" style={{ width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
