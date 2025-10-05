# Wildcard Event Listening Examples

Your event bus now supports wildcard event listening via `onAnyAppEvent()`.

## Basic Usage

```typescript
import { onAnyAppEvent } from '@/shared/utils/eventBus'

// Listen to ALL events
onAnyAppEvent((key, payload) => {
  console.log(`[EVENT] ${key}`, payload)
})
```

## Example 1: Development Event Logger

Add to your root `App.vue` or `AppShell.vue`:

```vue
<script setup lang="ts">
import { onAnyAppEvent } from '@/shared/utils/eventBus'

// Log all events in development mode
if (import.meta.env.DEV) {
  onAnyAppEvent((key, payload) => {
    console.group(`🔔 [EVENT] ${key}`)
    console.log('Payload:', payload)
    console.log('Time:', new Date().toLocaleTimeString())
    console.groupEnd()
  })
}
</script>
```

## Example 2: Analytics Tracking

Track all user actions:

```typescript
import { onAnyAppEvent } from '@/shared/utils/eventBus'

// Track document and user events
onAnyAppEvent((key, payload) => {
  if (key.startsWith('document:') || key.startsWith('user:')) {
    window.analytics?.track(key, {
      ...payload,
      timestamp: Date.now(),
    })
  }
})
```

## Example 3: Event Counter (DevTools)

Build a simple event counter for debugging:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { onAnyAppEvent } from '@/shared/utils/eventBus'

const eventCounts = ref<Record<string, number>>({})

onAnyAppEvent((key) => {
  eventCounts.value[key] = (eventCounts.value[key] || 0) + 1
})
</script>

<template>
  <div class="event-counter">
    <h3>Event Activity</h3>
    <ul>
      <li v-for="(count, key) in eventCounts" :key="key">
        {{ key }}: {{ count }}
      </li>
    </ul>
  </div>
</template>
```

## Example 4: Filtered Wildcard

Listen only to specific event namespaces:

```typescript
import { onAnyAppEvent } from '@/shared/utils/eventBus'

// Only log editor events
onAnyAppEvent((key, payload) => {
  if (key.startsWith('editor:')) {
    console.log('Editor event:', key, payload)
  }
})

// Only log theme changes
onAnyAppEvent((key, payload) => {
  if (key.startsWith('theme:')) {
    console.log('Theme changed:', key, payload)
  }
})
```

## Example 5: Error Boundary

Catch all error-related events:

```typescript
import { onAnyAppEvent } from '@/shared/utils/eventBus'

onAnyAppEvent((key, payload) => {
  if (key.includes('error') || key.includes('fail')) {
    // Send to error tracking service
    Sentry.captureException(payload, {
      tags: { eventType: key }
    })
  }
})
```

## Example 6: Event Replay/Debugging

Record and replay events for debugging:

```typescript
import { ref } from 'vue'
import { onAnyAppEvent, emitAppEvent } from '@/shared/utils/eventBus'

const eventLog = ref<Array<{ key: string; payload: any; timestamp: number }>>([])

// Record all events
onAnyAppEvent((key, payload) => {
  eventLog.value.push({
    key,
    payload,
    timestamp: Date.now(),
  })
})

// Replay events later
function replayEvents() {
  eventLog.value.forEach(({ key, payload }) => {
    emitAppEvent(key, payload)
  })
}
```

## Auto-Cleanup

Like all event bus functions, `onAnyAppEvent` automatically unsubscribes when the component unmounts:

```vue
<script setup lang="ts">
import { onAnyAppEvent } from '@/shared/utils/eventBus'

// This listener will be automatically removed when component unmounts
onAnyAppEvent((key, payload) => {
  console.log(key, payload)
})
</script>
```

## Manual Cleanup

If you need manual control:

```typescript
import { onAnyAppEvent } from '@/shared/utils/eventBus'

const off = onAnyAppEvent((key, payload) => {
  console.log(key, payload)
})

// Later: manually unsubscribe
off()
```

## Performance Note

Wildcard handlers are called on **every** event emission. Use them sparingly:

✅ **Good use cases:**
- Development logging
- Analytics (filtered by namespace)
- Error tracking
- DevTools/debugging panels

❌ **Avoid:**
- Heavy computation in wildcard handlers
- Too many wildcard handlers
- Production performance-critical paths

## Type Safety

The wildcard handler is fully typed:

```typescript
onAnyAppEvent((key, payload) => {
  // `key` is typed as AppEventKey (union of all event keys)
  // `payload` is typed as AppEvents[K] for the specific key

  // TypeScript knows the payload type based on the key
  if (key === 'document:create') {
    // payload is typed as DocumentsEvents['document:create']
  }
})
```
