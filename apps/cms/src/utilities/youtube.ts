export interface YouTubeMetadata {
  title: string
  description: string
  author?: string
}

export async function getYouTubeMetadata(youtubeID: string): Promise<YouTubeMetadata> {
  const url = `https://www.youtube.com/watch?v=${youtubeID}`
  
  try {
    // 1. Fetch oEmbed for Title & Author
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    const oembedRes = await fetch(oembedUrl)
    const oembedData = oembedRes.ok ? await oembedRes.json() : {}

    // 2. Fetch HTML for Description (meta scraping)
    const htmlRes = await fetch(url)
    const html = htmlRes.ok ? await htmlRes.text() : ''
    
    // Extract meta description
    const descMatch = html.match(/<meta name="description" content="([^"]*)"/)
    let description = descMatch ? descMatch[1] : ''
    
    // Clean up HTML entities in description (basic)
    description = description
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\.\.\.$/, '') // Remove trailing ellipsis usually added by YouTube

    return {
      title: oembedData.title || 'Untitled Video',
      author: oembedData.author_name || 'Unknown Author',
      description: description || `Archival footage of ${youtubeID}.`,
    }
  } catch (error) {
    console.error('Error fetching YouTube metadata:', error)
    return {
      title: 'Untitled Video',
      description: 'Metadata unavailable.',
    }
  }
}
