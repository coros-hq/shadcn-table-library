import { defineConfig } from 'vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { nitro } from 'nitro/vite';

const searchParamRoutes = ['/server-table', '/server-filter', '/server-combined-table', '/params-filter-table', '/logs-table', '/builder'];

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
const config = defineConfig({
  // Lets the nav expire "New" badges against the deploy date, so prerendered
  // HTML and the client always agree on which badges show
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
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
  }), viteReact(), nitro()]
});
export default config;
