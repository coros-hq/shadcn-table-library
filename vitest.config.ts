import { defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Kept apart from vite.config.ts on purpose: the app config loads TanStack
// Start, Nitro and devtools, which tests don't need and which keep the test
// process from exiting.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [viteReact()],
  test: {
    projects: [
      {
        // Fast jsdom smoke tests: `npm run test:unit`
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['src/**/*.test.{ts,tsx}'],
          setupFiles: ['./src/test/setup.ts'],
        },
      },
      {
        // Runs the stories in a real browser (not part of CI: the template
        // stories under src/stories already fail against the TanStack router
        // decorator), see
        // https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
        extends: true,
        plugins: [
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
