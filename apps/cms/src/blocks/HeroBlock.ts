import { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: {
    singular: 'Hero Selection',
    plural: 'Hero Selections',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: "The Underground Selection",
    },
    {
      name: 'label',
      type: 'text',
      defaultValue: "02 / Featured",
    },
    {
      name: 'heroItem',
      type: 'relationship',
      relationTo: 'items',
      required: true,
      label: 'Main Feature Item',
    },
    {
      name: 'sideItems',
      type: 'relationship',
      relationTo: 'items',
      hasMany: true,
      maxRows: 2,
      label: 'Side Feature Items (Max 2)',
    },
  ],
}
