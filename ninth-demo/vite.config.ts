import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// Relative base: the PWA works from any sub-folder.
export default defineConfig({
  base: './',
  plugins: [svelte()],
})
