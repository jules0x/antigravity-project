import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import { TransitionLink } from '../../components/TransitionLink'
import { VideoPlayer } from '../../components/VideoPlayer'
import './details.css'
import ItemActions from '../../components/ItemActions'
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

  const item = items[0] as any

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
    limit: shuffleSeed ? 40 : 24,
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
      limit: 24 - related.length,
    })
    related = [...related, ...wrapAround]
  }

  // Shuffle logic
  if (shuffleSeed) {
    related = seededShuffle(related, shuffleSeed)
  }

  // Split for UI: 6 for sidebar, next 12 for bottom grid
  const sidebarItems = related.filter(Boolean).slice(0, 6)
  const bottomGridItems = related.filter(Boolean).slice(6, 18)

  const isVideo = item.type === 'video'
  const author = item.author && typeof item.author === 'object' ? item.author : null

  return (
    <div className="details-container">
      <div className="main-content">
        {/* Breadcrumbs */}
        <nav className="breadcrumbs">
          <TransitionLink href="/gallery">GALLERY</TransitionLink>
          <span className="separator">/</span>
          <span className="current">{item.title}</span>
        </nav>

        {/* Video Player */}
        <div className="video-header" style={{ viewTransitionName: `thumbnail-${item.slug || item.id}` }}>
          {isVideo ? (
            <VideoPlayer 
              youtubeID={item.youtubeID} 
              nextUrl={sidebarItems[0] ? `/gallery/${sidebarItems[0].slug || sidebarItems[0].id}${activeTagSlugs.length > 0 ? `?tag=${activeTagSlugs.join(',')}` : ''}` : undefined}
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
                <TransitionLink
                  href={nextUrl}
                  key={tagObj.id}
                  className={`label-pill ${colorClass} ${isActive ? 'active' : ''}`}
                >
                  {tagName}
                </TransitionLink>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
            <h1 className="item-title">{item.title}</h1>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <ItemActions itemId={item.id} />
              {(related as any[])[0] && (
                <TransitionLink
                  href={`/gallery/${(related as any[])[0].slug || (related as any[])[0].id}${tagParam ? `?tag=${tagParam}` : ''}`}
                  className="skip-btn"
                  aria-label="Play Next"
                  title="Play Next"
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                    <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
                  </svg>
                </TransitionLink>
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
            {(author?.avatar || author?.externalAvatar) && (
              <img
                src={typeof author.avatar === 'object' ? (author.avatar.url || '') : (author.externalAvatar || '')}
                alt={author.name}
                className="author-avatar"
              />
            )}
            <div className="author-details">
              <span className="author-name">
                {author?.name || 'Unknown Author'}
              </span>
              <span className="author-subs">{author?.subscribers || '0'} SUBSCRIBERS</span>
            </div>
          </div>
        </div>

        {/* Technical Specification Section */}
        <div className="tech-specs">
          <h2 className="tech-specs-title">Technical Specification</h2>
          <div className="specs-grid">
            <div className="spec-item">
              <span className="spec-label">CATEGORY</span>
              <span className="spec-value">{item.category || 'N/A'}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">UPLOAD DATE</span>
              <span className="spec-value">{item.uploadDate || 'N/A'}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">KEYWORDS</span>
              <span className="spec-value keywords-list">{item.keywords || 'N/A'}</span>
            </div>
            {item.likes && (
              <div className="spec-item">
                <span className="spec-label">LIKES</span>
                <span className="spec-value">{item.likes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Item Grid */}
        <div className="secondary-grid-section">
          <h2 className="tech-specs-title">Discover More</h2>
          <div className="secondary-item-grid">
            {bottomGridItems.map((rel: any) => (
              <TransitionLink
                href={`/gallery/${rel.slug || rel.id}`}
                key={rel.id}
                className="grid-item-card"
                style={{ viewTransitionName: `thumbnail-${rel.slug || rel.id}` }}
              >
                <div className="grid-item-thumb-container">
                  <img
                    src={rel.type === 'video' ? `https://img.youtube.com/vi/${rel.youtubeID}/hqdefault.jpg` : (typeof rel.image === 'object' ? (rel.image?.url || '') : '')}
                    alt={rel.title || 'Untitled'}
                    className="grid-item-thumb"
                  />
                  {rel.duration && <span className="duration-tag">{rel.duration}</span>}
                </div>
                <div className="grid-item-info">
                  <span className="grid-item-title">{rel.title}</span>
                </div>
              </TransitionLink>
            ))}
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
                <TransitionLink href={`/gallery/${item.slug || item.id}`} style={{ textDecoration: 'none' }}>
                  CLEAR
                </TransitionLink>
              )}
            </div>
          </h3>
          <div className="related-list" style={{ viewTransitionName: 'sidebar-list' }}>
            {sidebarItems.map((rel: any, index: number) => {
              const tagParam = activeTagSlugs.join(',')
              return (
                <TransitionLink
                  href={`/gallery/${rel.slug || rel.id}${tagParam ? `?tag=${tagParam}` : ''}`}
                  key={rel.id}
                  className={`related-card ${index === 0 ? 'featured' : ''}`}
                  style={{ viewTransitionName: `thumbnail-${rel.slug || rel.id}` }}
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
                </TransitionLink>
              )
            })}
          </div>
        </div>
      </aside>
    </div>
  )
}
