# Mitt vs VueUse Event Bus: A Deep Dive

## What is Wildcard Event Listening?

Wildcard event listening allows you to listen to **all events** using a special `*` handler, rather than subscribing to each event individually. This is useful for:

- **Debugging** - Log all events flowing through your app
- **Analytics** - Track every user interaction in one place
- **Middleware** - Intercept and modify events before they reach handlers
- **Developer tools** - Build DevTools panels showing real-time event streams

### Example: Wildcard Event Listening with Mitt

```typescript
import mitt from 'mitt'

const emitter = mitt()

// Regular specific listeners
emitter.on('user:login', (user) => console.log('User logged in:', user))
emitter.on('document:create', (doc) => console.log('Document created:', doc))

// Wildcard listener - receives ALL events
emitter.on('*', (type, payload) => {
  console.log(`[EVENT] ${type}`, payload)
  // Log to analytics, send to DevTools, etc.
})

// When you emit:
emitter.emit('user:login', { id: '123', name: 'Alice' })
// Console output:
// [EVENT] user:login { id: '123', name: 'Alice' }
// User logged in: { id: '123', name: 'Alice' }

emitter.emit('document:create', { title: 'My Doc' })
// Console output:
// [EVENT] document:create { title: 'My Doc' }
// Document created: { title: 'My Doc' }
```

**Key insight**: The `*` handler receives `(eventType, payload)` while regular handlers only receive `(payload)`.

---

## Mitt: The Minimalist Event Bus

### Pros

**1. Tiny Bundle Size (200 bytes)**
```typescript
import mitt from 'mitt'

const emitter = mitt()
// That's it. Ultra-lightweight.
```

**2. Framework-Agnostic**
Works anywhere JavaScript runs: React, Vue, Svelte, Node.js, vanilla JS.

**3. Wildcard Events**
```typescript
// Global event logger
emitter.on('*', (type, payload) => {
  logToAnalytics(type, payload)
})

// Global error boundary
emitter.on('*', (type, payload) => {
  if (type.startsWith('error:')) {
    captureException(type, payload)
  }
})
```

**4. Simple API**
```typescript
emitter.on(type, handler)     // Listen
emitter.off(type, handler)    // Unlisten
emitter.emit(type, payload)   // Emit
emitter.all.clear()           // Clear all listeners
```

**5. TypeScript Support**
```typescript
type Events = {
  'user:login': { id: string; name: string }
  'document:create': { title: string }
  'error:network': Error
}

const emitter = mitt<Events>()

emitter.on('user:login', (user) => {
  // `user` is typed as { id: string; name: string }
})

// Type error: wrong payload type
emitter.emit('user:login', { wrong: 'type' }) // ❌ Error
```

### Cons

**1. Manual Memory Management**
```typescript
// Component A
function ComponentA() {
  const handler = (data) => console.log(data)

  emitter.on('document:update', handler)

  // ❌ Easy to forget cleanup!
  onUnmount(() => {
    emitter.off('document:update', handler)
  })
}
```

**2. No Vue Lifecycle Integration**
No automatic cleanup when Vue components unmount → potential memory leaks.

**3. No Reactivity**
Not designed to work with Vue's reactivity system.

**4. Handler Reference Required for Cleanup**
```typescript
// Must keep reference to remove
const handler = (data) => console.log(data)
emitter.on('foo', handler)
emitter.off('foo', handler) // Need same reference

// This doesn't work:
emitter.on('foo', (data) => console.log(data))
emitter.off('foo', (data) => console.log(data)) // Different reference!
```

---

## VueUse Event Bus: The Vue-Integrated Approach

### Pros

**1. Automatic Lifecycle Management**
```typescript
import { useEventBus } from '@vueuse/core'

// Component automatically unsubscribes on unmount
const bus = useEventBus<string>('document:update')

bus.on((data) => {
  console.log(data)
})
// ✅ No manual cleanup needed!
```

