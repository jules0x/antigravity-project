
async function testScrape(vid) {
  const url = `https://www.youtube.com/watch?v=${vid}`;
  console.log(`Testing ${url}...`);
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    
    // 1. Basic Meta Tags
    const metaDesc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] || '';
    const metaKeywords = html.match(/<meta name="keywords" content="([^"]*)"/)?.[1] || '';
    const metaCategory = html.match(/<meta itemprop="genre" content="([^"]*)"/)?.[1] || '';
    const uploadDate = html.match(/<meta itemprop="datePublished" content="([^"]*)"/)?.[1] || '';
    const duration = html.match(/<meta itemprop="duration" content="([^"]*)"/)?.[1] || '';

    // 2. ytInitialData (The juicy stuff)
    const dataMatch = html.match(/var ytInitialData = ({.*?});<\/script>/);
    let subscribers = 'N/A';
    let views = 'N/A';
    let authorAvatar = '';
    let channelName = '';

    if (dataMatch) {
      try {
        const data = JSON.parse(dataMatch[1]);
        const contents = data.contents?.twoColumnWatchNextResults?.results?.results?.contents || [];
        
        // Secondary Info contains Owner/Channel info
        const videoSecondaryInfo = contents.find(c => c.videoSecondaryInfoRenderer)?.videoSecondaryInfoRenderer;
        // Primary Info contains Views/Date info
        const videoPrimaryInfo = contents.find(c => c.videoPrimaryInfoRenderer)?.videoPrimaryInfoRenderer;

        const owner = videoSecondaryInfo?.owner?.videoOwnerRenderer;
        channelName = owner?.title?.runs?.[0]?.text || '';
        subscribers = owner?.subscriberCountText?.simpleText || 'N/A';
        authorAvatar = owner?.thumbnail?.thumbnails?.pop()?.url || '';
        
        views = videoPrimaryInfo?.viewCount?.videoViewCountRenderer?.viewCount?.simpleText || 'N/A';
      } catch (e) {
        console.error("JSON Parse error", e);
      }
    }

    console.log(JSON.stringify({
      channelName,
      metaDesc,
      metaKeywords,
      metaCategory,
      uploadDate,
      duration,
      subscribers,
      views,
      authorAvatar
    }, null, 2));

  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testScrape('v0MkJtI3FvU');
