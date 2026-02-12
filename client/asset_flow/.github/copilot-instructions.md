## Quick context

This repository is a small Vite + React application (no backend in this folder). Key facts:

- Uses Vite as the dev server and bundler; React 19 with `StrictMode` (see `src/main.jsx`).
- Files are in `src/` with entry `src/main.jsx` and primary component `src/App.jsx`.
- Static/public root assets live under the project root (e.g. `public/vite.svg`) and are referenced with absolute imports like `/vite.svg`.
- ESLint is enabled (`npm run lint`) but there is no TypeScript or formatter configured by default.

## What an AI coding agent should know (high value)

- Development commands (from `package.json`):
  - `npm run dev` — start Vite dev server with HMR.
  - `npm run build` — produce a production build using Vite.
  - `npm run preview` — locally preview the production build.
  - `npm run lint` — run ESLint over the project root (fixing requires `--fix`).

- Entry points and important files:
  - `index.html` — root HTML file (loads `/src/main.jsx`).
  - `src/main.jsx` — app bootstrap (creates the React root).
  - `src/App.jsx` — primary example component and HMR demo.
  - `vite.config.js` — Vite configuration (uses `@vitejs/plugin-react`).
  - `package.json` — dependencies and scripts; note `type: "module"` and `private: true`.

- Asset patterns:
  - Import images from `src/assets/` using relative imports (e.g. `import reactLogo from './assets/react.svg'`).
  - Use leading-slash imports for public root assets (e.g. `'/vite.svg'` points to `public/vite.svg`).

- Conventions observed in this codebase:
  - Files are JS/JSX (no TypeScript). New components should use `.jsx` to match existing files.
  - React code runs inside `StrictMode` in `main.jsx`.
  - CSS is colocated in `src` (`index.css`, `App.css`) and imported from components.
  - ESLint is present; changes should aim to keep lint warnings minimal.

## Common tasks & examples (copyable intent for an agent)

- Add a new component `src/components/Hello.jsx` and import it in `src/App.jsx`.
  - New file should export a default React component and import its CSS (if any) with a relative path.

- Add a public image `public/logo.svg` and reference it from a component using `src="/logo.svg"`.

- If you modify build-related code, update `vite.config.js`. The project uses `@vitejs/plugin-react` — prefer using the plugin rather than hand-rolling JSX transforms.

## What to avoid / gotchas

- Don’t assume a backend exists in this folder — there is no API or server code here. If API integration is needed, confirm the backend location and how environment variables are provided.
- Absolute imports starting with `/` map to the dev server root (public) not the repository root on disk. For bundle-stable assets prefer placing them in `public/` or importing from `src/assets`.
- No test runner is configured in this repo — don't add tests that require a test harness without also adding the appropriate dependencies and scripts.

## When editing or adding files

- Place app code under `src/`. Keep naming consistent with existing `.jsx` and `*.css` files.
- Update `package.json` only when adding dependencies or scripts. After adding deps, include a short note in the PR about why the dependency is needed.

## Useful code references in this repo

- Dev bootstrap: `src/main.jsx`
- Example UI: `src/App.jsx`
- Build/dev config: `vite.config.js`
- Scripts & deps: `package.json`
- Public assets: `public/` (e.g. `public/vite.svg`)

## If more context is needed from the developer

- Where is the backend (if any) and how does it expect environment variables to be provided?
- Are there preferred testing or formatting tools (e.g. Jest, React Testing Library, Prettier) to add when implementing features?

Please review this draft and tell me any missing project-specific workflows or preferences to include — I will iterate.
