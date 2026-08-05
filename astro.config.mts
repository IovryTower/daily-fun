import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.VERCEL ? 'https://daily-fun-psi.vercel.app' : 'https://iovrytower.github.io',
  base: process.env.VERCEL ? undefined : '/daily-fun',
  output: 'static',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
