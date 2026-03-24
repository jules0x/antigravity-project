import './styles.css'
import FavoritesDrawer from './components/FavoritesDrawer'
import FavoritesToggle from './components/FavoritesToggle'

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template',
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
