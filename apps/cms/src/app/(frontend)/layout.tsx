import './styles.css'
import FavoritesDrawer from './components/FavoritesDrawer'
import FavoritesToggle from './components/FavoritesToggle'

export const metadata = {
  description: 'Premium video collection and gallery.',
  title: 'Flux',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Flux',
  },
}

export const viewport = {
  themeColor: '#ff007f',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
        <FavoritesDrawer />
        <FavoritesToggle />
      </body>
    </html>
  )
}
