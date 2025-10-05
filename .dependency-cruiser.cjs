/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    /* ====================================================================
     * Module Boundary Rules - Enforce Modular Architecture
     * ==================================================================== */

    {
      name: 'no-cross-module-imports',
      comment:
        'Modules can only communicate via public api.ts facades. Direct cross-module imports are forbidden.',
      severity: 'error',
      from: {
        path: '^src/modules/([^/]+)/',
      },
      to: {
        path: '^src/modules/([^/]+)/',
        pathNot: [
          // Allow imports from same module
          '^src/modules/$1/',
          // Allow imports via public API
          '^src/modules/[^/]+/api\\.ts$',
        ],
      },
    },

    {
      name: 'no-internal-imports',
      comment:
        'Internal implementation details (store, composables, utils, components) cannot be imported from outside the module. Use api.ts instead.',
      severity: 'error',
      from: {
        pathNot: '^src/modules/([^/]+)/',
      },
      to: {
        path: '^src/modules/([^/]+)/(store\\.ts$|composables/|utils/|components/)',
      },
    },

    {
      name: 'modules-only-import-shared',
      comment:
        'Modules should only import from shared/, types/, or other module APIs. No direct cross-module implementation imports.',
      severity: 'error',
      from: {
        path: '^src/modules/',
      },
      to: {
        path: '^src/',
        pathNot: [
          '^src/shared/',
          '^src/types/',
          '^src/modules/[^/]+/api\\.ts$',
          '^src/modules/[^/]+/', // same module
        ],
      },
    },

    /* ====================================================================
     * Circular Dependency Prevention
     * ==================================================================== */

    {
      name: 'no-circular',
      comment:
        'Circular dependencies create tight coupling and make code harder to understand and maintain.',
      severity: 'error',
      from: {},
      to: {
        circular: true,
      },
    },

    /* ====================================================================
     * Shared Code Rules
     * ==================================================================== */

    {
      name: 'shared-no-module-imports',
      comment:
        'Shared code cannot depend on feature modules. It must remain generic and reusable.',
      severity: 'error',
      from: {
        path: '^src/shared/',
      },
      to: {
        path: '^src/modules/',
      },
    },

    /* ====================================================================
     * Layer Architecture Rules
     * ==================================================================== */

    {
      name: 'no-component-to-store',
      comment:
        'Components should use composables/facades, not access stores directly. This enforces proper layering.',
      severity: 'warn',
      from: {
        path: '.*\\.vue$',
      },
      to: {
        path: '/store\\.ts$',
      },
    },

    /* ====================================================================
     * Dead Code Detection
     * ==================================================================== */

    {
      name: 'no-orphans',
      comment:
        'Orphan modules (not imported anywhere) indicate dead code or missing integration.',
      severity: 'warn',
      from: {
        orphan: true,
        pathNot: [
          // Entry points that are expected orphans
          '\\.(spec|test)\\.(js|ts|vue)$',
          '^src/app\\.vue$',
          '^src/error\\.vue$',
          'nuxt\\.config\\.ts$',
          '^scripts/',
          '^tests/',
          // Type definitions and ambient modules
          '\\.d\\.ts$',
          // Event definitions (imported dynamically)
          '/events\\.ts$',
          '^src/shared/events',
          // Shared utilities (may be imported via auto-imports)
          '^src/shared/utils/',
          '^src/shared/composables/',
          '^src/shared/components/',
          '^src/shared/services/',
          '^src/shared/contracts/',
          '^src/shared/schemas/',
          '^src/shared/types/',
          // Plugins (loaded by Nuxt)
          '^src/plugins/',
          // Module-specific files (may be imported via auto-imports or dynamically)
          '^src/modules/.*/types\\.ts$',
          '^src/modules/.*/composables/',
        ],
      },
      to: {},
    },
  ],

  options: {
    /* Resolve configuration */
    tsConfig: {
      fileName: 'tsconfig.json',
    },

    /* Module system support */
    moduleSystems: ['es6', 'cjs'],

    /* What to include in analysis */
    includeOnly: '^src/',

    /* What to exclude */
    exclude: {
      path: [
        'node_modules',
        '\\.nuxt',
        'dist',
        '\\.spec\\.(ts|js)$',
        '\\.test\\.(ts|js)$',
        'tests/',
      ],
    },

    /* Enhanced module resolution for Nuxt/Vue */
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
      extensions: ['.ts', '.js', '.vue', '.json'],
      mainFields: ['module', 'main'],
    },

    /* Report all violations, not just the first one */
    reporterOptions: {
      dot: {
        collapsePattern: '^src/modules/[^/]+',
      },
      archi: {
        collapsePattern: '^src/(modules|shared)/[^/]+',
      },
      text: {
        highlightFocused: true,
      },
    },

    /* Performance */
    cache: true,
  },
}
