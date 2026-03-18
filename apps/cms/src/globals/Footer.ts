import type { GlobalConfig } from 'payload'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true, // Publicly readable, required for frontend to fetch the footer links
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      labels: {
        singular: 'Navigation Item',
        plural: 'Navigation Items',
      },
      fields: [
        {
          name: 'linkType',
          type: 'radio',
          options: [
            { label: 'Internal Page', value: 'internal' },
            { label: 'External URL', value: 'external' },
          ],
          defaultValue: 'internal',
        },
        {
          name: 'page',
          type: 'relationship',
          relationTo: 'pages',
          required: true,
          admin: {
            condition: (_, siblingData) => siblingData?.linkType === 'internal',
          },
        },
        {
          name: 'url',
          label: 'Custom URL',
          type: 'text',
          required: true,
          admin: {
            condition: (_, siblingData) => siblingData?.linkType === 'external',
          },
        },
        {
          name: 'label',
          label: 'Label (Override)',
          type: 'text',
          admin: {
            description: 'Leave blank to use the Page title automatically',
          },
        },
      ],
    },
  ],
}
