// @ts-nocheck
import antfu from '@antfu/eslint-config'
import importPlugin from 'eslint-plugin-import'
import vueA11y from 'eslint-plugin-vuejs-accessibility'
import withNuxt from './.nuxt/eslint.config.mjs'

// Generate module import restrictions
const modules = [
  'color-theme',
  'documents',
  'editor',
  'layout',
  'markdown-preview',
  'share',
  'shortcuts',
]

const moduleImportRestrictions = []

// Create individual rules for each module pair to avoid mixing glob and literal patterns
modules.forEach((moduleA) => {
  modules.forEach((moduleB) => {
    if (moduleA !== moduleB) {
      // Prevent moduleA from importing moduleB internals - one rule per moduleB
      moduleImportRestrictions.push({
        target: `./src/modules/${moduleA}/**/*`,
        from: [`./src/modules/${moduleB}/store.ts`],
        message: `Direct imports between modules are not allowed. Use module APIs instead. Import from '~/modules/${moduleB}/api' if you need functionality from the ${moduleB} module.`,
      })
      moduleImportRestrictions.push({
        target: `./src/modules/${moduleA}/**/*`,
        from: [`./src/modules/${moduleB}/stores/**/*`],
        message: `Direct imports between modules are not allowed. Use module APIs instead. Import from '~/modules/${moduleB}/api' if you need functionality from the ${moduleB} module.`,
      })
      moduleImportRestrictions.push({
        target: `./src/modules/${moduleA}/**/*`,
        from: [`./src/modules/${moduleB}/composables/**/*`],
        message: `Direct imports between modules are not allowed. Use module APIs instead. Import from '~/modules/${moduleB}/api' if you need functionality from the ${moduleB} module.`,
      })
      moduleImportRestrictions.push({
        target: `./src/modules/${moduleA}/**/*`,
        from: [`./src/modules/${moduleB}/internal/**/*`],
        message: `Direct imports between modules are not allowed. Use module APIs instead. Import from '~/modules/${moduleB}/api' if you need functionality from the ${moduleB} module.`,
      })
      moduleImportRestrictions.push({
        target: `./src/modules/${moduleA}/**/*`,
        from: [`./src/modules/${moduleB}/components/**/*`],
        message: `Direct imports between modules are not allowed. Use module APIs instead. Import from '~/modules/${moduleB}/api' if you need functionality from the ${moduleB} module.`,
      })
    }
  })
})

// Note: We only restrict cross-module imports.
// This allows:
// 1. Modules to import from themselves (including relative imports)
// 2. Anyone to import from module APIs
// 3. Prevents cross-module imports to internals

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
      'import/no-restricted-paths': [
        'error',
        {
          zones: moduleImportRestrictions,
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
      complexity: ['error', { max: 16 }],
      // Allow console.log statements
    },
  },
)
