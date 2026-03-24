import 'dotenv/config'
import { getPayload } from 'payload'
import config from './payload.config'

async function verify() {
  const payload = await getPayload({ config })
  const vid = 'v0MkJtI3FvU'

  console.log(`[VERIFY] Triggering metadata ingestion for ${vid}...`)

  // Find the item
  const { docs } = await payload.find({
    collection: 'items',
    where: { youtubeID: { equals: vid } },
    limit: 1,
  })

  if (docs.length === 0) {
    console.log(`[ERROR] Item ${vid} not found.`)
    process.exit(1)
  }

  const item = docs[0]

  // Update item (setting title to null triggers the hook)
  const updated = await payload.update({
    collection: 'items',
    id: item.id,
    data: {
      title: '', // Hook triggers when title is empty/null and youtubeID is present
    } as any,
  })

  console.log('[OK] Metadata refreshed. Results:')
  console.log(JSON.stringify({
    title: updated.title,
    category: updated.category,
    uploadDate: updated.uploadDate,
    duration: updated.duration,
    author: typeof updated.author === 'object' ? updated.author.name : updated.author,
    keywords: updated.keywords?.substring(0, 50) + '...',
  }, null, 2))

  process.exit(0)
}

verify()
