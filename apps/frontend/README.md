# Antigravity Frontend

This is the user-facing web application for the Antigravity project, built with [Vue 3](https://vuejs.org/), [TypeScript](https://www.typescriptlang.org/), and [Vite](https://vitejs.dev/).

## Overview

The frontend consumes data from the Payload CMS backend. It features dynamic page rendering based on CMS layouts and includes a Draft Preview toggle for logged-in administrators to preview unpublished content. 

Styling is managed with SCSS and linted via [Stylelint](https://stylelint.io/) to enforce consistent coding standards.

## Development

This application is part of a monorepo setup and is typically run concurrently with the CMS from the project root.

To spin up the entire stack locally, follow these steps:

1. Ensure you are in the project root directory (`antigravity-project`).
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Start the development servers for both apps:
   ```bash
   yarn dev
   ```
4. The dev server runs locally (typically on port 5173). Open the provided local URL in your browser.

## Styling & Linting

To lint your SCSS files and fix formatting issues, run:
```bash
pnpm run lint:scss
```

## Production Build

To build the application for production:
```bash
pnpm run build
```
