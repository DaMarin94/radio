import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@radio/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg', 'favicon-16.svg', 'icon-16.png', 'icon-32.png', 'icon-180.png', 'icon-512.png'],
      manifest: {
        name: 'Radio',
        short_name: 'Radio',
        description: 'Sintonizador de radio FM/AM',
        theme_color: '#101010',
        background_color: '#101010',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'es',
        icons: [
          { src: 'icon-512.png',             sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache app shell only
        globPatterns: ['**/*.{js,css,html,svg,ico,png,woff2}'],
        navigateFallback: '/index.html',
        // No runtime caching — audio streams and API go direct to network
        runtimeCaching: [],
      },
    }),
  ],
})
