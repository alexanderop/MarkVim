# Testing Helpers

When testing **Dependent Composables**, these utility functions are required to simulate the Vue Component instance, lifecycle, and dependency injection systems.

## `withSetup` (For Lifecycle Hooks)

Use this when the composable uses `onMounted`, `onUnmounted`, etc.

```typescript
import type { App } from "vue";
import { createApp } from "vue";

export function withSetup<T>(composable: () => T): [T, App] {
  let result: T;
  const app = createApp({
    setup() {
      result = composable();
      return () => {};
    },
  });
  app.mount(document.createElement("div"));
  return [result, app];
}
```

useInjectedSetup (For Dependency Injection)
Use this when the composable uses inject().

```ts
import type { InjectionKey } from "vue";
import { createApp, defineComponent, h, provide } from "vue";

type InstanceType<V> = V extends { new (...arg: any[]): infer X } ? X : never;
type VM<V> = InstanceType<V> & { unmount: () => void };

interface InjectionConfig {
  key: InjectionKey<any> | string;
  value: any;
}

export function useInjectedSetup<TResult>(
  setup: () => TResult,
  injections: InjectionConfig[] = []
): TResult & { unmount: () => void } {
  let result!: TResult;
  const Comp = defineComponent({
    setup() {
      result = setup();
      return () => h("div");
    },
  });
  const Provider = defineComponent({
    setup() {
      injections.forEach(({ key, value }) => {
        provide(key, value);
      });
      return () => h(Comp);
    },
  });
  
  const mounted = mount(Provider);
  return {
    ...result,
    unmount: mounted.unmount,
  } as TResult & { unmount: () => void };
}

function mount<V>(Comp: V) {
  const el = document.createElement("div");
  const app = createApp(Comp as any);
  const unmount = () => app.unmount();
  const comp = app.mount(el) as any as VM<V>;
  comp.unmount = unmount;
  return comp;
}
```