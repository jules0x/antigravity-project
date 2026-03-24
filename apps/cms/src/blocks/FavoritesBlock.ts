import { Block } from 'payload'

export const FavoritesBlock: Block = {
  slug: 'favorites',
  labels: {
    singular: 'Favorites Grid',
    plural: 'Favorites Grids',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Your Favorites',
    },
    {
      name: 'label',
      type: 'text',
      defaultValue: 'PERSONAL VAULT',
    },
  ],
}
