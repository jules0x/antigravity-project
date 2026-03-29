import { CollectionConfig } from 'payload'
import { extractVideoIdsFromPlaylist } from '../utilities/youtubePlaylist'

export const Playlists: CollectionConfig = {
  slug: 'playlists',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'youtubeURL', 'status'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'youtubeURL',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'The URL of the YouTube playlist to import',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Importing', value: 'importing' },
        { label: 'Finished', value: 'finished' },
        { label: 'Error', value: 'error' },
      ],
      defaultValue: 'pending',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'genres',
      type: 'relationship',
      relationTo: 'genres',
      hasMany: true,
      admin: {
        description: 'Genres to apply to all imported items',
      },
    },
    {
      name: 'importedCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        // Prevent infinite loops by checking if the URL actually changed or it is just a status update
        const urlChanged = operation === 'update' && doc.youtubeURL !== previousDoc?.youtubeURL
        const isNew = operation === 'create'
        const isReTrigger = operation === 'update' && doc.status === 'pending' && previousDoc?.status !== 'pending'

        if (!isNew && !urlChanged && !isReTrigger) return

        const { payload } = req
        
        // Use a background process (don't await the whole thing if it's too slow, 
        // but Payload usually handles async hooks fine)
        try {
          console.log(`[PLAYLIST] Starting import for: ${doc.youtubeURL}`)
          
          const ids = await extractVideoIdsFromPlaylist(doc.youtubeURL)
          console.log(`[PLAYLIST] Found ${ids.length} videos.`)

          if (ids.length === 0) {
             throw new Error('No videos found in playlist or extraction failed')
          }

          let imported = 0
          for (const id of ids) {
            try {
              const existing = await payload.find({
                collection: 'items',
                where: { youtubeID: { equals: id } },
                limit: 1,
              })

              if (existing.totalDocs === 0) {
                await (payload as any).create({
                  collection: 'items',
                  data: {
                    youtubeID: id,
                    type: 'video',
                    wasEnriched: false, // Hook on Items will trigger enrichment
                    genres: doc.genres, // Apply playlist genres
                    playlist: doc.id, // Link to this playlist
                  },
                })
                imported++
              } else {
                // Retroactively tag existing items if they have no genres
                const item = existing.docs[0] as any
                const hasNoGenres = !item.genres || (Array.isArray(item.genres) && item.genres.length === 0)
                if (hasNoGenres && doc.genres && doc.genres.length > 0) {
                  await (payload as any).update({
                    collection: 'items',
                    id: item.id,
                    data: {
                      genres: doc.genres,
                      playlist: doc.id,
                    },
                  })
                  console.log(`[PLAYLIST] Retroactively tagged existing item ${item.id} (${item.title || id})`)
                }
              }
            } catch (itemErr: any) {
               console.error(`[PLAYLIST] Error processing video ${id}:`, itemErr.message)
            }
          }

          // Update status to finished without re-triggering the hook
          await (payload as any).update({
            collection: 'playlists',
            id: doc.id,
            data: {
              status: 'finished',
              importedCount: imported,
            },
          })
          
          console.log(`[PLAYLIST] Finished! Imported ${imported} new items.`)
        } catch (err: any) {
          console.error('[PLAYLIST] Import error:', err.message)
          await (payload as any).update({
            collection: 'playlists',
            id: doc.id,
            data: { status: 'error' },
          })
        }
      },
    ],
  },
}
