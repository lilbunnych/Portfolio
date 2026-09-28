import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// Relative base: works on GitHub Pages (/Portfolio/pitch/borukhson/) and on the local static server.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: {
    outDir: '../borukhson',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,
  },
})
