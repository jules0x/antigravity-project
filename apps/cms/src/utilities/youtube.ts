export interface YouTubeMetadata {
  title: string
  description: string
  authorName: string
  authorAvatar: string
  subscribers: string
  views: string
  category: string
  keywords: string
  uploadDate: string
  duration: string
}

export async function getYouTubeMetadata(youtubeID: string): Promise<YouTubeMetadata | null> {
  const url = `https://www.youtube.com/watch?v=${youtubeID}`
  console.log(`[SCRAPE] Fetching metadata for ${youtubeID}...`)
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })
    
    if (!res.ok) {
      console.warn(`[SCRAPE] Fetch failed for ${youtubeID}: Status ${res.status}`)
      return null
    }

    const html = await res.text()
    
    // 1. Basic Meta Tags
    const titleMatch = html.match(/<meta name="title" content="([^"]*)"/) || html.match(/<title>([^<]*)<\/title>/)
    const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : 'Untitled Video'

    const descMatch = html.match(/<meta name="description" content="([^"]*)"/)
    let description = descMatch ? descMatch[1] : ''
    
    // Clean up HTML entities in description
    description = description
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\.\.\.$/, '')

    const keywords = html.match(/<meta name="keywords" content="([^"]*)"/)?.[1] || ''
    const category = html.match(/<meta itemprop="genre" content="([^"]*)"/)?.[1] || ''
    const uploadDate = html.match(/<meta itemprop="datePublished" content="([^"]*)"/)?.[1] || ''
    const durationISO = html.match(/<meta itemprop="duration" content="([^"]*)"/)?.[1] || ''
    
    // Format duration from ISO 8601 (PT4M15S) to HH:MM:SS
    let duration = '00:00'
    if (durationISO) {
      const match = durationISO.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
      if (match) {
        const h = match[1] ? match[1].padStart(2, '0') : ''
        const m = match[2] ? match[2].padStart(2, '0') : '00'
        const s = match[3] ? match[3].padStart(2, '0') : '00'
        duration = h ? `${h}:${m}:${s}` : `${m}:${s}`
      }
    }

    // 2. ytInitialData (Advanced Metrics)
    const dataMatch = html.match(/var ytInitialData = ({.*?});<\/script>/)
    let subscribers = 'N/A'
    let views = '0'
    let authorAvatar = ''
    let authorName = 'Unknown Author'

    if (dataMatch) {
      try {
        const data = JSON.parse(dataMatch[1])
        const contents = data.contents?.twoColumnWatchNextResults?.results?.results?.contents || []
        
        // Secondary Info contains Owner/Channel info
        const videoSecondaryInfo = contents.find((c: any) => c.videoSecondaryInfoRenderer)?.videoSecondaryInfoRenderer
        // Primary Info contains Views/Date info
        const videoPrimaryInfo = contents.find((c: any) => c.videoPrimaryInfoRenderer)?.videoPrimaryInfoRenderer

        const owner = videoSecondaryInfo?.owner?.videoOwnerRenderer
        authorName = owner?.title?.runs?.[0]?.text || 'Unknown Author'
        subscribers = owner?.subscriberCountText?.simpleText || 'N/A'
        authorAvatar = owner?.thumbnail?.thumbnails?.pop()?.url || ''
        
        const rawViews = videoPrimaryInfo?.viewCount?.videoViewCountRenderer?.viewCount?.simpleText || '0'
        views = rawViews.replace(/[^0-9,MK]/g, '')
      } catch (e) {
        console.error("[SCRAPE] JSON Parse error for ytInitialData", e)
      }
    }

    return {
      title,
      description,
      authorName,
      authorAvatar,
      subscribers,
      views,
      category,
      keywords,
      uploadDate,
      duration,
    }

  } catch (error) {
    console.error(`[SCRAPE] Fatal error fetching metadata for ${youtubeID}:`, error)
    return null
  }
}
