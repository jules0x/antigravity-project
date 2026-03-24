'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

export default function FavoritesGalleryWidget({ block }: { block?: any }) {
  const customTitle = block?.title || 'Your Favorites'
  const customLabel = block?.label || 'PERSONAL VAULT'

  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadFavorites = async () => {
    const favs = JSON.parse(localStorage.getItem('antigravity_favorites') || '[]')
    if (favs.length === 0) {
      setFavorites([])
      setLoading(false)
      return
    }

    try {
      const query = favs.join(',')
      const res = await fetch(`/api/items?where[id][in]=${query}&limit=50&depth=2`)
      const data = await res.json()
      setFavorites(data.docs || [])
    } catch (e) {
      console.error('Failed to load favorites', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFavorites()
    window.addEventListener('favoritesUpdated', loadFavorites)
    return () => window.removeEventListener('favoritesUpdated', loadFavorites)
  }, [])

  if (loading) return null
  
  if (favorites.length === 0) return null

  return (
    <div className="gallery-section">
      <header className="section-header">
        <div className="section-title-group">
          {customLabel && <span className="section-label">{customLabel}</span>}
          <h2 className="section-title">{customTitle}</h2>
        </div>
      </header>

      <div className="favorites-gallery-grid">
        {favorites.map((rel: any) => {
          const isVideo = rel.type === 'video'
          const bgImage = isVideo 
            ? `https://img.youtube.com/vi/${rel.youtubeID}/maxresdefault.jpg` 
             : (typeof rel.image === 'object' ? rel.image?.url : '')
          
          const author = rel.author && typeof rel.author === 'object' ? rel.author : null
          const avatarUrl = author?.avatar && typeof author.avatar === 'object' ? author.avatar.url : 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + rel.id

          return (
            <Link href={`/gallery/${rel.slug || rel.id}`} key={rel.id} className="fav-card">
              <img src={bgImage || ''} alt={rel.title} className="fav-card-image" />
              <div className="fav-card-overlay"></div>
              
              {rel.duration && (
                <div className="fav-card-top-right">
                  {rel.duration}
                </div>
              )}

              <div className="fav-card-content">
                <h3 className="fav-card-title">{rel.title}</h3>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
