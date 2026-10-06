import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://felegegenet.org.uk', // Official domain to be confirmed by trustees
  integrations: [tailwind()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'am'],
    routing: {
      prefixDefaultLocale: false
    }
  }
});
