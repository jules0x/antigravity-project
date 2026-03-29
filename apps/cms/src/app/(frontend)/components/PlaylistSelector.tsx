import React from 'react'
import { TransitionLink } from './TransitionLink'
import './PlaylistSelector.css'

interface Playlist {
  id: string | number
  title: string
  youtubeURL: string
  items?: any[]
}

export default function PlaylistSelector({ playlists }: { playlists: Playlist[] }) {
  if (!playlists || playlists.length === 0) return null

  return (
    <div className="playlist-selector-container">
      <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '24px', opacity: 0.8 }}>Featured Collections</h2>
      <div className="playlist-grid">
        {playlists.map((playlist) => {
          const previewItems = playlist.items?.slice(0, 4) || []
          
          return (
            <TransitionLink
              key={playlist.id}
              href={`/gallery/auto-play?playlist=${playlist.id}`}
              className="playlist-card"
            >
              <div className="playlist-preview-grid">
                {previewItems.length > 0 ? (
                  previewItems.map((item: any) => (
                    <div key={item.id} className="preview-tile">
                      <img 
                        src={typeof item.image === 'object' && item.image?.url ? item.image.url : (item.type === 'video' ? `https://img.youtube.com/vi/${item.youtubeID}/hqdefault.jpg` : '')} 
                        alt="" 
                      />
                    </div>
                  ))
                ) : (
                  <div className="preview-placeholder">
                    <span>EMPTY</span>
                  </div>
                )}
                {/* Ensure at least 4 slots for the grid layout */}
                {Array.from({ length: Math.max(0, 4 - previewItems.length) }).map((_, i) => (
                  <div key={`blank-${i}`} className="preview-tile blank" />
                ))}
              </div>
              <div className="playlist-info">
                <span className="playlist-item-count">{playlist.items?.length || 0} TRACKS</span>
                <h3 className="playlist-title">{playlist.title}</h3>
                <div className="playlist-play-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </TransitionLink>
          )
        })}
      </div>
    </div>
  )
}
