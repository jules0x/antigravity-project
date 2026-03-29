import type { CollectionConfig } from 'payload'

const formatSlug = (val: string): string => {
  return val.replace(/ /g, '-').replace(/[^\w-]+/g, '').toLowerCase()
}

export const Albums: CollectionConfig = {
  slug: 'albums',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
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
      name: 'artist',
      type: 'relationship',
      relationTo: 'authors',
      required: true,
    },
    {
      name: 'releaseDate',
      type: 'date',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
