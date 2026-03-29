import { getPayload } from 'payload'
import config from '@/payload.config'
import { redirect, notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AutoPlayPage(props: { searchParams: Promise<{ genre?: string, playlist?: string }> }) {
  const searchParams = await props.searchParams
  const genreSlug = searchParams.genre
  const playlistId = searchParams.playlist

  if (!genreSlug && !playlistId) {
    return redirect('/gallery')
  }

  const payload = await getPayload({ config })

  if (playlistId) {
     const { docs: items } = await payload.find({
        collection: 'items',
        where: { playlist: { equals: playlistId } },
        limit: 1,
        sort: 'createdAt'
     })
     if (items.length > 0) {
        return redirect(`/gallery/${items[0].slug || items[0].id}?playlist=${playlistId}&shuffle=${Math.random().toString(36).substring(7)}`)
     }
     return redirect('/gallery')
  }

  // 1. Find the genre ID from the slug
  const { docs: genres } = await payload.find({
    collection: 'genres',
    where: { slug: { equals: genreSlug } },
    limit: 1,
  })

  if (genres.length === 0) {
    return notFound()
  }

  const genreId = genres[0].id

  // 2. Find the first item in this genre
  const { docs: items } = await payload.find({
    collection: 'items',
    where: {
      genres: { in: [genreId] },
    },
    sort: '-updatedAt',
    limit: 1,
  })

  if (items.length === 0) {
     // If no items, just go to gallery with filter (it will show empty)
     return redirect(`/gallery?genre=${genreSlug}`)
  }

  const firstItem = items[0] as any
  
  // 3. Redirect to the item detail page with the genre filter active
  // We use a shuffle seed to ensure the sidebar feels fresh
  const seed = Math.random().toString(36).substring(7)
  return redirect(`/gallery/${firstItem.slug || firstItem.id}?genre=${genreSlug}&shuffle=${seed}`)
}
