import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { enrichItem } from '@/utilities/enrichItem'

export async function GET() {
  const payload = await getPayload({ config })
  const db = (payload.db as any).drizzle

  console.log('[MIGRATION] Checking database schema...')
  
  try {
    // Manually ensure the column exists (Payload/Drizzle push backup)
    await db.run(sql`ALTER TABLE "items" ADD COLUMN "was_enriched" INTEGER DEFAULT 0`)
    console.log('[MIGRATION] Column "was_enriched" added successfully.')
  } catch (err: any) {
    if (err.message.includes('duplicate column name') || err.message.includes('already exists')) {
      console.log('[MIGRATION] Column "was_enriched" already exists.')
    } else {
      console.error('[MIGRATION] Alter table error:', err.message)
    }
  }

  console.log('[MIGRATION] Starting full migration...')
  
  // Find ONLY unenriched videos to avoid MusicBrainz rate limits
  const { docs: items } = await payload.find({
    collection: 'items',
    where: { 
      and: [
        { type: { equals: 'video' } },
        { 
          or: [
            { wasEnriched: { equals: false } },
            { wasEnriched: { exists: false } },
            { wasEnriched: { equals: null } }
          ]
        }
      ]
    },
    limit: 50, // Small batches to be safe
  })
  
  console.log(`[MIGRATION] Found ${items.length} items to process.`)
  
  const results = []
  
  for (const item of items) {
    try {
      console.log(`[MIGRATION] Processing: ${item.title} (ID: ${item.id})`)
      
      // Call enrichItem with force=true to ensure title is cleaned
      const enrichedData = await enrichItem(payload, item, true)
      
      const result = await payload.update({
        collection: 'items',
        id: item.id,
        data: {
          ...enrichedData, // Save EVERYTHING (genres, album, author, etc.)
          wasEnriched: true,
        },
      })
      results.push({ id: item.id, status: 'success', genres: result.genres?.length || 0 })
    } catch (err: any) {
      console.error(`[MIGRATION] Error for ${item.id}:`, err)
      results.push({ id: item.id, status: 'error', error: err.message })
    }
  }
  
  return NextResponse.json({ 
    message: 'Migration completed', 
    found: items.length,
    processed: results.length,
    results 
  })
}
