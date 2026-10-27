import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://solusiaplikasi.id',
  output: 'static',
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        !page.includes('/preview') &&
        !page.includes('/staging') &&
        !page.includes('/admin') &&
        !page.includes('/login'),
      serialize(item) {
        if (item.url === 'https://solusiaplikasi.id/') {
          item.priority = 1.0;
          item.changefreq = 'weekly';
        } else if (item.url.includes('/products/') || item.url.includes('/about-us') || item.url.includes('/request-demo')) {
          item.priority = 0.9;
          item.changefreq = 'weekly';
        } else if (item.url.includes('/articles/')) {
          item.priority = 0.8;
          item.changefreq = 'weekly';
        } else {
          item.priority = 0.5;
          item.changefreq = 'monthly';
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
  build: {
    format: 'directory',
  },
});
