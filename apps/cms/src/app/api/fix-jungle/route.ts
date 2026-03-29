import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextResponse } from 'next/server'

export async function GET() {
  const payload = await getPayload({ config })
  
  // 1. Ensure "Jungle" genre exists
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
      data: { name: 'Jungle', slug: 'jungle', color: 'emerald' } as any
    })
    jungleId = newG.id
  }

  const results = []
  // 2. Tag items 231-242
  for (let id = 231; id <= 242; id++) {
    try {
      await payload.update({
        collection: 'items',
        id,
        data: {
          genres: [jungleId]
        } as any
      })
      results.push({ id, status: 'success' })
    } catch (err: any) {
      results.push({ id, status: 'error', error: err.message })
    }
  }

  return NextResponse.json({ message: 'Fixed Jungle tags', results })
}
