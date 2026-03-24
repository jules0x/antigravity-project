'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

export default function FavoritesSidebar() {
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
      const res = await fetch(`/api/items?where[id][in]=${query}&limit=50`)
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
    
    // Listen for custom event from ItemActions
    window.addEventListener('favoritesUpdated', loadFavorites)
    return () => window.removeEventListener('favoritesUpdated', loadFavorites)
  }, [])

  if (loading) return <div style={{ color: '#888', fontSize: '0.9rem' }}>Loading curriculum...</div>
  
  if (favorites.length === 0) return (
    <div style={{ padding: '15px', background: 'var(--color-surface)', borderRadius: '8px', fontSize: '0.9rem', color: '#888', border: '1px dashed var(--glass-border)' }}>
      Your archive is empty. Click the ♥ button on a track to save it here.
    </div>
  )

  return (
    <div className="related-list favorites-list">
      {favorites.map((rel: any) => (
        <Link href={`/gallery/${rel.slug || rel.id}`} key={rel.id} className="related-card" style={{ borderLeft: '2px solid var(--color-primary)', paddingLeft: '8px', marginLeft: '-10px' }}>
          <div className="related-thumb-container">
            <img 
              src={rel.type === 'video' ? `https://img.youtube.com/vi/${rel.youtubeID}/hqdefault.jpg` : (typeof rel.image === 'object' ? rel.image?.url : '')} 
              alt={rel.title || 'Untitled'} 
              className="related-thumb" 
            />
          </div>
          <span className="related-title">{rel.title}</span>
        </Link>
      ))}
    </div>
  )
}
