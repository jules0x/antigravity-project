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
import { Metadata } from 'next'
import { TiltCard } from '../../components/TiltCard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params
  const payload = await getPayload({ config })
  
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
  
  return {
    title: item ? `${item.title} | Flux` : 'Flux Gallery',
  }
}

export default async function ItemDetailPage(props: { params: Promise<{ slug: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { slug } = await props.params
  const searchParams = await props.searchParams
  const genreParam = typeof searchParams.genre === 'string' ? searchParams.genre : ''
  const albumParam = typeof searchParams.album === 'string' ? searchParams.album : ''
  const playlistParam = typeof searchParams.playlist === 'string' ? searchParams.playlist : ''
  const activeGenreSlugs = genreParam ? genreParam.split(',').filter(Boolean) : []
  let activePlaylist: any = null

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

  let activeGenreNames: string[] = []
  let activeGenreIds: any[] = []

  if (activeGenreSlugs.length > 0) {
    const { docs: genres } = await payload.find({
      collection: 'genres',
      where: { slug: { in: activeGenreSlugs } },
      limit: 10,
    })
    activeGenreIds = genres.map((g) => g.id)
    activeGenreNames = genres.map((g) => g.name)
  }

  if (playlistParam) {
    const playlistDoc = await payload.findByID({
      collection: 'playlists',
      id: playlistParam,
    }).catch(() => null)
    if (playlistDoc) {
      activePlaylist = playlistDoc
    }
  }

  const { docs: allGenres } = await payload.find({
    collection: 'genres',
    limit: 100,
  })
  
  // Calculate which genres have the most items
  const { docs: allItems } = await payload.find({
    collection: 'items',
    limit: 5000,
    depth: 0,
    select: { genres: true }
  })
  
  const genreCounts: Record<string, number> = {}
  for (const i of allItems) {
    if (Array.isArray(i.genres)) {
      for (const g of i.genres) {
        const gId = String(typeof g === 'object' ? g.id : g)
        genreCounts[gId] = (genreCounts[gId] || 0) + 1
      }
    }
  }

  // Exclude current item genres
  const itemGenreIds = Array.isArray(item.genres) 
    ? item.genres.map((g: any) => String(typeof g === 'object' ? g.id : g)) 
    : []
  
  const availableGenres = allGenres.filter((g: any) => {
    const stringId = String(g.id)
    return !itemGenreIds.includes(stringId) && (genreCounts[stringId] || 0) > 0
  })

  // Sort by count (descending)
  availableGenres.sort((a, b) => (genreCounts[String(b.id)] || 0) - (genreCounts[String(a.id)] || 0))
  
  // Take top 20 most popular, then deterministically shuffle so there's some variety per item
  const topPopularGenres = availableGenres.slice(0, 20)
  const shuffleSeed = typeof searchParams.shuffle === 'string' ? searchParams.shuffle : null
  const genreShuffleParam = typeof searchParams.genreShuffle === 'string' ? searchParams.genreShuffle : null

  const genreShuffleSeed = genreShuffleParam || String(item.id)
  const discoverGenres = seededShuffle(topPopularGenres, genreShuffleSeed).slice(0, 5)

  let related: any[] = []

  if (shuffleSeed) {
    // DEEP SHUFFLE: Fetch a large pool from the entire filtered collection
    const deepWhere: any = { type: { equals: item.type } }
    if (activeGenreIds.length > 0) deepWhere.genres = { in: activeGenreIds }
    if (albumParam) deepWhere.album = { equals: albumParam }
    if (playlistParam) deepWhere.playlist = { equals: playlistParam }

    const { docs: allPossible } = await payload.find({
      collection: 'items',
      where: deepWhere,
      limit: 200, // Large pool for deep shuffling
      depth: 2,
    })
    
    // Remove current item and shuffle
    const otherItems = allPossible.filter(i => i.id !== item.id)
    related = seededShuffle(otherItems, shuffleSeed)
  } else {
    // SEQUENTIAL: Fetch upcoming items forward in time
    const whereClause: any = {
      type: { equals: item.type },
      createdAt: { greater_than: item.createdAt },
      id: { not_equals: item.id },
    }
    if (activeGenreIds.length > 0) whereClause.genres = { in: activeGenreIds }
    if (albumParam) whereClause.album = { equals: albumParam }
    if (playlistParam) whereClause.playlist = { equals: playlistParam }

    let { docs: sequential } = await payload.find({
      collection: 'items',
      where: whereClause,
      sort: 'createdAt',
      limit: 100,
    })

    // Wrap around to the beginning if we hit the end
    if (sequential.length < 8) {
      const wrapWhereClause: any = {
        type: { equals: item.type },
        createdAt: { less_than: item.createdAt },
      }
      if (activeGenreIds.length > 0) wrapWhereClause.genres = { in: activeGenreIds }
      if (playlistParam) wrapWhereClause.playlist = { equals: playlistParam }

      const { docs: wrapAround } = await payload.find({
        collection: 'items',
        where: wrapWhereClause,
        sort: 'createdAt',
        limit: 100 - sequential.length,
      })
      sequential = [...sequential, ...wrapAround]
    }
    related = sequential
  }

  // Split for UI: 3 for sidebar, next 97 for bottom grid
  const sidebarItems = related.filter(Boolean).slice(0, 3)
  const bottomGridItems = related.filter(Boolean).slice(3, 100)

  const isVideo = item.type === 'video'
  const author = item.author && typeof item.author === 'object' ? item.author : null

  return (
    <div className="details-container">
      <div className="main-content">
        {/* Breadcrumbs */}
        <nav className="breadcrumbs">
          <TransitionLink href="/gallery">GALLERY</TransitionLink>
          <span className="separator">/</span>
          {activePlaylist ? (
            <>
              <TransitionLink href={`/gallery?playlist=${activePlaylist.id}`}>{activePlaylist.title.toUpperCase()}</TransitionLink>
              <span className="separator">/</span>
            </>
          ) : activeGenreNames.length > 0 ? (
            <>
              <span className="current">{activeGenreNames.join(' + ').toUpperCase()}</span>
              <span className="separator">/</span>
            </>
          ) : null}
          <span className="current">{item.title}</span>
        </nav>

        {/* Video Player */}
        <div className="video-header" style={{ viewTransitionName: `thumbnail-${item.slug || item.id}` }}>
          {isVideo ? (
            <VideoPlayer
              youtubeID={item.youtubeID}
              nextUrl={sidebarItems[0] ? `/gallery/${sidebarItems[0].slug || sidebarItems[0].id}?${new URLSearchParams({
                ...(genreParam ? { genre: genreParam } : {}),
                ...(playlistParam ? { playlist: playlistParam } : {}),
              }).toString()}` : undefined}
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
            {item.genres?.map((genre: any) => {
              const genreObj = typeof genre === 'object' ? genre : null
              if (!genreObj) return null

              const genreSlug = genreObj.slug
              const genreId = String(genreObj.id)
              const genreName = genreObj.name || 'GENRE'
              const colorClass = genreObj.color || 'secondary'

              const currentIdentifier = genreSlug || genreId
              const isActive = activeGenreSlugs.includes(genreSlug) || activeGenreSlugs.includes(genreId)

              // Multi-select toggle logic
              const nextGenres = isActive
                ? activeGenreSlugs.filter(s => s !== genreSlug && s !== genreId)
                : [...activeGenreSlugs, currentIdentifier]

              const nextSeed = Math.random().toString(36).substring(7)
              const baseUrl = `/gallery/${item.slug || item.id}`
              const queryParams = new URLSearchParams()
              if (nextGenres.length > 0) queryParams.set('genre', nextGenres.join(','))
              queryParams.set('shuffle', nextSeed)

              const nextUrl = `${baseUrl}?${queryParams.toString()}`

              return (
                <TransitionLink
                  href={nextUrl}
                  key={genreObj.id}
                  className={`label-pill ${colorClass} ${isActive ? 'active' : ''}`}
                >
                  {genreName.toUpperCase()}
                </TransitionLink>
              )
            })}

            {/* {item.album && typeof item.album === 'object' && (
              <TransitionLink
                href={`/gallery/${item.slug || item.id}?album=${item.album.id}&shuffle=${Math.random().toString(36).substring(7)}`}
                className="label-pill tertiary"
              >
                ALBUM: {item.album.title.toUpperCase()}
              </TransitionLink>
            )} */}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
            <h1 className="item-title">{item.title}</h1>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <ItemActions itemId={item.id} />
              {(related as any[])[0] && (
                <TransitionLink
                  href={`/gallery/${(related as any[])[0].slug || (related as any[])[0].id}?${new URLSearchParams({
                    ...(genreParam ? { genre: genreParam } : {}),
                    ...(playlistParam ? { playlist: playlistParam } : {}),
                  }).toString()}`}
                  className="skip-btn"
                  aria-label="Play Next"
                  title="Play Next"
                  transitionName={`thumbnail-${(related as any[])[0]?.slug || (related as any[])[0]?.id}`}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                    <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
                  </svg>
                </TransitionLink>
              )}
            </div>
          </div>
          <div className="item-stats">
            {/* <span>{item.views || '0'} VIEWS</span> */}
            {/* <span> </span> */}
            {author && (
              <>
                {/* <span>•</span> */}
                <span>{author.name.toUpperCase()}</span>
              </>
            )}
            {/* <span>•</span> */}
            {/* <span>{new Date(item.createdAt).toLocaleDateString()}</span> */}
          </div>
        </div>

        <div style={{ paddingTop: '20px', viewTransitionName: 'vibes-section' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="tech-specs-title" style={{ margin: 0 }}>Explore Vibes</h2>
            <ShuffleControl paramName="genreShuffle" />
          </div>
          <div className="labels-row">
            {discoverGenres.map((g: any) => {
              const genreSlug = g.slug
              const genreId = String(g.id)
              const currentIdentifier = genreSlug || genreId
              const isActive = activeGenreSlugs.includes(genreSlug) || activeGenreSlugs.includes(genreId)

              // Multi-select toggle logic
              const nextGenres = isActive
                ? activeGenreSlugs.filter(s => s !== genreSlug && s !== genreId)
                : [...activeGenreSlugs, currentIdentifier]

              const nextSeed = Math.random().toString(36).substring(7)
              const baseUrl = `/gallery/${item.slug || item.id}`
              const queryParams = new URLSearchParams()
              
              // Maintain other params
              if (playlistParam) queryParams.set('playlist', playlistParam)
              if (albumParam) queryParams.set('album', albumParam)
              if (nextGenres.length > 0) queryParams.set('genre', nextGenres.join(','))
              queryParams.set('shuffle', nextSeed)

              const nextUrl = `${baseUrl}?${queryParams.toString()}`

              return (
                <TransitionLink
                  key={g.id}
                  href={nextUrl}
                  className={`label-pill ${g.color} ${isActive ? 'active' : ''}`}
                >
                  {g.name.toUpperCase()}
                </TransitionLink>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <h3 className="sidebar-section-title">
            <span>
              {activePlaylist ? `PLAYLIST: ${activePlaylist.title.toUpperCase()}` : (activeGenreNames.length > 0 ? `MORE ${activeGenreNames.join(', ')}` : 'Related Masterpieces')}
            </span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <ShuffleControl />
              {(activeGenreSlugs.length > 0 || playlistParam) && (
                <TransitionLink href={`/gallery/${item.slug || item.id}`} style={{ textDecoration: 'none' }}>
                  CLEAR
                </TransitionLink>
              )}
            </div>
          </h3>
          <div className="related-list" style={{ viewTransitionName: 'sidebar-list' }}>
            {sidebarItems.map((rel: any, index: number) => {
              const queryParams = new URLSearchParams()
              if (genreParam) queryParams.set('genre', genreParam)
              if (playlistParam) queryParams.set('playlist', playlistParam)
              const queryString = queryParams.toString()
              
              const glowColors = ['#818cf8', '#34d399', '#fb7185', '#fbbf24', '#22d3ee', '#a855f7', '#ec4899']
              const glowColor = glowColors[index % glowColors.length]
              
              return (
                <TiltCard key={rel.id} glowColor={glowColor}>
                  <TransitionLink
                    href={`/gallery/${rel.slug || rel.id}${queryString ? `?${queryString}` : ''}`}
                    className={`related-card ${index === 0 ? 'featured' : ''}`}
                    style={{ 
                      viewTransitionName: `sidebar-slot-${index}` 
                    }}
                    transitionName={`thumbnail-${rel.slug || rel.id}`}
                  >
                    <div className="related-thumb-container">
                      <img
                        src={typeof rel.image === 'object' && rel.image?.url ? rel.image.url : (rel.type === 'video' ? `https://img.youtube.com/vi/${rel.youtubeID}/hqdefault.jpg` : '')}
                        alt={rel.title || 'Untitled'}
                        className="related-thumb"
                      />
                      {rel.duration && <span className="duration-tag">{rel.duration}</span>}
                    </div>
                    <span className="related-title">{rel.title}</span>
                  </TransitionLink>
                </TiltCard>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Secondary Item Grid */}
      <div className="secondary-grid-section">
        <h2 className="tech-specs-title">Discover More</h2>
        <div className="secondary-item-grid">
          {bottomGridItems.map((rel: any, index: number) => {
            const glowColors = ['#818cf8', '#34d399', '#fb7185', '#fbbf24', '#22d3ee', '#a855f7', '#ec4899']
            const glowColor = glowColors[index % glowColors.length]
            
            return (
              <TiltCard key={rel.id} glowColor={glowColor}>
                <TransitionLink
                  href={`/gallery/${rel.slug || rel.id}`}
                  className="grid-item-card"
                  style={{ viewTransitionName: `thumbnail-${rel.slug || rel.id}` }}
                >
                  <div className="grid-item-thumb-container">
                    <img
                      src={typeof rel.image === 'object' && rel.image?.url ? rel.image.url : (rel.type === 'video' ? `https://img.youtube.com/vi/${rel.youtubeID}/hqdefault.jpg` : '')}
                      alt={rel.title || 'Untitled'}
                      className="grid-item-thumb"
                    />
                    {rel.duration && <span className="duration-tag">{rel.duration}</span>}
                  </div>
                  <div className="grid-item-info">
                    <span className="grid-item-title">{rel.title}</span>
                  </div>
                </TransitionLink>
              </TiltCard>
            )
          })}
        </div>
      </div>
    </div>
  )
}
