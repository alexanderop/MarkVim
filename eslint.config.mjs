// @ts-nocheck
import antfu from '@antfu/eslint-config'
import importPlugin from 'eslint-plugin-import'
import vueA11y from 'eslint-plugin-vuejs-accessibility'
import withNuxt from './.nuxt/eslint.config.mjs'

// Generate comprehensive module boundary restrictions
const modules = [
  'color-theme',
  'documents',
  'editor',
  'layout',
  'markdown-preview',
  'share',
  'shortcuts',
]

// Create simple pattern restrictions for module boundaries
const restrictedPatterns = []
modules.forEach((module) => {
  // Block all deep imports to this module except api.ts
  restrictedPatterns.push({
    group: [`~/modules/${module}/**`, `!~/modules/${module}/api`],
    message: `Direct imports to module internals are not allowed. Use the public API instead: import from '~/modules/${module}/api'`,
  })
})

// Note: This approach blocks all deep imports into modules except the '/api' file

export default withNuxt(
  antfu({
    // @antfu/eslint-config options
    ignores: [
      '.cursor/**/*.md',
      'reports/**/*',
      '**/*.md',
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
  // Module boundary enforcement
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: restrictedPatterns,
        },
      ],
    },
  },
  // Additional rule overrides
  {
    rules: {
      // Cyclomatic complexity rule
      // Default threshold is 20, but you can adjust based on your needs
      // Start with 'warn' to ease into it, then change to 'error'
      'complexity': ['error', { max: 15 }],
      // Arrow spacing rule
      'arrow-spacing': 'error',
      // Dot notation rule
      'dot-notation': 'off',
      // Max params rule
      'max-params': 'off',
      // No array constructor rule
      'no-array-constructor': 'error',
      // No confusing arrow rule
      'no-confusing-arrow': 'error',
      // Console rule
      'no-console': 'warn',
      // No debugger rule
      'no-debugger': 'error',
      // No else return rule
      'no-else-return': 'error',
      // Security rules
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-loop-func': 'error',
      'no-new-func': 'error',
      'no-param-reassign': 'error',
      'no-return-assign': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-unmodified-loop-condition': 'error',
    },
  },
)
