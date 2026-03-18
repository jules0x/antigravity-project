# Antigravity Project

A modern monorepo starter powered by Vite 8, Vue 3, and Payload CMS v3.

## Tech Stack

- **Monorepo Management:** Yarn Workspaces
- **Frontend:** Vite 8, Vue 3 (Composition API), Sass
- **CMS/Backend:** Payload CMS v3 (Running on Next.js 15)
- **Database:** SQLite (local `payload.db`)
- **Linting:** Oxc (`oxlint`)

## Project Structure

```text
antigravity-project/
├── apps/
│   ├── cms/          # Payload CMS v3 Backend
│   └── frontend/     # Vite 8 + Vue 3 Frontend
├── package.json      # Monorepo root configuration
└── oxlint.json       # Workspace-wide linting rules
```

## Getting Started

### Prerequisites

- **Node.js:** version 20 or higher is required.
  - You can use `fnm use 20` if installed.

### Installation

From the monorepo root:

```bash
yarn install
```

### Development

Start both the frontend and the CMS backend simultaneously in development mode:

```bash
yarn dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173) (with HMR)
- **CMS Admin:** [http://localhost:3000/admin](http://localhost:3000/admin)

### Build and Preview

To generate a production-ready build of both the frontend and the CMS backend:

```bash
yarn build
```

This will create:
- **Frontend artifacts:** `apps/frontend/dist/`
- **CMS/Next.js artifacts:** `apps/cms/.next/`

To preview the production build locally:

```bash
yarn preview
```

### Other Commands

- **Linting:** `yarn lint` (Runs Oxc across the workspace)
- **Individual Build:** `yarn workspace frontend build` or `yarn workspace apps-cms build`

## Configuration Details

- **API Proxy:** The frontend dev server is configured to proxy requests starting with `/api` to `http://localhost:3000`. This allows seamless communication with the Payload API without CORS issues during development.
- **Styles:** The frontend uses Sass for styling. Global styles are managed in `apps/frontend/src/styles/` with a modular architecture.
- **Database:** Uses a local SQLite database (`apps/cms/payload.db`). To switch to PostgreSQL, update the adapter in `apps/cms/payload.config.ts`.

## Editor Integration

For the best development experience in **VS Code**, we recommend installing the following extensions:
- **Oxc** (`oxc.oxc-vscode`) for lightning-fast JS/TS linting.
- **Stylelint** (`stylelint.vscode-stylelint`) for SCSS styling rules.

The project is pre-configured to **automatically fix** linting and styling issues on save when these extensions are installed. Style linting is also available via the `yarn workspace frontend lint:scss` command. Settings are located in `.vscode/settings.json`.
