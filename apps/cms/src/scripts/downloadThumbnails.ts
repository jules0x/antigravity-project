import { getPayload } from 'payload'
import config from '../payload.config'

async function downloadThumbnails() {
  const payload = await getPayload({ config })
  
  // Find all video items that don't have an image set
  const { docs: items } = await payload.find({
    collection: 'items',
    where: {
      and: [
        { type: { equals: 'video' } },
        { 'image': { exists: false } }
      ]
    },
    limit: 500, // Process up to 500 at a time
  })

  console.log(`Found ${items.length} items without thumbnails.`)

  let successCount = 0
  let errorCount = 0

  for (const item of items) {
    if (!item.youtubeID) continue
    
    console.log(`Processing: ${item.title || item.youtubeID}...`)
    try {
      const urls = [
        `https://img.youtube.com/vi/${item.youtubeID}/maxresdefault.jpg`,
        `https://img.youtube.com/vi/${item.youtubeID}/hqdefault.jpg`
      ]
      
      let res: Response | null = null
      for (const url of urls) {
        res = await fetch(url)
        if (res.ok) break
      }
      
      if (!res || !res.ok) {
        console.error(`  -> Failed to download for ${item.youtubeID}`)
        errorCount++
        continue
      }
      
      const arrayBuffer = await res.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      const media = await payload.create({
        collection: 'media',
        data: {
          alt: `Thumbnail for ${item.title || item.youtubeID}`,
        },
        file: {
          data: buffer,
          name: `${item.youtubeID}.jpg`,
          mimetype: 'image/jpeg',
          size: buffer.byteLength,
        }
      })
      
      await payload.update({
        collection: 'items',
        id: item.id,
        data: {
          image: media.id,
        }
      })
      
      console.log(`  -> Saved as media ${media.id}`)
      successCount++
    } catch (err: any) {
      console.error(`  -> Error processing ${item.youtubeID}:`, err.message)
      errorCount++
    }
  }

  console.log(`\nFinished! Successfully downloaded ${successCount} thumbnails. Errors: ${errorCount}`)
  process.exit(0)
}

downloadThumbnails().catch((err) => {
  console.error("Migration fatal error:", err)
  process.exit(1)
})
