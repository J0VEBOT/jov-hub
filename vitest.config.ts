import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/convex/_generated/**',
      'e2e/**',
      '**/*.e2e.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
      include: [
        'src/lib/**/*.{ts,tsx}',
        'convex/lib/skills.ts',
        'convex/lib/skillZip.ts',
        'convex/lib/tokens.ts',
        'convex/httpApi.ts',
        'packages/jovhub/src/**/*.ts',
        'packages/schema/src/**/*.ts',
      ],
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        'convex/_generated/',
        'packages/jovhub/src/cli/**',
        'packages/jovhub/src/cli.ts',
        'packages/jovhub/src/config.ts',
        'packages/jovhub/src/types.ts',
        'packages/schema/dist/',
        'e2e/**',
      ],
    },
  },
})
