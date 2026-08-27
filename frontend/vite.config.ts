import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const BACKEND_ORIGIN = 'http://localhost:3000';

export default defineConfig({
  server: {
    // better-auth rejects the dev server's own origin as untrusted, so the proxy has to
    // present itself as the backend. Production is same-origin and needs none of this.
    proxy: {
      // `ws` is what carries the upgrade for `/api/events` through to the backend; without it
      // the dev server answers the handshake itself and the socket never connects.
      '/api': { target: BACKEND_ORIGIN, headers: { origin: BACKEND_ORIGIN }, ws: true },
      // The docs page and the spec it fetches are served by the backend, so the dev server
      // has to hand both over rather than answering with the SPA.
      '/openapi': { target: BACKEND_ORIGIN },
    },
  },
  plugins: [
    tailwindcss(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
  ],
});
