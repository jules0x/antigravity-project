import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { ids } = await req.json()

  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 })
  }

  console.log(`[IMPORT] Starting import of ${ids.length} videos...`)
  const results = []

  for (const id of ids) {
    try {
      // Check if exists
      const existing = await payload.find({
        collection: 'items',
        where: { youtubeID: { equals: id } }
      })

      if (existing.totalDocs > 0) {
        results.push({ id, status: 'skipped', message: 'Already exists' })
        continue
      }

      console.log(`[IMPORT] Creating item: ${id}`)
      const doc = await payload.create({
        collection: 'items',
        data: {
          youtubeID: id,
          type: 'video',
          title: `Imported ${id}`, // Hook will clean/update
          wasEnriched: false,
        }
      })
      results.push({ id, status: 'success', title: doc.title })
    } catch (err: any) {
      console.error(`[IMPORT] Error for ${id}:`, err.message)
      results.push({ id, status: 'error', error: err.message })
    }
  }

  return NextResponse.json({ 
    message: 'Import complete', 
    processed: results.length,
    results 
  })
}
