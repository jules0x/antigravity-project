# Flux CMS

This is the backend Content Management System for the Flux project, powered by [Payload CMS 3.0](https://payloadcms.com/). It runs on Next.js App Router and utilizes SQLite for the database.

## Overview

The CMS is responsible for managing all content, users, and media for the project. It exposes an API that the frontend application consumes to render pages and components (like Banners). It also supports draft previews, allowing administrators to view unpublished content on the frontend.

## Development

This application is part of a monorepo setup and is typically run concurrently with the frontend from the project root.

To spin up the entire stack locally, follow these steps:

1. Ensure you are in the project root directory (`antigravity-project`).
2. Install dependencies:
   ```asbh
   yarn install
   ```
3. Start the development servers for both apps:
   ```bash
   yarn dev
   ```
   *(Note: To start completely fresh for the CMS, you can run `yarn workspace apps-cms devsafe`)*
4. Open `http://localhost:3000/admin` in your browser to access the CMS admin panel.

## Features
- Content management configured for the Flux frontend.
- Supports Draft Previews across published and draft collections.
- **SEO Management:** Configurable SEO metadata (titles, descriptions, images) for Pages and Items.
- **Redirects:** Dedicated collection to handle 301/302 HTTP redirects.
- **Import/Export:** Bulk data management (CSV/JSON) enabled on relevant collections.
