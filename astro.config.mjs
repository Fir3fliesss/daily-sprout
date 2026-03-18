// @ts-check
import { defineConfig } from 'astro/config';
import AstroPWA from '@vite-pwa/astro';

// https://astro.build/config
export default defineConfig({
  integrations: [
    AstroPWA({
      mode: 'development',
      base: '/',
      scope: '/',
      registerType: 'autoUpdate',
      manifest: {
        name: 'DailySprout',
        short_name: 'DailySprout',
        description: 'Gamified Todo List App',
        theme_color: '#FDFCE3',
        background_color: '#FDFCE3',
        display: 'standalone',
        icons: [
          {
            src: 'icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        navigateFallback: '/',
        globPatterns: ['**/*.{js,css,html,svg,png,ico,txt}']
      },
      devOptions: {
        enabled: true,
        navigateFallbackAllowlist: [/^\//]
      }
    })
  ]
});
