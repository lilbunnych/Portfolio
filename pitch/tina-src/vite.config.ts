import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Relative base: works on GitHub Pages (/Portfolio/pitch/tina/) and on the local static server.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../tina',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,
  },
})
