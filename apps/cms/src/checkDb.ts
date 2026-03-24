import 'dotenv/config'
import { getPayload } from 'payload'
import config from './payload.config'

async function check() {
  const payload = await getPayload({ config })
  const tags = await payload.find({ collection: 'tags' })
  console.log(`Tags: ${tags.totalDocs}`)
  const items = await payload.find({ collection: 'items' })
  console.log(`Items: ${items.totalDocs}`)
  const authors = await payload.find({ collection: 'authors' })
  console.log(`Authors: ${authors.totalDocs}`)
  const pages = await payload.find({ collection: 'pages' })
  console.log(`Pages: ${pages.totalDocs}`)
  process.exit(0)
}

check()
