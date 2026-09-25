# Portfolio

Monorepo of independent demo projects (websites and apps) for a developer portfolio.

## Structure

- Each demo is a self-contained subfolder in kebab-case (e.g. `first-demo/`).
- Each demo picks its own stack; do not share dependencies or configs between demos.
- Default stack for new demos and pitch sites: Vite + React + TypeScript + Tailwind v4 (Motion, react-three-fiber for 3D). Use Next.js when a site needs SEO/SSR. Plain HTML only on request.
- For GitHub Pages, set Vite `base` to the demo's subfolder path.
- Each demo has its own `README.md` with name, goal, stack, and run instructions.
- When adding a demo, add a row to the table in the root `README.md` and a card in the hub (`index.html`, `PROJECTS` list) with a screenshot in `_hub/shots/`.
- Every demo shows the yellow "DEMO" notice at the bottom (see `_snippets/demo-banner.html`) and has `<meta name="robots" content="noindex">`.
- Built demos commit their `dist/` so the hub works without a build step.

## Conventions

- Ask the user about visual style before building UI; do not assume a default aesthetic.
- For UI work, use the taste-skill and ui-ux-pro-max skills.
