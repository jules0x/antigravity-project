import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <div className="home">
      <div className="content">
        {!user && <h1>Welcome</h1>}
        {user && <h1>Welcome back</h1>}
        <div className="links">
          <a
            className="admin"
            href={payloadConfig.routes.admin}
            rel="noopener noreferrer"
          >
            {!user && "Log in"}
            {user && "Admin"}
          </a>
          <a
            href="/gallery"
            rel="noopener noreferrer"
          >
            Gallery
          </a>
          <a
            href="http://localhost:5173/?preview=true"
            rel="noopener noreferrer"
            target="_blank"
          >
            Front-end
          </a>
        </div>
      </div>
    </div>
  )
}
