import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

const CSP = [
  "default-src 'self'",
  "script-src 'self' https://script.google.com https://script.googleusercontent.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://server.arcgisonline.com",
  "connect-src 'self' https://script.google.com https://script.googleusercontent.com https://api.open-meteo.com",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://script.google.com",
  "upgrade-insecure-requests",
].join('; ');

export default defineConfig(({ command }) => {
  return {
    base: process.env.NODE_ENV === 'production' ? '/Senderos-GM/' : '/',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'senderos-csp',
        transformIndexHtml(html: string) {
          // En desarrollo se salta: Vite y React Refresh usan scripts inline.
          if (command !== 'build') return html;
          // Va al principio del <head> para que cubra también los recursos
          // que se cargan más abajo.
          return html.replace(
            '<head>',
            `<head>\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
          );
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
