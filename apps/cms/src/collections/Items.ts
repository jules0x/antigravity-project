import type { CollectionConfig } from 'payload'
import { getYouTubeMetadata } from '../utilities/youtube'

// String to URL utility
const formatSlug = (val: string): string => {
  return val.replace(/ /g, '-').replace(/[^\w-]+/g, '').toLowerCase()
}

export const Items: CollectionConfig = {
  slug: 'items',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'slug', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      hooks: {
        beforeValidate: [
          async ({ value, data, operation, req }) => {
            if ((operation === 'create' || operation === 'update') && data?.type === 'video' && data?.youtubeID && !value) {
              const metadata = await getYouTubeMetadata(data.youtubeID)
              if (metadata) {
                // 1. Handle Author Linking (Idempotent)
                const authorRes = await req.payload.find({
                  collection: 'authors',
                  where: { name: { equals: metadata.authorName } },
                })

                let authorId
                if (authorRes.totalDocs > 0) {
                  authorId = authorRes.docs[0].id
                  // Update existing author metadata if provided
                  await req.payload.update({
                    collection: 'authors',
                    id: authorId,
                    data: {
                      subscribers: metadata.subscribers,
                      externalAvatar: metadata.authorAvatar,
                      verified: true as any,
                    },
                  })
                } else {
                  const newAuthor = await req.payload.create({
                    collection: 'authors',
                    data: {
                      name: metadata.authorName,
                      subscribers: metadata.subscribers,
                      externalAvatar: metadata.authorAvatar,
                      verified: true as any,
                    },
                  })
                  authorId = newAuthor.id
                }

                // 2. Populate fields
                if (data) {
                  data.author = authorId
                  data.description = data.description || metadata.description
                  data.duration = data.duration || metadata.duration
                  data.views = data.views || metadata.views
                  data.category = data.category || metadata.category
                  data.keywords = data.keywords || metadata.keywords
                  data.uploadDate = data.uploadDate || metadata.uploadDate
                  data.slug = data.slug || formatSlug(metadata.title)
                }

                return metadata.title
              }
            }
            return value
          },
        ],
      },
    },
    {
      name: 'slug',
      label: 'Slug (URL)',
      type: 'text',
      index: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ value, originalDoc, data }) => {
            if (typeof value === 'string') {
              return formatSlug(value)
            }
            const fallbackData = data?.title || originalDoc?.title
            if (fallbackData && typeof fallbackData === 'string') {
              return formatSlug(fallbackData)
            }
            return value
          },
        ],
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      admin: {
        description: 'Short decorative title (e.g. "ABSTRACT MOTION")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'type',
      type: 'select',
      defaultValue: 'video',
      options: [
        { label: 'Image', value: 'image' },
        { label: 'YouTube Video', value: 'video' },
        // Future-proofing for Music Directory
        { label: 'Audio Collection', value: 'audio-collection' }, 
      ],
      required: true,
    },
    {
      name: 'youtubeID',
      type: 'text',
      label: 'YouTube Video ID',
      admin: {
        condition: (data) => data?.type === 'video',
      },
    },
    {
      name: 'duration',
      type: 'text',
      admin: {
        description: 'e.g. "08:24"',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
    },
    {
      name: 'views',
      type: 'text',
      defaultValue: '0',
    },
    {
      name: 'label1',
      type: 'text',
      admin: {
        description: 'Primary pill label (e.g. "4K ULTRA HD")',
      },
    },
    {
      name: 'label2',
      type: 'text',
      admin: {
        description: 'Secondary pill label (e.g. "TRENDING #1")',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (data) => data?.type === 'image' || data?.type === 'audio-collection',
      },
    },
    {
      name: 'technicalNotes',
      type: 'richText',
    },
    {
      name: 'category',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'keywords',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'uploadDate',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'likes',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'subscribersCount', // Renamed to avoid confusion with author.subscribers if needed, but author.subscribers is better
      type: 'text',
      admin: { position: 'sidebar' },
    },
  ],
}
