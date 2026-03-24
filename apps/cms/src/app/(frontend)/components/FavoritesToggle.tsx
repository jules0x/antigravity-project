'use client'

import React, { useState, useEffect } from 'react'
import './FavoritesToggle.css'

export default function FavoritesToggle() {
  const [count, setCount] = useState(0)

  const updateCount = () => {
    const favs = JSON.parse(localStorage.getItem('antigravity_favorites') || '[]')
    setCount(favs.length)
  }

  useEffect(() => {
    updateCount()
    window.addEventListener('favoritesUpdated', updateCount)
    return () => window.removeEventListener('favoritesUpdated', updateCount)
  }, [])

  return (
    <button 
      className="favorites-toggle" 
      onClick={() => window.dispatchEvent(new Event('toggleFavorites'))}
      aria-label="Toggle Favorites"
    >
      <div className="toggle-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </div>
      {count > 0 && <span className="toggle-count">{count}</span>}
    </button>
  )
}
