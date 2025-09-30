# Testing Guide

This document explains the selective test execution system for MarkVim.

## Overview

MarkVim uses a modular testing approach that runs only the tests affected by code changes. This significantly reduces test execution time during development and in CI/CD pipelines.

## How It Works

### Module-to-Test Mapping

Each module has specific test files associated with it:

- **color-theme** → `color.feature`, `theme.feature`
- **documents** → `documents.feature`, `document-persistence.feature`
- **editor** → `editing.feature`, `scroll-sync.feature`, `smoke.test.feature`
- **markdown-preview** → `editing.feature`, `scroll-sync.feature`, `smoke.test.feature`
- **share** → `sharing.feature`
- **layout** → `scroll-sync.feature`, `smoke.test.feature`
- **shortcuts** → `smoke.test.feature`
- **core** → `smoke.test.feature`

### Special Cases

- **shared/** or **app/** changes → **ALL tests run** (these are shared by all modules)
- Multiple modules changed → Tests are deduplicated and run once

## Local Testing

### Run Tests for Changed Files

Test files changed since last commit:

```bash
pnpm test:affected
```

Test files changed compared to main branch:

```bash
pnpm test:affected:branch
```

### Run Tests for Specific Module

```bash
pnpm test:module <module-name>
```

Examples:

```bash
pnpm test:module color-theme
pnpm test:module documents
pnpm test:module editor
```

Available modules: `color-theme`, `documents`, `editor`, `markdown-preview`, `share`, `layout`, `shortcuts`, `core`

### Run All Tests

```bash
pnpm test:e2e:with-server
```

## CI/CD Integration

### GitHub Actions Workflow

The `.github/workflows/test-affected.yml` workflow automatically:

1. **Detects changes** using `dorny/paths-filter` action
2. **Determines test strategy**:
   - If `shared/` or `app/` changed → Run all tests
   - Otherwise → Run only affected module tests
3. **Runs tests in parallel** for multiple changed modules
4. **Uploads test reports** as artifacts

### Workflow Triggers

- Pull requests to `main`
- Pushes to `main`

## Configuration Files

### `test-mapping.json`

Defines the mapping between source modules and their test files. Used for documentation and reference.

### `cucumber.cjs`

Cucumber configuration that defines test paths, formatters, and parallel execution settings.

### Scripts

- `scripts/run-affected-tests.sh` - Detects and runs affected tests locally
- `scripts/test-module.sh` - Runs tests for a specific module

## Benefits

✅ **Faster feedback** - Only run relevant tests during development
✅ **Reduced CI time** - Skip unnecessary test execution in pipelines
✅ **Better resource usage** - Save compute time and costs
✅ **Parallel execution** - Multiple module tests can run simultaneously
✅ **Comprehensive coverage** - Shared module changes trigger full test suite

## Examples

### Scenario 1: Edit Color Theme Module

```bash
# Make changes to src/modules/color-theme/components/ColorPicker.vue
git add .
pnpm test:affected
# Runs: color.feature, theme.feature
```

### Scenario 2: Edit Shared Utility

```bash
# Make changes to src/shared/utils/eventBus.ts
git add .
pnpm test:affected
# Runs: ALL tests (shared code affects all modules)
```

### Scenario 3: Edit Multiple Modules

```bash
# Make changes to editor and documents modules
git add .
pnpm test:affected
# Runs: editing.feature, scroll-sync.feature, smoke.test.feature,
#       documents.feature, document-persistence.feature
# (automatically deduplicated)
```

## Troubleshooting

### Tests not detected

Make sure your changes are committed or staged:

```bash
git add .
pnpm test:affected
```

### Need to run all tests

Use the standard command:

```bash
pnpm test:e2e:with-server
```

### Script permission errors

Make scripts executable:

```bash
chmod +x scripts/*.sh
```
