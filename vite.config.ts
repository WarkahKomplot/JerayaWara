import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          maplibre: ['maplibre-gl'],
          dexie: ['dexie'],
          vendor: ['react', 'react-dom']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
});

