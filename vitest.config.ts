import { fileURLToPath } from 'node:url'
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    globals: true,
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
      },
    },
    alias: {
      '~/tests': fileURLToPath(new URL('./tests', import.meta.url)),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,vue}'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/*.d.ts',
        'src/**/api.ts',
      ],
    },
  },
})
