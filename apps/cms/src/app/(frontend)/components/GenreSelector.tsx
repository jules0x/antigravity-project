import React from 'react'
import { TransitionLink } from './TransitionLink'
import './GenreSelector.css'

interface Genre {
  id: string | number
  name: string
  slug: string
  color?: string
  count?: number
}

export default function GenreSelector({ genres }: { genres: Genre[] }) {
  return (
    <div className="genre-selector-container">
      <div className="genre-grid">
        {genres.map((genre) => (
          <TransitionLink
            key={genre.id}
            href={`/gallery/auto-play?genre=${genre.slug}`}
            className={`genre-tile ${genre.color || 'indigo'}`}
          >
            <div className="genre-tile-content">
              <span className="genre-name">{genre.name}</span>
              {genre.count !== undefined && <span className="genre-count">{genre.count}</span>}
            </div>
          </TransitionLink>
        ))}
      </div>
    </div>
  )
}
