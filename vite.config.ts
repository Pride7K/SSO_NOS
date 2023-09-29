// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from 'tailwindcss';

export default defineConfig({
  plugins: [
    react(),
    VitePWA(),
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss, // Certifique-se de importar corretamente o tailwindcss
      ],
    },
  },
});
