// @ts-check
import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu({
    // @antfu/eslint-config options
    ignores: [
      '.cursor/**/*.md',
      'reports/**/*',
    ],
  }),
  // Additional rule overrides
  {
    rules: {
      // Cyclomatic complexity rule
      // Default threshold is 20, but you can adjust based on your needs
      // Start with 'warn' to ease into it, then change to 'error'
      complexity: ['error', { max: 16 }],
    },
  },
)
