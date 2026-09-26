/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { nitro } from 'nitro/vite';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));
const searchParamRoutes = ['/server-table', '/server-filter', '/server-combined-table', '/params-filter-table', '/logs-table'];

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
const config = defineConfig({
  resolve: {
    tsconfigPaths: true
  },
  plugins: [devtools(), tailwindcss(), tanstackStart({
    // Serve docs pages as static HTML from the CDN instead of rendering them
    // in a serverless function on every request (cold starts hurt TTFB/FCP).
    prerender: {
      enabled: true,
      crawlLinks: true,
      // These render from URL search params on the server, so a static copy
      // would always show the default state for deep links like ?page=3.
      filter: ({ path }) => !searchParamRoutes.some((route) => path.startsWith(route)),
    },
  }), viteReact(), nitro()],
  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }]
  }
});
export default config;
