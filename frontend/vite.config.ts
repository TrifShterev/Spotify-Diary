import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The API lives behind the same origin as the SPA, so Clerk's session cookie
// is sent along with every /api request without CORS or bearer tokens.
const proxy = {
  '/api': 'http://localhost:3030',
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    strictPort: true,
    proxy,
  },
  preview: {
    proxy,
  },
});
