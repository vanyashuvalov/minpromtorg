/**
 * Astro project configuration.
 * This file exists to define the app runtime defaults, future-proof the build setup, and keep deployment behavior explicit for Cloudflare Pages.
 * It now wires in Tailwind 4 so the design can be rebuilt with a ready-made UI kit direction instead of handwritten CSS only.
 * Connected to: `src/pages`, `src/layouts`, Vite alias resolution, Tailwind 4, and eventual Cloudflare Pages deployment settings.
 */
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Disable the Astro Dev Toolbar for this project so local development stays visually clean and focused on the landing page itself.
  devToolbar: {
    enabled: false,
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
});
