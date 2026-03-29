import { getPayload } from 'payload'
import config from '../payload.config'

async function run() {
  console.log('[FIX] Initializing Payload...')
  const payload = await getPayload({ config })
  
  // 1. Ensure "Jungle" genre exists
  console.log('[FIX] Checking for Jungle genre...')
  const genreRes = await payload.find({
    collection: 'genres',
    where: { name: { equals: 'Jungle' } }
  })
  
  let jungleId
  if (genreRes.totalDocs > 0) {
    jungleId = genreRes.docs[0].id
  } else {
    const newG = await payload.create({
      collection: 'genres',
      data: { name: 'Jungle', slug: 'jungle', color: 'emerald' }
    })
    jungleId = newG.id
    console.log('[FIX] Created Jungle genre')
  }

  // 2. Find items from the latest import (IDs 231-242)
  console.log('[FIX] Tagging items 231-242...')
  for (let id = 231; id <= 242; id++) {
    try {
      await payload.update({
        collection: 'items',
        id,
        data: {
          genres: [jungleId]
        }
      })
      console.log(`[FIX] Tagged item ${id}`)
    } catch (err: any) {
      console.log(`[FIX] Could not tag ${id}: ${err.message}`)
    }
  }
  
  console.log('[FIX] Done!')
  process.exit(0)
}

run()
