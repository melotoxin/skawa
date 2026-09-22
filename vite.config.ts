import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  build: {
    // The optional Three.js scene is isolated behind a dynamic import and never
    // blocks the storefront. Its minified chunk is intentionally larger than
    // the default warning threshold while remaining ~233 kB over the wire.
    chunkSizeWarningLimit: 900,
  },
})
