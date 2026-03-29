import type { CollectionConfig } from 'payload'
import { getYouTubeMetadata } from '../utilities/youtube'
import { getMusicMetadata } from '../utilities/musicbrainz'
import { enrichItem } from '../utilities/enrichItem'

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
          async ({ value, data, operation, req, originalDoc }) => {
            const youtubeID = data?.youtubeID || originalDoc?.youtubeID
            const type = data?.type || originalDoc?.type
            
            if ((operation === 'create' || operation === 'update') && type === 'video' && youtubeID) {
              if (data) {
                if (!data.youtubeID) data.youtubeID = youtubeID
                if (!data.type) data.type = type
              }
              const enriched = await enrichItem(req.payload as any, data)
              if (enriched?.title) {
                return enriched.title
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
      name: 'wasEnriched',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Whether music metadata has been fetched for this item',
      },
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
      name: 'subscribersCount',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'genres',
      type: 'relationship',
      relationTo: 'genres',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'album',
      type: 'relationship',
      relationTo: 'albums',
      admin: { position: 'sidebar' },
    },
    {
      name: 'playlist',
      type: 'relationship',
      relationTo: 'playlists',
      admin: { position: 'sidebar' },
    },
  ],
}
