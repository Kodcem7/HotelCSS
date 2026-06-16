import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Guests scan the room QR with whatever phone they have, including older
    // ones. Vite's default target ("baseline-widely-available") needs Safari
    // 16 / iOS 16+, so on iOS 15 and below the bundle fails to parse and the
    // whole app shows a blank white screen. Transpile down to ES2015 so older
    // mobile browsers can run it.
    target: ['es2015', 'safari11'],
  },
})
