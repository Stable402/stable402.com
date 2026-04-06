// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

export default defineConfig({
  site: 'https://stable402.com',
  outDir: './dist',
  integrations: [preact()],
});
