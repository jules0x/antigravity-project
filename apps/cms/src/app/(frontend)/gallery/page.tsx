/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import { TransitionLink } from '../components/TransitionLink'
import './gallery.css'
import GenreSelector from '../components/GenreSelector'
import PlaylistSelector from '../components/PlaylistSelector'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Gallery | Antigravity',
  description: 'A curated collection of visual and sonic obsessions.',
}

export default async function GalleryPage() {
  const payload = await getPayload({ config })
  
  // Fetch the gallery page
  const { docs: pages } = await payload.find({
    collection: 'pages',
    where: {
      slug: { equals: 'gallery' },
    },
    limit: 1,
  })

  if (!pages || pages.length === 0) {
    return (
      <div className="gallery-container">
         <h1 style={{ color: "white" }}>Gallery Page Not Found</h1>
         <p style={{ color: "#aaa" }}>Please create a page with slug "gallery" in the CMS.</p>
      </div>
    )
  }

  const page = pages[0]
  const layout = page.layout || []

  // Fetch all genres for the selector
  const { docs: allGenres } = await payload.find({
    collection: 'genres',
    limit: 100,
    sort: 'name',
  })

  // Fetch all playlists with their first 4 items
  const { docs: allPlaylists } = await payload.find({
    collection: 'playlists',
    limit: 20,
    sort: '-createdAt',
  })

  // For each playlist, find some items to preview
  const playlistsWithItems = await Promise.all(allPlaylists.map(async (playlist: any) => {
    const { docs: items } = await payload.find({
      collection: 'items',
      where: {
        playlist: { equals: playlist.id }
      },
      limit: 4,
      sort: 'createdAt'
    })
    return { ...playlist, items }
  }))

  return (
    <div className="gallery-container">
      {/* Title Section */}
      <div className="gallery-section">
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ margin: '10px 0', fontSize: '5rem', fontWeight: '950', textTransform: 'uppercase' }}>
            {page.title}
          </h1>
          <GenreSelector genres={allGenres as any[]} />
          <PlaylistSelector playlists={playlistsWithItems as any[]} />
        </div>
      </div>

      {layout.map((block: any, index: number) => {
        if (block.blockType === 'grid') {
          return <GridBlockRenderer key={index} block={block} />
        }
        if (block.blockType === 'hero') {
          return <HeroBlockRenderer key={index} block={block} />
        }
        if (block.blockType === 'list') {
          return <ListBlockRenderer key={index} block={block} />
        }
        return null
      })}
    </div>
  )
}

function GridBlockRenderer({ block }: { block: any }) {
  const items = block.items || []
  if (items.length === 0) return null

  return (
    <div className="gallery-section">
      <header className="section-header">
        <div className="section-title-group">
          {block.label && <span className="section-label">{block.label}</span>}
          <h2 className="section-title">{block.title}</h2>
          {block.subtitle && <p className="section-intro">{block.subtitle}</p>}
        </div>
        <TransitionLink href="#" className="dig-deeper">
          Dig Deeper <span>→</span>
        </TransitionLink>
      </header>
      <div className="obsessions-grid">
        {items.map((item: any) => (
          <GalleryTile key={item.id} item={item} type="feature" />
        ))}
      </div>
    </div>
  )
}

function HeroBlockRenderer({ block }: { block: any }) {
  const heroItem = typeof block.heroItem === 'object' ? block.heroItem : null
  const sideItems = block.sideItems || []

  if (!heroItem) return null

  return (
    <div className="gallery-section">
      <header className="section-header">
        <div className="section-title-group">
          {block.label && <span className="section-label">{block.label}</span>}
          <h2 className="section-title">{block.title}</h2>
        </div>
      </header>

      <div className="selection-layout">
        <div className="hero-tile">
          <ItemMedia item={heroItem} className="tile-image" />
          <div className="hero-content">
            <span className="hero-label">THE VISIONARY</span>
            <h3 className="hero-title">{heroItem.title}</h3>
            <p className="hero-description">{heroItem.description}</p>
            <div className="hero-actions">
              <TransitionLink href={`/gallery/${heroItem.slug || heroItem.id}`} className="btn btn-primary">Dive In</TransitionLink>
            </div>
          </div>
        </div>

        <div className="selection-side">
          {sideItems.map((item: any) => (
            <div key={item.id} className="side-tile">
              <GalleryTile item={item} type="feature" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ListBlockRenderer({ block }: { block: any }) {
  const items = block.items || []
  if (items.length === 0) return null

  return (
    <div className="gallery-section">
      <header className="section-header">
        <div className="section-title-group">
          {block.label && <span className="section-label">{block.label}</span>}
          <h2 className="section-title">{block.title}</h2>
          {block.subtitle && <p className="section-intro">{block.subtitle}</p>}
        </div>
      </header>
      <div className="pulse-grid">
        {items.map((item: any) => (
          <GalleryTile key={item.id} item={item} type="minimal" />
        ))}
      </div>
    </div>
  )
}

function GalleryTile({ item, type }: { item: any, type: 'feature' | 'minimal' }) {
  if (!item || typeof item !== 'object') return null
  
  const isVideo = item.type === 'video'
  const storedImageUrl = typeof item.image === 'object' && item.image?.url ? item.image.url : ''
  const thumbnailUrl = isVideo 
    ? (storedImageUrl || `https://img.youtube.com/vi/${item.youtubeID || ''}/hqdefault.jpg`)
    : storedImageUrl

  if (type === 'minimal') {
    return (
      <TransitionLink href={`/gallery/${item.slug || item.id}`} className="minimal-tile">
        <img src={thumbnailUrl || ''} alt={item.title || 'Untitled'} className="minimal-tile-image" />
        <span className="minimal-title">{item.title}</span>
      </TransitionLink>
    )
  }

  return (
    <TransitionLink href={`/gallery/${item.slug || item.id}`} className="feature-tile">
      <img src={thumbnailUrl || ''} alt={item.title || 'Untitled'} className="tile-image" />
      <div className="tile-overlay">
        <h3 className="tile-title">{item.title}</h3>
      </div>
    </TransitionLink>
  )
}

function ItemMedia({ item, className }: { item: any, className?: string }) {
  if (!item || typeof item !== 'object') return null

  const isVideo = item.type === 'video'
  const storedImageUrl = typeof item.image === 'object' && item.image?.url ? item.image.url : ''
  const imageUrl = isVideo 
    ? (storedImageUrl || `https://img.youtube.com/vi/${item.youtubeID || ''}/maxresdefault.jpg`)
    : storedImageUrl

  return <img src={imageUrl} alt={item.title || 'Untitled'} className={className} />
}
