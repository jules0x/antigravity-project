import { BasePayload } from 'payload'
import { getYouTubeMetadata } from './youtube'
import { getMusicMetadata } from './musicbrainz'

// String to URL utility
const formatSlug = (val: string): string => {
  return val.replace(/ /g, '-').replace(/[^\w-]+/g, '').toLowerCase()
}

const GENRE_COLORS = ['indigo', 'emerald', 'rose', 'amber', 'cyan'] as const

// Utility to decode HTML entities like &quot;
const decodeHTMLEntities = (text: string): string => {
  if (!text) return text
  return text
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
}

// Utility to clean titles (remove bracketed noise like (Official Video))
const cleanTitle = (title: string): string => {
  if (!title) return title
  let cleaned = decodeHTMLEntities(title).trim()
  
  // Greedy pattern to remove bracketed noise anywhere at the end
  const noisePattern = /\s*[([].*[)\]]\s*$/gi
  // Catching common YouTube suffixes that might not be in brackets
  const extraNoise = /\s*(OFFICIAL VIDEO|OFFICIAL LYRIC VIDEO|LYRIC VIDEO|HD|HQ|4K|FULL ALBUM|ALBUM)\s*$/gi

  let lastLength = -1
  while (cleaned.length !== lastLength) {
    lastLength = cleaned.length
    cleaned = cleaned.replace(noisePattern, '').trim()
    cleaned = cleaned.replace(extraNoise, '').trim()
  }

  // If we cleaned it all away, return original trimmed
  if (cleaned.length === 0) return decodeHTMLEntities(title).trim()
  
  return cleaned
}

async function downloadYoutubeThumbnail(payload: BasePayload, youtubeID: string, title: string) {
  try {
    const urls = [
      `https://img.youtube.com/vi/${youtubeID}/maxresdefault.jpg`,
      `https://img.youtube.com/vi/${youtubeID}/hqdefault.jpg`
    ]
    
    let res: Response | null = null
    for (const url of urls) {
      res = await fetch(url)
      if (res.ok) break
    }
    
    if (!res || !res.ok) return null
    
    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: `Thumbnail for ${title}`,
      },
      file: {
        data: buffer,
        name: `${youtubeID}.jpg`,
        mimetype: 'image/jpeg',
        size: buffer.byteLength,
      }
    })
    
    return media.id
  } catch (err) {
    console.error(`[ENRICH] Failed to download thumbnail for ${youtubeID}:`, err)
    return null
  }
}

export async function enrichItem(payload: BasePayload, data: any, force = false) {
  if (data.type !== 'video' || !data.youtubeID) return

  const hasGenres = Array.isArray(data.genres) && data.genres.length > 0
  const hasAlbum = !!data.album
  const wasEnriched = !!data.wasEnriched
  
  console.log(`[ENRICH] Processing ${data.title || data.youtubeID}...`)
  const metadata = await getYouTubeMetadata(data.youtubeID)
  
  // Always clean the title from YouTube or existing data
  const originalTitle = metadata?.title || data.title
  data.title = cleanTitle(originalTitle)

  // Only proceed with deeper enrichment if missing metadata or forced
  const needsEnrichment = force || (!wasEnriched && !hasGenres && !hasAlbum)
  
  if (!needsEnrichment) {
    // We already have the core data, just download thumbnail if missing
    if (!data.image && data.youtubeID) {
      console.log(`[ENRICH] Downloading thumbnail for ${data.youtubeID}...`)
      const mediaId = await downloadYoutubeThumbnail(payload, data.youtubeID, data.title)
      if (mediaId) {
        data.image = mediaId
      }
    }
    return data
  }

  if (!metadata) {
    console.log(`[ENRICH] Failed to fetch YouTube metadata for ${data.youtubeID}`)
    return data
  }



  // 1. Handle Author Linking (Idempotent)
  const authorRes = await payload.find({
    collection: 'authors',
    where: { name: { equals: metadata.authorName } },
  })

  let authorId
  if (authorRes.totalDocs > 0) {
    authorId = authorRes.docs[0].id
  } else {
    const newAuthor = await payload.create({
      collection: 'authors',
      data: {
        name: metadata.authorName,
        subscribers: metadata.subscribers,
        externalAvatar: metadata.authorAvatar,
        verified: true as any,
      },
    })
    authorId = newAuthor.id
  }

  // 2. Populate basic metadata
  data.author = authorId
  data.description = data.description || metadata.description
  data.duration = data.duration || metadata.duration
  data.views = data.views || metadata.views
  data.category = data.category || metadata.category
  data.keywords = data.keywords || metadata.keywords
  data.uploadDate = data.uploadDate || metadata.uploadDate
  data.slug = data.slug || `${formatSlug(data.title)}-${data.youtubeID}`
  // Cleaned title is already in data.title
  
  // 3. Download Thumbnail if missing
  if (!data.image && data.youtubeID) {
    console.log(`[ENRICH] Downloading thumbnail for ${data.youtubeID}...`)
    const mediaId = await downloadYoutubeThumbnail(payload, data.youtubeID, data.title)
    if (mediaId) {
      data.image = mediaId
    }
  }

  // Mark as enriched to avoid re-processing
  data.wasEnriched = true

  // 3. Music Metadata Enrichment
  const music = await getMusicMetadata(data.title, metadata.authorName)
  
  if (music) {
    console.log(`[ENRICH] Music found: ${music.album || 'No Album'} (${music.genres?.join(', ') || 'No Genres'})`)
    // Handle Genres
    if (music.genres && music.genres.length > 0) {
      const genreIds = []
      for (const gName of music.genres) {
        const gSlug = formatSlug(gName)
        const res = await payload.find({
          collection: 'genres',
          where: { slug: { equals: gSlug } },
        })
        if (res.totalDocs > 0) {
          genreIds.push(res.docs[0].id)
        } else {
          const newG = await payload.create({
            collection: 'genres',
            data: { 
              name: gName,
              slug: formatSlug(gName),
              color: GENRE_COLORS[Math.floor(Math.random() * GENRE_COLORS.length)]
            },
          })
          genreIds.push(newG.id)
        }
      }
      
      // Merge with any genres already on the item (e.g. from the Playlist)
      const existingGenres = Array.isArray(data.genres) 
        ? data.genres.map((g: any) => typeof g === 'object' ? g.id || g : g)
        : []
      data.genres = Array.from(new Set([...existingGenres, ...genreIds]))
    }

    // Handle Album
    if (music.album) {
      const albumSlug = formatSlug(music.album)
      const res = await payload.find({
        collection: 'albums',
        where: { slug: { equals: albumSlug } },
      })
      if (res.totalDocs > 0) {
        data.album = res.docs[0].id
      } else {
        const newA = await payload.create({
          collection: 'albums',
          data: { 
            title: music.album, 
            artist: authorId,
            releaseDate: music.releaseDate 
          },
        })
        data.album = newA.id
      }
    }
  }

  return data
}
