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

export default async function ItemDetailPage(props: { params: Promise<{ slug: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { slug } = await props.params
  const searchParams = await props.searchParams
  const tagFilter = typeof searchParams.tag === 'string' ? searchParams.tag : null

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

  let activeTagName = ''
  let activeTagId = null

  if (tagFilter) {
    const { docs: tags } = await payload.find({ collection: 'tags', where: { slug: { equals: tagFilter } }, limit: 1 })
    if (tags.length > 0) {
      activeTagName = tags[0].name
      activeTagId = tags[0].id
    }
  }

  const whereClause: any = {
    type: { equals: item.type },
    createdAt: { greater_than: item.createdAt },
    id: { not_equals: item.id }, // Failsafe for identical timestamps
  }
  if (activeTagId) whereClause.tags = { contains: activeTagId }

  // Fetch a stable list of upcoming items (forward in time)
  let { docs: related } = await payload.find({
    collection: 'items',
    where: whereClause,
    sort: 'createdAt',
    limit: 6,
  })

  // If we reach the end of the catalog, wrap around to the beginning
  if (related.length < 6) {
    const wrapWhereClause: any = {
      type: { equals: item.type },
      createdAt: { less_than: item.createdAt },
    }
    if (activeTagId) wrapWhereClause.tags = { contains: activeTagId }

    const { docs: wrapAround } = await payload.find({
      collection: 'items',
      where: wrapWhereClause,
      sort: 'createdAt',
      limit: 6 - related.length,
    })
    related = [...related, ...wrapAround]
  }

  const isVideo = item.type === 'video'
  const author = item.author && typeof item.author === 'object' ? item.author : null

  return (
    <div className="details-container">
      <div className="main-content">
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
              const isActive = tagFilter === tagSlug
              return (
                 <Link 
                   href={isActive ? `/gallery/${item.slug || item.id}` : `/gallery/${item.slug || item.id}?tag=${tagSlug}`} 
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
                  href={`/gallery/${(related as any[])[0].slug || (related as any[])[0].id}${tagFilter ? `?tag=${tagFilter}` : ''}`} 
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

        {/* Actions Removed (Moved upward) */}

        {/* Description */}
        <div className="description-section">
          <p style={{ lineHeight: '1.6', fontSize: '1.1rem', color: '#ccc' }}>
            {item.description}
          </p>
          
          {item.technicalNotes && (
             <div style={{ marginTop: '40px', padding: '20px', background: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <h4 style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '15px' }}>Technical Notes</h4>
                {/* Simplified rendering of technical notes */}
                <div style={{ fontSize: '0.9rem', color: '#aaa', lineHeight: '1.5' }}>
                  {(item.technicalNotes.root?.children as any[])?.[0]?.children?.[0]?.text || "No technical notes available."}
                </div>
             </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <aside className="sidebar">
        <div>
           <h3 className="sidebar-section-title">
              <span>{activeTagName ? `MORE ${activeTagName}` : 'Related Masterpieces'}</span>
              {activeTagName && (
                <Link href={`/gallery/${item.slug || item.id}`} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.6rem', padding: '4px 8px', border: '1px solid var(--color-primary)', borderRadius: '4px' }}>
                  CLEAR ✖
                </Link>
              )}
           </h3>
           <div className="related-list">
             {(related as any[]).map((rel: any) => (
               <Link href={`/gallery/${rel.slug || rel.id}${tagFilter ? `?tag=${tagFilter}` : ''}`} key={rel.id} className="related-card">
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
