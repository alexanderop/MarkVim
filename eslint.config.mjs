// @ts-check
import antfu from '@antfu/eslint-config'
import vueA11y from 'eslint-plugin-vuejs-accessibility'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu({
    // @antfu/eslint-config options
    ignores: [
      '.cursor/**/*.md',
      'reports/**/*',
    ],
  }),
  // Vue accessibility plugin
  {
    plugins: {
      'vuejs-accessibility': vueA11y,
    },
    rules: {
      ...vueA11y.configs.recommended.rules,
      // Disable label-has-for as we're using proper id/for associations
      'vuejs-accessibility/label-has-for': 'off',
    },
  },
  // Additional rule overrides
  {
    rules: {
      // Cyclomatic complexity rule
      // Default threshold is 20, but you can adjust based on your needs
      // Start with 'warn' to ease into it, then change to 'error'
      complexity: ['error', { max: 16 }],
      // Allow console.log statements
    },
  },
)