**2. No Memory Leaks**
VueUse automatically calls `tryOnScopeDispose()` to clean up listeners when the component unmounts.

```typescript
import { tryOnScopeDispose } from '@vueuse/core'

function onAppEvent(key, handler) {
  const bus = busFor(key)
  const off = bus.on(handler)

  // Auto-cleanup when component unmounts
  tryOnScopeDispose(off)

  return off
}
```

**3. Vue-First Design**
Designed to work seamlessly with Vue's composition API and lifecycle.

```typescript
// In a Vue component
<script setup>
import { onAppEvent } from '@/shared/utils/eventBus'

// Automatically cleaned up when component unmounts
onAppEvent('document:create', (doc) => {
  console.log('New document:', doc)
})
</script>
```

**4. Already in Your Bundle (if using VueUse)**
If you're using VueUse for other utilities (like `useLocalStorage`, `useThrottleFn`, etc.), the event bus comes at zero marginal cost.

**5. Can Still Be Strongly Typed**
```typescript
interface AppEvents {
  'document:create': { id: string; title: string }
  'document:update': { id: string; content: string }
  'user:login': { id: string; name: string }
}

type AppEventKey = keyof AppEvents

function onAppEvent<K extends AppEventKey>(
  key: K,
  handler: (payload: AppEvents[K]) => void
): () => void {
  const bus = useEventBus<AppEvents[K]>(key)
  const off = bus.on(handler)
  tryOnScopeDispose(off)
  return off
}

// Usage:
onAppEvent('document:create', (doc) => {
  // `doc` is typed as { id: string; title: string }
})
```

### Cons

**1. Larger Bundle (if not already using VueUse)**
VueUse is ~20KB (gzipped). If you only need event bus, this is overkill.

**2. Vue-Specific**
Can't use in React, Svelte, or vanilla JS projects.

**3. No Wildcard Events**
Can't listen to all events with a single `*` handler.

```typescript
// ❌ Not possible with VueUse
bus.on('*', (type, payload) => {
  // This doesn't exist
})
```

**4. Separate Bus Per Event**
```typescript
// VueUse: each key gets its own bus instance
const docBus = useEventBus('document:create')
const userBus = useEventBus('user:login')

// Mitt: single emitter for all events
const emitter = mitt()
emitter.on('document:create', ...)
emitter.on('user:login', ...)
```

---

## Side-by-Side Comparison

| Feature | Mitt | VueUse Event Bus |
|---------|------|------------------|
| **Bundle Size** | 200 bytes | ~20KB (if not already using VueUse) |
| **Framework** | Agnostic | Vue-specific |
| **Auto Cleanup** | ❌ Manual | ✅ Automatic |
| **Wildcard Events** | ✅ Yes (`*` handler) | ❌ No |
| **TypeScript** | ✅ Full support | ✅ Full support |
| **Memory Leaks** | ⚠️ Risk if you forget cleanup | ✅ Protected |
| **Vue Lifecycle** | ❌ Manual integration | ✅ Built-in |
| **Learning Curve** | Very simple | Simple (if you know Vue) |

---

## When to Use Mitt

✅ **Use mitt if:**
- Building a **framework-agnostic library**
- Need **wildcard event listening** for debugging/analytics
- Want the **smallest possible bundle**
- Working in **vanilla JS, React, Svelte, or Node.js**
- Don't mind managing cleanup manually

**Example use case:**
```typescript
// Analytics middleware
const emitter = mitt()

// Log all events to analytics
emitter.on('*', (type, payload) => {
  if (type.startsWith('user:') || type.startsWith('document:')) {
    analytics.track(type, payload)
  }
})

// All events automatically tracked
emitter.emit('user:login', user)
emitter.emit('document:create', doc)
```

---

## When to Use VueUse Event Bus

✅ **Use VueUse if:**
- Building a **Vue/Nuxt application**
- Already using VueUse for other utilities
- Want **automatic memory management**
- Prioritize **developer safety** over bundle size
- Don't need wildcard events

