'use client'

import React, { useState, useEffect } from 'react'

export default function ItemActions({ itemId }: { itemId: number | string }) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [likes, setLikes] = useState<number>(0)
  const [bubbles, setBubbles] = useState<{ id: number, x: number, duration: number, size: number }[]>([])

  useEffect(() => {
    // Generate a stable fake like count for the UI
    setLikes(Math.floor(Math.random() * 50) + 10)
    
    const checkFavorite = () => {
      const favs = JSON.parse(localStorage.getItem('antigravity_favorites') || '[]')
      setIsFavorited(favs.includes(itemId))
    }

    checkFavorite()
    
    window.addEventListener('favoritesUpdated', checkFavorite)
    return () => window.removeEventListener('favoritesUpdated', checkFavorite)
  }, [itemId])

  const toggleFavorite = () => {
    let favs = JSON.parse(localStorage.getItem('antigravity_favorites') || '[]')
    const becomingFavorited = !favs.includes(itemId)
    
    if (favs.includes(itemId)) {
      favs = favs.filter((id: any) => id !== itemId)
      setIsFavorited(false)
    } else {
      favs.push(itemId)
      setIsFavorited(true)
      
      // Spawn bubbles
      const newBubbles = Array.from({ length: 8 }).map((_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 40, // offset from center
        duration: 2 + Math.random() * 2,
        size: 10 + Math.random() * 20
      }))
      setBubbles(prev => [...prev, ...newBubbles])
      
      // Clean up bubbles after they finish animating
      setTimeout(() => {
        setBubbles(prev => prev.filter(b => !newBubbles.find(nb => nb.id === b.id)))
      }, 4000)
    }
    localStorage.setItem('antigravity_favorites', JSON.stringify(favs))
    
    // Dispatch a custom event so other components (like a Favorites sidebar widget) could listen
    window.dispatchEvent(new Event('favoritesUpdated'))
  }

  return (
    <div className="item-actions-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        className={`favorite-heart-btn ${isFavorited ? 'active' : ''}`}
        onClick={toggleFavorite}
        aria-label="Toggle Favorite"
        title="Favorite"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill={isFavorited ? "#FF2A55" : "none"} stroke={isFavorited ? "#FF2A55" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>

      {bubbles.map(bubble => (
        <div 
          key={bubble.id}
          className="heart-bubble"
          style={{
            left: `calc(50% + ${bubble.x}px)`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            animationDuration: `${bubble.duration}s`
          }}
        >
          <svg viewBox="0 0 24 24" fill="#FF2A55">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ))}
    </div>
  )
}
