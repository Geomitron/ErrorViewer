import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

const REPO_NAME = 'ErrorViewer'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  root: './src/',
  build: {
    outDir: '../dist/',
  },
  optimizeDeps: {
    exclude: ['svelte-routing']
  },
  plugins: [svelte({ configFile: '../svelte.config.js' })],
  define: { viteDefine_basePath: JSON.stringify(command == 'serve' ? '/src' : `/${REPO_NAME}/dist`) },
  base: command == 'serve' ? '/src/' : `/${REPO_NAME}/dist/`
}))
