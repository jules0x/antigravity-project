import type { CollectionConfig } from 'payload'

export const Authors: CollectionConfig = {
  slug: 'authors',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'subscribers', 'verified'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'externalAvatar',
      type: 'text',
      admin: {
        description: 'External avatar URL (e.g. from YouTube)',
      },
    },
    {
      name: 'subscribers',
      type: 'text',
      defaultValue: '0',
    },
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
