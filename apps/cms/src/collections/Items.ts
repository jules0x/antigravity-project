import type { CollectionConfig } from 'payload'

export const Items: CollectionConfig = {
  slug: 'items',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Electronics', value: 'electronics' },
        { label: 'Books', value: 'books' },
        { label: 'Clothing', value: 'clothing' },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
