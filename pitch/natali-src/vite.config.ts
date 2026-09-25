import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Relative base so the build works both on GitHub Pages (/Portfolio/pitch/natali/)
// and on the local static server. The build replaces the published folder.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../natali',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,
  },
})
