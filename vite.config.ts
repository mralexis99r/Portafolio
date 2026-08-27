import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const deploymentHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const siteUrl = (env.SITE_URL || (deploymentHost ? `https://${deploymentHost}` : 'http://localhost:5173')).replace(/\/$/, '');

  return {
    plugins: [
      react(),
      {
        name: 'portfolio-seo-urls',
        transformIndexHtml(html) {
          return html
            .replace(/<link rel="canonical" href="[^"]+" \/>/, `<link rel="canonical" href="${siteUrl}/" />`)
            .replace(/<meta property="og:url" content="[^"]+" \/>/, `<meta property="og:url" content="${siteUrl}/" />`);
        }
      }
    ],
    server: {
      port: 5173,
      proxy: { '/api': 'http://localhost:3001' }
    },
    build: { target: 'es2022', sourcemap: false },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: true
    }
  };
});
