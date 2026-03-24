/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import './details.css'
import ItemActions from '../../components/ItemActions'
import FavoritesSidebar from '../../components/FavoritesSidebar'
import ShuffleControl from '../../components/ShuffleControl'
import { seededShuffle } from '@/utilities/shuffle'

export default async function ItemDetailPage(props: { params: Promise<{ slug: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { slug } = await props.params
  const searchParams = await props.searchParams
  const tagParam = typeof searchParams.tag === 'string' ? searchParams.tag : ''
  const activeTagSlugs = tagParam ? tagParam.split(',').filter(Boolean) : []

  const payload = await getPayload({ config })

  // Find the item by slug, fallback to ID if historic numerical payload
  const { docs: items } = await payload.find({
    collection: 'items',
    where: {
      or: [
        { slug: { equals: slug } },
        { id: { equals: !isNaN(Number(slug)) ? Number(slug) : slug } }
      ]
    },
    limit: 1,
  }).catch(() => ({ docs: [] }))

  const item = items[0]

  if (!item) {
    return notFound()
  }

  let activeTagNames: string[] = []
  let activeTagIds: any[] = []

  if (activeTagSlugs.length > 0) {
    const { docs: tags } = await payload.find({
      collection: 'tags',
      where: { slug: { in: activeTagSlugs } },
      limit: 10,
    })
    activeTagNames = tags.map((t) => t.name)
    activeTagIds = tags.map((t) => t.id)
  }

  const whereClause: any = {
    type: { equals: item.type },
    createdAt: { greater_than: item.createdAt },
    id: { not_equals: item.id }, // Failsafe for identical timestamps
  }
  if (activeTagIds.length > 0) whereClause.tags = { in: activeTagIds }

  const shuffleSeed = typeof searchParams.shuffle === 'string' ? searchParams.shuffle : null

  // Fetch a stable list of upcoming items (forward in time)
  let { docs: related } = await payload.find({
    collection: 'items',
    where: whereClause,
    sort: 'createdAt',
    limit: shuffleSeed ? 40 : 6,
  })

  // If we reach the end of the catalog, wrap around to the beginning
  if (related.length < 6) {
    const wrapWhereClause: any = {
      type: { equals: item.type },
      createdAt: { less_than: item.createdAt },
    }
    if (activeTagIds.length > 0) wrapWhereClause.tags = { in: activeTagIds }

    const { docs: wrapAround } = await payload.find({
      collection: 'items',
      where: wrapWhereClause,
      sort: 'createdAt',
      limit: 6 - related.length,
    })
    related = [...related, ...wrapAround]
  }

  // Shuffle logic
  if (shuffleSeed) {
    related = seededShuffle(related, shuffleSeed)
  }

  // Take the final 6 for the UI
  related = related.filter(Boolean).slice(0, 6)

  const isVideo = item.type === 'video'
  const author = item.author && typeof item.author === 'object' ? item.author : null

  return (
    <div className="details-container">
      <div className="main-content">
        {/* Breadcrumbs */}
        <nav className="breadcrumbs">
          <Link href="/gallery">GALLERY</Link>
          <span className="separator">/</span>
          <span className="current">{item.title}</span>
        </nav>

        {/* Video Player */}
        <div className="video-header">
          {isVideo ? (
            <iframe
              src={`https://www.youtube.com/embed/${item.youtubeID}?autoplay=1&controls=1&showinfo=0&rel=0&modestbranding=1`}
              className="video-player"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <img
              src={typeof item.image === 'object' ? (item.image?.url || '') : ''}
              alt={item.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>

        {/* Title & Info */}
        <div className="item-info">
          <div className="labels-row">
            {item.tags?.map((tag: any) => {
              const tagObj = typeof tag === 'object' ? tag : null
              if (!tagObj) return null

              const tagSlug = tagObj.slug || String(tagObj.id)
              const tagName = tagObj.name || 'TAG'
              const colorClass = tagObj.color || 'primary'
              const isActive = activeTagSlugs.includes(tagSlug)

              // Multi-select toggle logic
              const nextTags = isActive
                ? activeTagSlugs.filter(s => s !== tagSlug)
                : [...activeTagSlugs, tagSlug]

              const nextSeed = Math.random().toString(36).substring(7)
              const baseUrl = `/gallery/${item.slug || item.id}`
              const queryParams = new URLSearchParams()
              if (nextTags.length > 0) queryParams.set('tag', nextTags.join(','))
              queryParams.set('shuffle', nextSeed)

              const nextUrl = `${baseUrl}?${queryParams.toString()}`

              return (
                <Link
                  href={nextUrl}
                  key={tagObj.id}
                  className={`label-pill ${colorClass} ${isActive ? 'active' : ''}`}
                >
                  {tagName}
                </Link>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
            <h1 className="item-title">{item.title}</h1>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <ItemActions itemId={item.id} />
              {(related as any[])[0] && (
                <Link
                  href={`/gallery/${(related as any[])[0].slug || (related as any[])[0].id}${tagParam ? `?tag=${tagParam}` : ''}`}
                  className="skip-btn"
                  aria-label="Play Next"
                  title="Play Next"
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                    <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
          <div className="item-stats">
            <span>{item.views || '0'} VIEWS</span>
            <span> </span>
            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Author Bar */}
        <div className="author-bar">
          <div className="author-info">
            {author?.avatar && (
              <img src={typeof author.avatar === 'object' ? (author.avatar.url || '') : ''} alt={author.name} className="author-avatar" />
            )}
            <div className="author-details">
              <span className="author-name">
                {author?.name || 'Unknown Author'}
              </span>
              <span className="author-subs">{author?.subscribers || '0'} SUBSCRIBERS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <h3 className="sidebar-section-title">
            <span>{activeTagNames.length > 0 ? `MORE ${activeTagNames.join(', ')}` : 'Related Masterpieces'}</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <ShuffleControl />
              {activeTagSlugs.length > 0 && (
                <Link href={`/gallery/${item.slug || item.id}`}>
                  CLEAR ✖
                </Link>
              )}
            </div>
          </h3>
          <div className="related-list">
            {(related as any[]).map((rel: any, index: number) => (
              <Link
                href={`/gallery/${rel.slug || rel.id}${tagParam ? `?tag=${tagParam}` : ''}`}
                key={rel.id}
                className={`related-card ${index === 0 ? 'featured' : ''}`}
              >
                <div className="related-thumb-container">
                  <img
                    src={rel.type === 'video' ? `https://img.youtube.com/vi/${rel.youtubeID}/hqdefault.jpg` : (typeof rel.image === 'object' ? (rel.image?.url || '') : '')}
                    alt={rel.title || 'Untitled'}
                    className="related-thumb"
                  />
                  {rel.duration && <span className="duration-tag">{rel.duration}</span>}
                </div>
                <span className="related-title">{rel.title}</span>
              </Link>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '40px' }}>
          <h3 className="sidebar-section-title">
            Your Favorites
          </h3>
          <FavoritesSidebar />
        </div>
      </aside>
    </div>
  )
}