**Example use case:**
```typescript
// Vue component - safe, auto-cleanup
<script setup>
import { onAppEvent } from '@/shared/utils/eventBus'

onAppEvent('document:update', (doc) => {
  // Automatically unsubscribes when component unmounts
  updateLocalState(doc)
})
</script>
```

---

## Hybrid Approach: Best of Both Worlds?

You could combine both if you need wildcard events AND Vue lifecycle management:

```typescript
import mitt from 'mitt'
import { tryOnScopeDispose } from '@vueuse/core'

const globalEmitter = mitt<AppEvents>()

export function onAppEvent<K extends AppEventKey>(
  key: K,
  handler: (payload: AppEvents[K]) => void
): () => void {
  globalEmitter.on(key, handler)

  const off = () => globalEmitter.off(key, handler)
  tryOnScopeDispose(off)

  return off
}

export function onAllEvents(
  handler: (type: AppEventKey, payload: any) => void
): () => void {
  globalEmitter.on('*', handler)

  const off = () => globalEmitter.off('*', handler)
  tryOnScopeDispose(off)

  return off
}

// Now you get:
// ✅ Wildcard events (from mitt)
// ✅ Auto cleanup (from VueUse)
// ✅ Type safety (from TypeScript)
```

**Trade-off**: Added complexity + both dependencies in bundle.

---

## MarkVim's Choice: VueUse

For **MarkVim**, we chose VueUse because:

1. **Already using VueUse** - Zero marginal bundle cost
2. **Vue-only app** - No need for framework agnosticism
3. **Safety first** - Auto cleanup prevents memory leaks
4. **Don't need wildcards** - Specific event handlers are sufficient

**If we needed wildcard events** (e.g., for a DevTools panel showing all events), we'd consider the hybrid approach.

---

## Conclusion

**Mitt** = Tiny, flexible, framework-agnostic, great for libraries and debugging.

**VueUse** = Safe, integrated, Vue-first, great for applications.

Choose based on:
- Framework constraints
- Bundle size priorities
- Need for wildcard events
- Developer experience preferences

Both are excellent tools. The "best" choice depends on your context.

---

## Practical Examples

### Example 1: Debug Logger with Mitt

```typescript
import mitt from 'mitt'

const emitter = mitt()

// Development-only global logger
if (import.meta.env.DEV) {
  emitter.on('*', (type, payload) => {
    console.group(`[EVENT] ${type}`)
    console.log('Payload:', payload)
    console.log('Timestamp:', new Date().toISOString())
    console.groupEnd()
  })
}
```

### Example 2: Analytics Middleware with Mitt

```typescript
const emitter = mitt()

// Track all user actions
emitter.on('*', (type, payload) => {
  if (type.startsWith('user:') || type.startsWith('document:')) {
    window.analytics?.track(type, {
      ...payload,
      timestamp: Date.now(),
      sessionId: getSessionId(),
    })
  }
})
```

### Example 3: Safe Component Communication with VueUse

```typescript
// Toolbar component
<script setup>
import { emitAppEvent } from '@/shared/utils/eventBus'

function createDocument() {
  emitAppEvent('document:create')
}
</script>

// Sidebar component
<script setup>
import { onAppEvent } from '@/shared/utils/eventBus'

onAppEvent('document:create', () => {
  // Automatically cleaned up when sidebar unmounts
  refreshDocumentList()
})
</script>
```

### Example 4: Error Boundary with Mitt

```typescript
const emitter = mitt()

// Global error handler
emitter.on('*', (type, payload) => {
  if (type.startsWith('error:')) {
    Sentry.captureException(payload, {
      tags: { eventType: type }
    })
  }
})

// Anywhere in your app
emitter.emit('error:network', new Error('Failed to fetch'))
emitter.emit('error:validation', new Error('Invalid input'))
```

---

**Final recommendation**: For Vue/Nuxt apps already using VueUse → stick with VueUse. For everything else or when you need wildcard events → consider mitt.
