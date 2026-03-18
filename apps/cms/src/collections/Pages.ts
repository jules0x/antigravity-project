import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  versions: {
    drafts: true,
    maxPerDoc: 20, // Keeps the most recent 20 revisions
  },
  access: {
    read: ({ req: { user } }) => {
      // Logged-in admin users can read everything (including drafts)
      if (user) {
        return true
      }

      // Public users can ONLY read pages where the status is published
      return {
        _status: {
          equals: 'published',
        },
      }
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    preview: (doc) => {
      if (doc?.slug === 'home') {
        return 'http://localhost:5173/?preview=true'
      }
      if (doc?.slug) {
        return `http://localhost:5173/${doc.slug}?preview=true`
      }
      return null
    },
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
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Leave blank to auto-generate from title. Use "home" for the homepage.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (typeof value === 'string' && value.length > 0) {
              return value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
            }
            if (data?.title && typeof data.title === 'string') {
              return data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'excludeFromNav',
      type: 'checkbox',
      label: 'Exclude from Navigation?',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'content',
      type: 'richText',
    },
  ],
}
