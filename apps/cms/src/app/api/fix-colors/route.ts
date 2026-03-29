import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextResponse } from 'next/server'

const GENRE_COLORS = ['indigo', 'emerald', 'rose', 'amber', 'cyan'] as const

export async function GET() {
  const payload = await getPayload({ config })
  
  const { docs: genres } = await payload.find({
    collection: 'genres',
    limit: 500,
  })
  
  console.log(`[COLOR FIX] Found ${genres.length} genres to process.`)
  const results = []

  for (const genre of genres) {
    const randomColor = GENRE_COLORS[Math.floor(Math.random() * GENRE_COLORS.length)]
    try {
      await payload.update({
        collection: 'genres',
        id: genre.id,
        data: {
          color: randomColor,
        },
      })
      results.push({ id: genre.id, name: genre.name, color: randomColor })
    } catch (err: any) {
      results.push({ id: genre.id, name: genre.name, error: err.message })
    }
  }

  return NextResponse.json({ 
    message: 'Colors randomized!', 
    processed: results.length,
    results 
  })
}
