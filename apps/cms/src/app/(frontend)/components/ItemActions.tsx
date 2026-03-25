'use client'

import React, { useState, useEffect } from 'react'

export default function ItemActions({ itemId }: { itemId: number | string }) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [likes, setLikes] = useState<number>(0)

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
    if (favs.includes(itemId)) {
      favs = favs.filter((id: any) => id !== itemId)
      setIsFavorited(false)
    } else {
      favs.push(itemId)
      setIsFavorited(true)
    }
    localStorage.setItem('antigravity_favorites', JSON.stringify(favs))
    
    // Dispatch a custom event so other components (like a Favorites sidebar widget) could listen
    window.dispatchEvent(new Event('favoritesUpdated'))
  }

  return (
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
  )
}
