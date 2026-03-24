import { Block } from 'payload'

export const ListBlock: Block = {
  slug: 'list',
  labels: {
    singular: 'Minimal List (Pulse Check)',
    plural: 'Minimal Lists',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: "Pulse Check",
    },
    {
      name: 'subtitle',
      type: 'text',
      defaultValue: "What's blowing up in the underground right now.",
    },
    {
      name: 'label',
      type: 'text',
      defaultValue: "03 / Realtime",
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
