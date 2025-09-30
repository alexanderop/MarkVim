#!/bin/bash

# Script to run tests for a specific module
# Usage: ./scripts/test-module.sh <module-name>
# Example: ./scripts/test-module.sh color-theme

set -e

MODULE="$1"

if [ -z "$MODULE" ]; then
  echo "❌ Error: Module name required"
  echo ""
  echo "Usage: ./scripts/test-module.sh <module-name>"
  echo ""
  echo "Available modules:"
  echo "  - color-theme"
  echo "  - documents"
  echo "  - editor"
  echo "  - markdown-preview"
  echo "  - share"
  echo "  - layout"
  echo "  - shortcuts"
  echo "  - core"
  exit 1
fi

# Define test mappings
declare -A MODULE_TESTS

MODULE_TESTS[color-theme]="tests/features/color.feature tests/features/theme.feature"
MODULE_TESTS[documents]="tests/features/documents.feature tests/features/document-persistence.feature"
MODULE_TESTS[editor]="tests/features/editing.feature tests/features/scroll-sync.feature tests/features/smoke.test.feature"
MODULE_TESTS[markdown-preview]="tests/features/editing.feature tests/features/scroll-sync.feature tests/features/smoke.test.feature"
MODULE_TESTS[share]="tests/features/sharing.feature"
MODULE_TESTS[layout]="tests/features/scroll-sync.feature tests/features/smoke.test.feature"
MODULE_TESTS[shortcuts]="tests/features/smoke.test.feature"
MODULE_TESTS[core]="tests/features/smoke.test.feature"

# Check if module exists
if [ -z "${MODULE_TESTS[$MODULE]}" ]; then
  echo "❌ Error: Unknown module '$MODULE'"
  echo ""
  echo "Available modules:"
  for key in "${!MODULE_TESTS[@]}"; do
    echo "  - $key"
  done
  exit 1
fi

TESTS="${MODULE_TESTS[$MODULE]}"

echo "🧪 Running tests for module: $MODULE"
echo "📝 Test files: $TESTS"
echo ""

# Start dev server in background
echo "🚀 Starting dev server..."
pnpm dev > /dev/null 2>&1 &
DEV_PID=$!

# Wait for server to be ready
npx wait-on http://localhost:3000 --timeout 30000

# Run the tests
echo "▶️  Running tests..."
NODE_OPTIONS='--loader ts-node/esm' pnpm exec cucumber-js $TESTS
TEST_EXIT_CODE=$?

# Cleanup
echo "🧹 Stopping dev server..."
kill $DEV_PID 2>/dev/null || true

if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "✅ All tests passed for module: $MODULE"
else
  echo "❌ Some tests failed for module: $MODULE"
  exit $TEST_EXIT_CODE
fi
