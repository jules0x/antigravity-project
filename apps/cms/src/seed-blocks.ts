/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from './payload.config'
import { fileURLToPath } from 'url'
import path from 'path'
import * as fs from 'fs'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

async function seed() {
  console.log('--- Reseeding Dynamic Gallery from Manifest ---')
  const payload = await getPayload({ config })

  // 0. Load Video IDs from Manifest
  const manifestPath = path.join(dirname, '../vids.txt')
  if (!fs.existsSync(manifestPath)) {
    console.error('vids.txt NOT FOUND!')
    process.exit(1)
  }
  const VIDEO_IDS = fs.readFileSync(manifestPath, 'utf8')
    .split('\n')
    .map(id => id.trim())
    .filter(Boolean)
  
  console.log(`Loaded ${VIDEO_IDS.length} IDs from manifest.`)

  // 1. Create Genres (Idempotent)
  console.log('Creating Genres...')
  const genreIds = []
  const genresToCreate = [
    { name: 'ABSTRACT', color: 'indigo' },
    { name: 'CINEMATIC', color: 'rose' },
    { name: 'TECH', color: 'cyan' },
    { name: 'AMBIENT', color: 'indigo' },
    { name: 'LO-FI', color: 'rose' },
  ] as const

  for (const t of genresToCreate) {
    const existing = await payload.find({ collection: 'genres', where: { name: { equals: t.name } } })
    if (existing.totalDocs > 0) {
      genreIds.push(existing.docs[0].id)
    } else {
      genreIds.push((await payload.create({ collection: 'genres', data: t })).id)
    }
  }

  // 2. Create Author (Idempotent)
  console.log('Creating Author...')
  let authorId
  const existingAuthor = await payload.find({ collection: 'authors', where: { name: { equals: 'STUDIO PRISM' } } })
  if (existingAuthor.totalDocs > 0) {
    authorId = existingAuthor.docs[0].id
  } else {
    const author = await payload.create({
      collection: 'authors',
      data: {
        name: 'STUDIO PRISM',
        subscribers: '245K',
        verified: true as any,
      },
    })
    authorId = author.id
  }

  // 3. Create Items
  console.log(`Ingesting ${VIDEO_IDS.length} items...`)
  const itemIds = []

  let validItemsCount = 0;
  
  for (let i = 0; i < VIDEO_IDS.length; i++) {
    const vid = VIDEO_IDS[i]
    if (!vid) continue
    
    // Check if item already exists
    const existingItem = await payload.find({ collection: 'items', where: { youtubeID: { equals: vid } } })
    if (existingItem.totalDocs > 0) {
      console.log(`[SKIP] Video ${vid} already exists.`)
      itemIds.push(existingItem.docs[0].id)
      validItemsCount++;
      continue
    }

    // Validate video via YouTube oEmbed API
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vid}&format=json`)
      if (!res.ok) {
        console.log(`[SKIP] Video ${vid} is unavailable or private (Status: ${res.status}).`)
        continue
      }
    } catch (e) {
      console.log(`[SKIP] Video ${vid} fetch error depth=${i}:`, e)
      continue
    }

    // Assign 2 or 3 tags per item pseudo-randomly but deterministically
    const numTags = 2 + (validItemsCount % 2)
    const itemTags = []
    for (let j = 0; j < numTags; j++) {
      itemTags.push(genreIds[(validItemsCount + j * 2) % genreIds.length])
    }

    try {
      const item = await payload.create({
        collection: 'items',
        data: {
          youtubeID: vid,
          type: 'video',
          subtitle: `Vol. ${validItemsCount + 1}`,
          duration: '04:15',
          author: authorId,
          views: `${Math.floor(Math.random() * 900) + 10}K`,
          genres: itemTags,
        } as any,
      })
      itemIds.push(item.id)
      validItemsCount++;
      console.log(`[OK] Imported ${vid} (${validItemsCount}/${VIDEO_IDS.length})`)
    } catch (e) {
      console.log(`[ERROR] Failed to create item ${vid}:`, e)
    }
  }

  // 4. Construct Gallery Page using Blocks
  console.log(`Constructing Gallery Page with ${itemIds.length} items...`)
  
  // Hero Block: 1 main item, 2 side items
  const heroItem = itemIds[0]
  const sideItems = itemIds.slice(1, 3)

  // Grid Block: next 8 items
  const gridItems = itemIds.slice(3, 11)

  // List Block (Pulse Check): next 6 items
  const listItems = itemIds.slice(11, 17)

  // Cleanup existing page with this slug
  await payload.delete({ collection: 'pages', where: { slug: { equals: 'gallery' } } })

  await payload.create({
    collection: 'pages',
    data: {
      title: 'The Unfiltered Archives',
      slug: 'gallery',
      layout: [
        {
          blockType: 'favorites',
          title: "Personal Vault",
          label: "FAVORITES",
        },
        {
          blockType: 'grid',
          title: "Today's Obsessions",
          subtitle: "A raw collection of pixels and sound, hand-picked for the restless.",
          label: "01 / Curated",
          items: gridItems,
        },
        {
          blockType: 'hero',
          title: "The Underground Selection",
          label: "02 / Featured",
          heroItem: heroItem,
          sideItems: sideItems,
        },
        {
          blockType: 'list',
          title: "Pulse Check",
          subtitle: "What's blowing up in the underground right now.",
          label: "03 / Realtime",
          items: listItems,
        }
      ]
    }
  })

  // Also create a dynamic homepage routing to gallery
  await payload.delete({ collection: 'pages', where: { slug: { equals: 'home' } } })
  await payload.create({
    collection: 'pages',
    data: {
      title: 'Home',
      slug: 'home',
      layout: [
        {
          blockType: 'grid',
          title: "Staff Picks",
          label: "01 / Highlights",
          items: itemIds.slice(20, 24),
        }
      ]
    }
  })

  console.log(`--- Complete: Imported ${validItemsCount} items ---`)
  process.exit(0)
}

seed()
