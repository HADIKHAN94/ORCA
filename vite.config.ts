import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Exclude non-source files that cause EBUSY errors (e.g. locked video files)
      ignored: ['**/*.mp4', '**/*.mov', '**/*.avi', '**/*.mkv', '**/node_modules/**'],
    },
  },
})
