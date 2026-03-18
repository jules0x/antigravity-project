# Antigravity Project

A modern monorepo starter powered by Vite 8, Vue 3, and Payload CMS v3.

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Yarn Workspaces |
| Frontend | Vite 8, Vue 3 (Composition API), TypeScript, SCSS/Sass |
| CMS / Backend | Payload CMS v3, Next.js 15 |
| Database | SQLite (`payload.db`) — swappable for PostgreSQL |
| Linting (JS/TS) | Oxc (`oxlint`) + `oxlintrc.json` rules |
| Linting (CSS) | Stylelint |
| Node version | 20 (managed via `.node-version` / `fnm`) |

## Project Structure

```text
antigravity-project/
├── apps/
│   ├── cms/                   # Payload CMS v3 backend (Next.js 15)
│   │   └── src/
│   │       ├── collections/   # Payload collections (e.g. Pages)
│   │       ├── globals/       # Payload globals (e.g. Nav, Footer)
│   │       └── payload.config.ts
│   └── frontend/              # Vite 8 + Vue 3 SPA
│       └── src/
│           ├── components/    # GlobalNav, GlobalFooter, RichTextRenderer, DraftToggle
│           ├── styles/        # Modular SCSS (base, layout, components)
│           ├── App.vue        # Root component — fetches and renders CMS pages
│           └── main.ts
├── .vscode/                   # Editor settings (lint-on-save, recommended extensions)
├── .oxlintrc.json             # Oxc lint rules
├── package.json               # Monorepo root scripts
└── yarn.lock
```

## Features Added Since Initial Setup

### CMS-Driven Page Rendering
The frontend fetches pages from Payload CMS at runtime via the `/api/pages` proxy. The current URL path is used to resolve the correct page slug, so creating a page in the CMS with slug `about` automatically makes it available at `/about`. A fallback to a  `404` slug is attempted if the page isn't found.

### Rich Text Renderer
A recursive `RichTextRenderer.vue` component parses Payload's Lexical rich text format and renders standard HTML elements — headings, paragraphs, lists, bold/italic text, links — without needing an external rich-text library.

### Global Layout Components
`GlobalNav.vue` and `GlobalFooter.vue` are rendered on every page and pull their content from Payload globals, keeping navigation and footer text editable from the CMS without a frontend deploy.

### Draft Preview Toggle
Admins can append `?preview=true` to any frontend URL to view unpublished draft content. A floating `DraftToggle.vue` button appears when logged in to the CMS, letting editors switch between the published and draft view without manually editing the URL. The Payload "Preview" button is configured to include this parameter.

### Lint / Editor Integration
`.vscode/settings.json` configures Oxc (JS/TS) and Stylelint (SCSS) fixers to run when explicitly triggered (e.g. **Save without Formatting** in VS Code). They do not fire automatically on every save — use `yarn lint` and `yarn workspace frontend lint:scss` for a full lint pass.

### Modular SCSS Architecture
Frontend styles are split into `base/`, `layout/`, and `components/` partials, all imported through a single `main.scss` entry point, making the stylesheet easy to extend without conflicts.

---

## Getting Started

### Prerequisites

- **Node.js 20** — use `fnm use` (reads `.node-version` automatically).

### Install

```bash
yarn install
```

### Develop

```bash
yarn dev
```

- Frontend: <http://localhost:5173> (HMR)
- CMS Admin: <http://localhost:3000/admin>

### Build & Preview

```bash
yarn build    # compiles frontend → apps/frontend/dist/ and CMS → apps/cms/.next/
yarn preview  # serves both production builds locally
```

### Lint

```bash
yarn lint                              # Oxc across the whole workspace
yarn workspace frontend lint:scss      # Stylelint for SCSS files
```

## Configuration Notes

- **API Proxy:** The Vite dev server proxies `/api/*` to `http://localhost:3000`, avoiding CORS issues during development.
- **Database:** SQLite is used locally (`apps/cms/payload.db`). Switch to PostgreSQL by updating the adapter in `apps/cms/payload.config.ts`.
- **Editor extensions:** Install **Oxc** (`oxc.oxc-vscode`) and **Stylelint** (`stylelint.vscode-stylelint`) for live linting and auto-fix on save.
