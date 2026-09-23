// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Inline CSS so dist/index.html works from any sub-folder (portfolio hub, GitHub Pages).
export default defineConfig({
  build: { inlineStylesheets: 'always' },
  vite: { plugins: [tailwindcss()] },
});
