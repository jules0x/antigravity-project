import { Block } from 'payload'

export const GridBlock: Block = {
  slug: 'grid',
  labels: {
    singular: 'Feature Grid (Vibes)',
    plural: 'Feature Grids',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: "Today's Vibes",
    },
    {
      name: 'subtitle',
      type: 'text',
      defaultValue: "A raw collection of pixels and sound, hand-picked for the restless.",
    },
    {
      name: 'label',
      type: 'text',
      defaultValue: "01 / Curated",
    },
    {
      name: 'items',
      type: 'relationship',
      relationTo: 'items',
      hasMany: true,
      label: 'Selected Items',
    },
  ],
}
