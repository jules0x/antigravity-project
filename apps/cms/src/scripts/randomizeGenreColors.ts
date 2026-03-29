import { getPayload } from 'payload'
import config from '../payload.config'

const GENRE_COLORS = ['indigo', 'emerald', 'rose', 'amber', 'cyan'] as const

async function run() {
  console.log('[COLOR FIX] Initializing Payload...')
  const payload = await getPayload({ config })
  
  const { docs: genres } = await payload.find({
    collection: 'genres',
    limit: 500,
  })
  
  console.log(`[COLOR FIX] Found ${genres.length} genres to process.`)
  
  for (const genre of genres) {
    const randomColor = GENRE_COLORS[Math.floor(Math.random() * GENRE_COLORS.length)]
    console.log(`[COLOR FIX] Setting ${genre.name} to ${randomColor}...`)
    
    await payload.update({
      collection: 'genres',
      id: genre.id,
      data: {
        color: randomColor,
      },
    })
  }
  
  console.log('[COLOR FIX] Finished!')
  process.exit(0)
}

run()
