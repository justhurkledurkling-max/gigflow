import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Served at https://phoenixtbird.com/gigflow/ (GitHub Pages project site),
// so every asset URL must be prefixed with /gigflow/.
export default defineConfig({
  plugins: [react()],
  base: '/gigflow/',
})
