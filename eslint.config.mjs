// @ts-nocheck
import antfu from '@antfu/eslint-config'
import importPlugin from 'eslint-plugin-import'
import vueA11y from 'eslint-plugin-vuejs-accessibility'
import withNuxt from './.nuxt/eslint.config.mjs'
import noUnusedEvents from './eslint-rules/no-unused-events.js'
import noUnusedModuleExports from './eslint-rules/no-unused-module-exports.js'

// Generate comprehensive module boundary restrictions
const modules = [
  'color-theme',
  'domain',
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

// Note: This blocks absolute path imports (~/modules/...) but not relative imports ('../store')
// Within a module, prefer using the module's own API for consistency

export default withNuxt(
  antfu({
    // @antfu/eslint-config options
    ignores: [
      '.cursor/**/*.md',
      'reports/**/*',
      '**/*.md',
      '.claude/settings.local.json',
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
  // Unused exports detection
  // Note: Both import/no-unused-modules and custom TypeScript-based rules have limitations:
  // - import/no-unused-modules: False positives with Vue SFC files (doesn't detect imports in <script> blocks)
  // - Custom rule: TypeScript parser doesn't provide language service needed for findReferences()
  //
  // Solution: Use Knip for accurate unused export detection
  // - Run: pnpm knip:exports (detects only unused exports)
  // - Run: pnpm knip (detects unused exports, files, dependencies, etc.)
  // - Knip properly handles Vue SFCs and provides accurate results
  //
  // See knip.json for configuration

  // Custom local rules
  {
    plugins: {
      local: {
        rules: {
          'no-unused-events': noUnusedEvents,
          'no-unused-module-exports': noUnusedModuleExports,
        },
      },
    },
    rules: {
      'local/no-unused-events': 'warn',
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
      'prefer-promise-reject-errors': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'prefer-template': 'error',
      'require-await': 'error',
      'template-curly-spacing': 'error',
      'ts/consistent-type-assertions': ['error', {
        assertionStyle: 'never',
      }],
      'vue/block-lang': ['error', {
        script: {
          lang: 'ts',
        },
      }],
      'vue/block-order': ['error', {
        order: ['script', 'template', 'style'],
      }],
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/define-emits-declaration': ['error', 'type-based'],
      'vue/define-macros-order': ['error', {
        defineExposeLast: true,
        order: ['defineProps', 'defineEmits'],
      }],
      'vue/define-props-declaration': ['error', 'type-based'],
      'vue/define-props-destructuring': ['error', {
        destructure: 'always',
      }],
      'vue/first-attribute-linebreak': ['error', {
        multiline: 'below',
        singleline: 'beside',
      }],
      'vue/html-button-has-type': 'error',
      'vue/html-comment-content-spacing': ['error', 'always'],
      'vue/max-attributes-per-line': ['error', {
        multiline: { max: 1 },
        singleline: { max: 1 },
      }],
      'vue/max-template-depth': ['error', { maxDepth: 10 }],
      // Detect undefined components in templates (catches missing imports when auto-imports are disabled)
      // This rule helps catch runtime errors when components aren't properly imported
      'vue/no-undef-components': ['error', {
        ignorePatterns: [
          // Allow Nuxt built-in components
          'ClientOnly',
          'ServerPlaceholder',
          'NuxtLink',
          'NuxtLayout',
          // Allow @nuxt/icon components (disabled - Icon must be manually imported since auto-imports are disabled)
          // Allow reka-ui components (globally registered)
          'Dialog.*',
          'ContextMenu.*',
          'AlertDialog.*',
          'Accordion.*',
          'Avatar.*',
          'Calendar.*',
          'Checkbox.*',
          'Collapsible.*',
          'Combobox.*',
          'Command.*',
          'DateField.*',
          'DatePicker.*',
          'DateRangePicker.*',
          'Dialog.*',
          'Dropdown.*',
          'EditableArea.*',
          'HoverCard.*',
          'Label.*',
          'Listbox.*',
          'Menu.*',
          'NavigationMenu.*',
          'NumberField.*',
          'Pagination.*',
          'PinInput.*',
          'Popover.*',
          'Progress.*',
          'RadioGroup.*',
          'RangeCalendar.*',
          'ScrollArea.*',
          'Select.*',
          'Separator.*',
          'Slider.*',
          'Stepper.*',
          'Switch.*',
          'Tabs.*',
          'TagsInput.*',
          'Toast.*',
          'Toggle.*',
          'Toolbar.*',
          'Tooltip.*',
          'Tree.*',
          // Allow shared/app components that should be explicitly checked
          'Base.*',
        ],
      }],
      // Require explicit return types on functions
      'ts/explicit-function-return-type': ['error', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      }],
    },
  },
)
