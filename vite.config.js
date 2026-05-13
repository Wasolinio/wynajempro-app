import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/menadzer/", // POPRAWIONE: musi być "menadzer" (przez a), tak jak w Twoim linku na GitHubie!
})