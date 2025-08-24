import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        map: resolve(__dirname, 'map.html'),
        confmap: resolve(__dirname, 'confmap.html')
      },
      output: {
        manualChunks: {
          vendor: ['echarts'],
          yaml: ['js-yaml']
        }
      }
    },
    // Optimize for production
    minify: 'terser',
    sourcemap: false,
    // Ensure assets are properly handled
    assetsInlineLimit: 4096
  },
  // Handle static assets
  publicDir: 'public',
  // Optimize dependencies
  optimizeDeps: {
    include: ['echarts', 'js-yaml']
  },
  // Development server settings
  server: {
    port: 3000,
    open: true
  },
  // CSS handling
  css: {
    // Ensure CSS is injected into HTML
    inject: true,
    // Process CSS for all entry points
    modules: false
  }

})
