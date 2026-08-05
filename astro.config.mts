import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

const isGitHubPages = !process.env.VERCEL && !process.env.CF_PAGES;

export default defineConfig({
  site: isGitHubPages
    ? 'https://iovrytower.github.io'
    : process.env.CF_PAGES
      ? `https://${process.env.CF_PAGES_URL || 'daily-fun.pages.dev'}`
      : 'https://daily-fun-psi.vercel.app',
  base: isGitHubPages ? '/daily-fun' : undefined,
  output: 'static',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
