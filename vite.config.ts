import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // three/@react-three pesaient ~1 Mo dans le bundle unique, telecharges
        // et parses meme sur l'accueil qui n'en a pas besoin. Isoles ici, ils
        // ne partent qu'avec les pages qui les importent vraiment.
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },
})
