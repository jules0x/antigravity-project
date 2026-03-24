import 'dotenv/config'
import { getPayload } from 'payload'
import config from './payload.config'

async function clear() {
  const payload = await getPayload({ config })
  console.log('Clearing existing data...')
  
  await payload.delete({ collection: 'pages', where: { id: { exists: true } } })
  await payload.delete({ collection: 'items', where: { id: { exists: true } } })
  await payload.delete({ collection: 'tags', where: { id: { exists: true } } })
  await payload.delete({ collection: 'authors', where: { id: { exists: true } } })

  console.log('Cleared!')
  process.exit(0)
}

clear()
