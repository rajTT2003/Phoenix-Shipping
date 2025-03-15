import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // Ensure Vite builds into "dist"
  },
  server: {
    port: 5173, // Default Vite port, change if needed
  },
  preview: {
    port: 4173, // Default preview port, change if needed
  },
  base: "/", // Ensures assets load correctly
});
