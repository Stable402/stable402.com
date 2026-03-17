// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://stable402.com',
  integrations: [
    starlight({
      title: 'Stable402',
      description:
        'Reference implementations for the x402 agentic payment protocol ecosystem — built on Cloudflare Workers.',
      customCss: ['./src/styles/custom.css'],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/Stable402' },
      ],
      sidebar: [
        {
          label: 'POC Reference',
          items: [
            { label: 'POC 1 — x402 Basic Gate', slug: 'demos/gate' },
          ],
        },
      ],
    }),
  ],
});
