'use client'

import React, { useState, useEffect } from 'react'
import FavoritesSidebar from './FavoritesSidebar'
import './FavoritesDrawer.css'

export default function FavoritesDrawer() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    const handleClose = () => setIsOpen(false)
    const handleToggle = () => setIsOpen(prev => !prev)

    window.addEventListener('openFavorites', handleOpen)
    window.addEventListener('closeFavorites', handleClose)
    window.addEventListener('toggleFavorites', handleToggle)

    return () => {
      window.removeEventListener('openFavorites', handleOpen)
      window.removeEventListener('closeFavorites', handleClose)
      window.removeEventListener('toggleFavorites', handleToggle)
    }
  }, [])

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="drawer-backdrop" onClick={() => setIsOpen(false)} />
      )}

      {/* Drawer */}
      <div className={`favorites-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>YOUR ARCHIVE</h2>
          <button className="close-drawer" onClick={() => setIsOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="drawer-content">
          <FavoritesSidebar />
        </div>
      </div>
    </>
  )
}
