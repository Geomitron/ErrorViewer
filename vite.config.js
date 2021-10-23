import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    exclude: ['svelte-routing']
  },
  plugins: [svelte()],
  base: '/ErrorViewer/dist/'
})
