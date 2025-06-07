export const initialMarkdown = `# Welcome to MarkVim

Start writing your **markdown** here.

## Features

- Real-time preview
- Syntax highlighting with Shiki
- Linear-inspired dark theme
- Clean, modern interface

### Code Examples

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

// Array methods are highlighted properly
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log(doubled);
\`\`\`

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

class UserService {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }
}
\`\`\`

\`\`\`css
.button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  padding: 12px 24px;
  transition: transform 0.2s ease;
}

.button:hover {
  transform: translateY(-2px);
}
\`\`\`

> This is a blockquote with some **important** information.

- [ ] Todo item
- [x] Completed item
- [ ] Another todo

Visit [Linear](https://linear.app) for inspiration.` 