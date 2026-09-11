import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/Tracker/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Tracker', short_name: 'Tracker',
        description: 'Personal fitness planning and tracking.',
        theme_color: '#0b0e0c', background_color: '#0b0e0c', display: 'standalone', start_url: '/Tracker/',
        icons: [
          { src: '/Tracker/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/Tracker/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/Tracker/icons/icon-192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/Tracker/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
    host: 'localhost', port: 5173, strictPort: true,
    hmr: { host: 'localhost', protocol: 'ws', port: 5173 },
  },
})