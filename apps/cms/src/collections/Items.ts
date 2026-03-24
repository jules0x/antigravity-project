import type { CollectionConfig } from 'payload'

// String to URL utility
const formatSlug = (val: string): string => {
  return val.replace(/ /g, '-').replace(/[^\w-]+/g, '').toLowerCase()
}

export const Items: CollectionConfig = {
  slug: 'items',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'slug', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
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
  ],
}
