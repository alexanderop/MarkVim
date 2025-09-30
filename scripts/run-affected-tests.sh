#!/bin/bash

# Script to run tests for affected modules based on git changes
# Usage: ./scripts/run-affected-tests.sh [base-ref]
# Example: ./scripts/run-affected-tests.sh main

set -e

BASE_REF="${1:-HEAD~1}"
CURRENT_REF="HEAD"

echo "🔍 Detecting changes between $BASE_REF and $CURRENT_REF..."

# Get list of changed files
CHANGED_FILES=$(git diff --name-only "$BASE_REF" "$CURRENT_REF")

if [ -z "$CHANGED_FILES" ]; then
  echo "ℹ️  No changes detected. Skipping tests."
  exit 0
fi

echo "📝 Changed files:"
echo "$CHANGED_FILES"
echo ""

# Check if shared or app modules changed
if echo "$CHANGED_FILES" | grep -qE '^src/(shared|app)/'; then
  echo "🔄 Shared or app modules changed - running ALL tests"
  pnpm test:e2e:with-server
  exit 0
fi

# Collect unique test files to run
TESTS_TO_RUN=()

# Check each module
if echo "$CHANGED_FILES" | grep -q '^src/modules/color-theme/'; then
  echo "✅ color-theme module changed"
  TESTS_TO_RUN+=("tests/features/color.feature" "tests/features/theme.feature")
fi

if echo "$CHANGED_FILES" | grep -q '^src/modules/documents/'; then
  echo "✅ documents module changed"
  TESTS_TO_RUN+=("tests/features/documents.feature" "tests/features/document-persistence.feature")
fi

if echo "$CHANGED_FILES" | grep -q '^src/modules/editor/'; then
  echo "✅ editor module changed"
  TESTS_TO_RUN+=("tests/features/editing.feature" "tests/features/scroll-sync.feature" "tests/features/smoke.test.feature")
fi

if echo "$CHANGED_FILES" | grep -q '^src/modules/markdown-preview/'; then
  echo "✅ markdown-preview module changed"
  TESTS_TO_RUN+=("tests/features/editing.feature" "tests/features/scroll-sync.feature" "tests/features/smoke.test.feature")
fi

if echo "$CHANGED_FILES" | grep -q '^src/modules/share/'; then
  echo "✅ share module changed"
  TESTS_TO_RUN+=("tests/features/sharing.feature")
fi

if echo "$CHANGED_FILES" | grep -q '^src/modules/layout/'; then
  echo "✅ layout module changed"
  TESTS_TO_RUN+=("tests/features/scroll-sync.feature" "tests/features/smoke.test.feature")
fi

if echo "$CHANGED_FILES" | grep -q '^src/modules/shortcuts/'; then
  echo "✅ shortcuts module changed"
  TESTS_TO_RUN+=("tests/features/smoke.test.feature")
fi

if echo "$CHANGED_FILES" | grep -q '^src/modules/core/'; then
  echo "✅ core module changed"
  TESTS_TO_RUN+=("tests/features/smoke.test.feature")
fi

# Remove duplicates and run tests
if [ ${#TESTS_TO_RUN[@]} -eq 0 ]; then
  echo "ℹ️  No module changes detected. Skipping tests."
  exit 0
fi

UNIQUE_TESTS=($(echo "${TESTS_TO_RUN[@]}" | tr ' ' '\n' | sort -u | tr '\n' ' '))

echo ""
echo "🧪 Running tests for affected modules:"
for test in "${UNIQUE_TESTS[@]}"; do
  echo "  - $test"
done
echo ""

# Start dev server in background
echo "🚀 Starting dev server..."
pnpm dev > /dev/null 2>&1 &
DEV_PID=$!

# Wait for server to be ready
npx wait-on http://localhost:3000 --timeout 30000

# Run the tests
echo "▶️  Running tests..."
NODE_OPTIONS='--loader ts-node/esm' pnpm exec cucumber-js "${UNIQUE_TESTS[@]}"
TEST_EXIT_CODE=$?

# Cleanup
echo "🧹 Stopping dev server..."
kill $DEV_PID 2>/dev/null || true

if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "✅ All affected tests passed!"
else
  echo "❌ Some tests failed"
  exit $TEST_EXIT_CODE
fi
