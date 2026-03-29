import { getPayload } from 'payload'
import config from '../payload.config'

const videoIDs = [
  'Au5HxjDJWQ0', 'nWtBBlapD4Y', 'zD1jK3n7XI4', 'zPg6W6YW6Dk', '6a7FMwU-y5g',
  'y2hawuLtMw0', 'ubhWyss9bno', 'Bz201O6RhqQ', 'MYjdfXLFHqA', 'on8XnyAZ6Ng',
  'Cq-YYyuxCTY', 'm9kZ1XQPBJs', 'CbKoBASVAhQ', 'zITOzOnQEuE', 'jUkykB6qmFY',
  '3UHKlfywGig', 'stN_yQwxOnY', 'Ly4OpyV-0r0', 'tPikH4pXJrg', 'YODcbcQ_ZVg',
  'tc4X8XAgZI4', '1eUEolIqU1k', 'HZsRR4MMqmo', '6C5e9p70Fek', 'OyVQvvo__FM',
  'F7jqtnN1kqI', 'QLMH1I56hIM', '-h0f6SiLNfo', '5S1_Es2EaN8', '1qpJ-QxUFHs',
  '7b1J7_cOwOI', 'PXCQkj_Xodg', 'Db-POez_psI', 'DQPID4nVwqU', 'LJhv_DofXi0'
]

async function run() {
  console.log('[IMPORT] Initializing Payload...')
  const payload = await getPayload({ config })
  
  console.log(`[IMPORT] Starting import of ${videoIDs.length} videos...`)
  
  for (const id of videoIDs) {
    try {
      // Check if item already exists
      const existing = await payload.find({
        collection: 'items',
        where: {
          youtubeID: { equals: id }
        }
      })
      
      if (existing.totalDocs > 0) {
        console.log(`[IMPORT] Skipping ${id} (already exists)`)
        continue
      }
      
      console.log(`[IMPORT] Creating item for ${id}...`)
      // Creating the item will trigger the beforeValidate hook which calls enrichItem
      await payload.create({
        collection: 'items',
        data: {
          youtubeID: id,
          type: 'video',
          title: `Video ${id}`, // Placeholder, hook will overwrite
          wasEnriched: false,
        }
      })
      console.log(`[IMPORT] Successfully imported ${id}`)
    } catch (err: any) {
      console.error(`[IMPORT] Error importing ${id}:`, err.message)
    }
  }
  
  console.log('[IMPORT] Finished!')
  process.exit(0)
}

run()
