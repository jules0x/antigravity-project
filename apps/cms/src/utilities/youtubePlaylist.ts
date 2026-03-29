/**
 * Utility to extract video IDs from a YouTube playlist URL without using the API.
 * Supports both www.youtube.com and music.youtube.com.
 */
export async function extractVideoIdsFromPlaylist(playlistUrl: string): Promise<string[]> {
  try {
    const isMusic = playlistUrl.includes('music.youtube.com')
    const response = await fetch(playlistUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    })
    const html = await response.text()
    const videoIds: string[] = []

    console.log(`[PLAYLIST] Extracting from ${playlistUrl} (isMusic: ${isMusic}) (HTML Length: ${html.length})`)

    // PRIMARY: Structured JSON data extraction
    if (isMusic) {
      // YouTube Music often hides data in different script tags or as escaped strings
      const musicDataMatches = [
        ...html.matchAll(/initialData\.push\(\s*({.*?})\s*\);/gs),
        ...html.matchAll(/ytInitialData\s*=\s*({.*?});/gs)
      ]

      for (const m of musicDataMatches) {
        const objStr = m[1]
        // Try to find videoIds anywhere in this block of JSON/string
        const idMatches = objStr.matchAll(/"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"/g)
        for (const idMatch of idMatches) {
          videoIds.push(idMatch[1])
        }
      }
    } else {
      // Standard YouTube
      const match = html.match(/ytInitialData = ({.*?});/s)
      if (match) {
        parseStandard(match[1], videoIds)
      }
    }

    // AGGRESSIVE FALLBACK: Search for any "videoId":"(...)" or watch?v= links if we still have nothing
    if (videoIds.length === 0) {
      console.log('[PLAYLIST] Primary extraction failed, falling back to aggressive regex match...')
      
      // 1. "videoId":"(...)" (Standard and hex-escaped variants)
      const patterns = [
        /"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"/g,
        /videoId\\x22:\\x22([a-zA-Z0-9_-]{11})\\x22/g,
        /videoId\\u0022:\\u0022([a-zA-Z0-9_-]{11})\\u0022/g,
        /watch\?v=([a-zA-Z0-9_-]{11})/g
      ]

      for (const pattern of patterns) {
        const matches = html.matchAll(pattern)
        for (const m of matches) {
          videoIds.push(m[1])
        }
      }
    }

    const uniqueIds = [...new Set(videoIds)]
    console.log(`[PLAYLIST] Successfully found ${uniqueIds.length} unique video IDs.`)
    return uniqueIds
  } catch (err: any) {
    console.error('[PLAYLIST] Fatal error extracting IDs:', err.message)
    return []
  }
}

function parseStandard(jsonStr: string, videoIds: string[]) {
  try {
    const json = JSON.parse(jsonStr)
    const tabs = json.contents?.twoColumnBrowseResultsRenderer?.tabs
    
    let contents = null
    if (tabs) {
      const tab = tabs.find((t: any) => t.tabRenderer)?.tabRenderer
      contents = tab?.content?.sectionListRenderer?.contents[0]?.itemSectionRenderer?.contents[0]?.playlistVideoListRenderer?.contents
    } else {
      contents = json.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents[0]?.itemSectionRenderer?.contents[0]?.playlistVideoListRenderer?.contents
    }

    if (contents) {
      contents.forEach((v: any) => {
        const vId = v.playlistVideoRenderer?.videoId || v.musicResponsiveListItemRenderer?.playlistItemData?.videoId
        if (vId) videoIds.push(vId)
      })
    }
  } catch (e: any) {
    console.error('[PLAYLIST] Standard parse error:', e.message)
  }
}
