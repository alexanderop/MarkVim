# Test Patterns

## Independent Composable Example

**Target**: `useSum` (Pure reactivity)

```ts
import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useSum } from "./useSum";

describe("useSum", () => {
  it("correctly computes the sum of two numbers", () => {
    const num1 = ref(2);
    const num2 = ref(3);
    // Direct invocation
    const sum = useSum(num1, num2); 
    expect(sum.value).toBe(5);
  });
});
Lifecycle Dependent Example
Target: useLocalStorage (Uses onMounted) Requirement: withSetup helper

``TypeScript

import { describe, it, expect } from "vitest";
import { withSetup } from "./test-utils";
import useLocalStorage from "./useLocalStorage";

describe("useLocalStorage", () => {
  it("should load the value from localStorage if it was set before", async () => {
    // Setup Mock
    localStorage.setItem("testKey", JSON.stringify("valueFromLocalStorage"));
    
    // Invoke via helper
    const [result] = withSetup(() => useLocalStorage("testKey", "testValue"));
    
    // Assert
    expect(result.value.value).toBe("valueFromLocalStorage");
  });
});
Injection Dependent Example
Target: useMessage (Uses inject) Requirement: useInjectedSetup helper
```

```ts
import { describe, expect, it } from "vitest";
import { useInjectedSetup } from "./test-utils";
import { MessageKey, useMessage } from "./useMessage";

describe("useMessage", () => {
  it("should handle injected message", () => {
    // Invoke via helper with Injection Configuration
    const wrapper = useInjectedSetup(
      () => useMessage(),
      [{ key: MessageKey, value: "hello world" }]
    );
    
    expect(wrapper.message).toBe("hello world");
    expect(wrapper.getUpperCase()).toBe("HELLO WORLD");
    
    // CLEANUP IS CRITICAL
    wrapper.unmount();
  });

  it("should throw error when message is not provided", () => {
    expect(() => {
      useInjectedSetup(() => useMessage(), []);
    }).toThrow("Message must be provided");
  });
});
```