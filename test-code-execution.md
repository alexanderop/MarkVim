# Code Execution Test

Test JavaScript execution:

```javascript
console.log("Hello from executable JavaScript!");
const x = 10;
const y = 20;
console.log("Sum:", x + y);

function myFunction() {
  console.log("This is inside a function!");
}
myFunction();

// Test object logging
const user = { id: 1, name: "John Doe", age: 25 };
console.log("User object:", user);
```

Test TypeScript execution:

```typescript
interface MyData {
  id: number;
  name: string;
}

const data: MyData = { id: 1, name: "Test User" };
console.log("TypeScript data:", data.name);

function calculate(a: number, b: number): number {
  return a * b;
}
console.log("TS calculation:", calculate(5, 7));
```

Test error handling:

```javascript
console.log("This will work fine");
// Uncomment the next line to test error handling
// throw new Error("This is a test error!");
console.log("This should also work");
```

Regular code block (should not have Run button):

```python
print("This is Python code - should not be executable")
def hello():
    return "Hello World"
```