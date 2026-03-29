export interface MusicMetadata {
  album?: string
  genres?: string[]
  releaseDate?: string
}

export async function getMusicMetadata(title: string, author: string): Promise<MusicMetadata | null> {
  // 1. Try to parse Artist/Title from YouTube title (Artist - Title)
  let searchTitle = title
  let searchArtist = author

  // Patterns like "Artist - Title", "Artist- Title", etc.
  const dashMatch = title.match(/^(.+?)\s?-\s?(.+?)(?:\s?[|([]|$)/)
  if (dashMatch) {
    searchArtist = dashMatch[1].trim()
    searchTitle = dashMatch[2].trim()
  } else {
    // If no dash, maybe the author is the artist?
    // But we'll try to refine the title by removing common suffixes
    searchTitle = title.replace(/\s?[|([].*$/, '').trim()
  }

  console.log(`[MB] Querying Recording: "${searchTitle}" (Artist: "${searchArtist}")`)

  try {
    // 1. Search for recording
    const searchUrl = `https://musicbrainz.org/ws/2/recording?query=recording:"${encodeURIComponent(searchTitle)}" AND artist:"${encodeURIComponent(searchArtist)}"&fmt=json`
    console.log(`[MB] API URL (1): ${searchUrl}`)
    
    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Antigravity/1.0.0 ( julian@example.com )' }
    })

    if (!searchRes.ok) {
      console.error(`[MB] API Error (${searchRes.status}): ${searchRes.statusText}`)
      return null
    }

    let searchData = await searchRes.json()
    let recordings = searchData.recordings || []
    console.log(`[MB] Found ${recordings.length} results via Artist+Recording search.`)

    // 2. Fallback: Search by title only if artist search failed
    if (recordings.length === 0) {
        console.log(`[MB] Falling back to Title-only search for "${searchTitle}"`)
        const fallbackUrl = `https://musicbrainz.org/ws/2/recording?query=recording:"${encodeURIComponent(searchTitle)}"&fmt=json`
        console.log(`[MB] API URL (2): ${fallbackUrl}`)
        
        const fallbackRes = await fetch(fallbackUrl, {
            headers: { 'User-Agent': 'Antigravity/1.0.0 ( julian@example.com )' }
        })
        if (fallbackRes.ok) {
            searchData = await fallbackRes.json()
            const allFound = searchData.recordings || []
            console.log(`[MB] Title-only search found ${allFound.length} candidates.`)
            
            recordings = allFound.filter((r: any) => {
                const artistName = (r['artist-credit']?.[0]?.name || '').toLowerCase()
                const match = title.toLowerCase().includes(artistName) || author.toLowerCase().includes(artistName)
                if (match) console.log(`[MB] Found potential match: Artist "${artistName}" present in original string.`)
                return match
            })
            console.log(`[MB] Filtered down to ${recordings.length} relevant candidate(s).`)
        }
    }

    if (recordings.length === 0) {
      console.log(`[MB] No matches found across any search strategy.`)
      return null
    }

    const recording = recordings[0]
    const mbid = recording.id
    console.log(`[MB] Successfully matched recording: ID ${mbid}`)

    // 2. Lookup detailed info (genres, releases)
    const lookupUrl = `https://musicbrainz.org/ws/2/recording/${mbid}?inc=genres+releases&fmt=json`
    const lookupRes = await fetch(lookupUrl, {
      headers: { 'User-Agent': 'Antigravity/1.0.0 ( julian@example.com )' }
    })

    if (!lookupRes.ok) {
        console.warn(`[MUSICBRAINZ] Lookup failed: ${lookupRes.status}`)
        // Fallback to what we have in search result
        return {
            album: recording['releases']?.[0]?.title,
            releaseDate: recording['releases']?.[0]?.date,
        }
    }

    const data = await lookupRes.json()
    
    const genres = (data.genres || []).map((g: any) => g.name)
    const release = data.releases?.[0]

    return {
      album: release?.title,
      genres: genres.length > 0 ? genres : undefined,
      releaseDate: release?.date,
    }

  } catch (error) {
    console.error(`[MUSICBRAINZ] Fatal error:`, error)
    return null
  }
}
