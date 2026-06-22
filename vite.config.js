import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { copyFileSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
    {
      name: 'copy-firebase-sw',
      closeBundle() {
        // Copy service worker to dist after build
        try {
          copyFileSync('public/firebase-messaging-sw.js', 'dist/firebase-messaging-sw.js');
          console.log('✓ Copied firebase-messaging-sw.js to dist');
        } catch (err) {
          console.warn('Could not copy service worker:', err.message);
        }
      }
    }
  ],
  server: {
    port: 3000,
    open: true,
    https: true, // Enable HTTPS for local development
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
