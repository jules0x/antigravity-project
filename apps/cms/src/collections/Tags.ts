import type { CollectionConfig } from 'payload'

const formatSlug = (val: string): string => {
  return val.replace(/ /g, '-').replace(/[^\w-]+/g, '').toLowerCase()
}

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
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
            const fallbackData = data?.name || originalDoc?.name
            if (fallbackData && typeof fallbackData === 'string') {
              return formatSlug(fallbackData)
            }
            return value
          },
        ],
      },
    },
    {
      name: 'color',
      type: 'select',
      options: [
        { label: 'Primary (Blue)', value: 'primary' },
        { label: 'Secondary (Pink)', value: 'secondary' },
        { label: 'Tertiary (Purple)', value: 'tertiary' },
      ],
      defaultValue: 'primary',
    },
  ],
}
