# Osiris

A lightweight UI framework built with TypeScript. Create modern web applications with minimal overhead using familiar hooks and virtual DOM patterns.

## Features

- **Virtual DOM** - Efficient diffing with keyed reconciliation and batched updates
- **React-like Hooks** - `useState` and `useEffect` for familiar state management
- **Type-Safe Elements** - Factory functions for all HTML elements with full TypeScript support
- **Zero Dependencies** - Pure TypeScript implementation, no external runtime dependencies
- **Performance Optimized** - Automatic batching, component caching, and `requestAnimationFrame` updates

## Quick Start

```bash
git clone https://github.com/yourusername/osiris.git
cd osiris
npm install
npm run dev
```

```typescript
import { bootstrapOsiris, useState, div, h1, button } from 'osiris';

const App = () => {
  const [count, setCount] = useState(0);
  
  return div(
    h1('My Osiris App'),
    button({
      onClick: () => setCount(count + 1)
    }, `Count: ${count}`)
  );
};

bootstrapOsiris(App, document.getElementById('app'));
```

## Core API

### State Management

```typescript
// useState - reactive state with automatic re-rendering
const [value, setValue] = useState(initialValue);

// useEffect - side effects with optional cleanup
useEffect(() => {
  const timer = setInterval(() => console.log('tick'), 1000);
  return () => clearInterval(timer); // cleanup
}, []);
```

### Rendering

```typescript
// renderComponent - mount a component to the DOM
bootstrapOsiris(ComponentFunction, containerElement);

// $ - create virtual DOM nodes (rarely used directly)
const vnode = $('div', { class: 'container' }, 'content');
```

## Elements & Props

### HTML Elements
All standard HTML elements are available as factory functions:

```typescript
import { div, span, p, h1, h2, a, button, input, form, ul, li } from 'osiris';

const Layout = () => div(
  h1('Title'),
  p('Description'),
  button({ onClick: () => alert('clicked') }, 'Click me')
);
```

### Props & Attributes
Standard HTML attributes and event handlers are supported:

```typescript
const Interactive = () => div(
  {
    id: 'container',
    class: 'active highlighted',
    'data-testid': 'main-container',
    style: {
      backgroundColor: '#f0f0f0',
      padding: '20px',
      borderRadius: '8px'
    }
  },
  input({
    type: 'text',
    placeholder: 'Enter text...',
    onInput: (e) => console.log(e.target.value),
    onFocus: () => console.log('focused'),
    onKeyDown: (e) => e.key === 'Enter' && handleSubmit()
  })
);
```

## Patterns & Examples

### Component Composition
```typescript
const Card = (title: string, content: string) => div(
  { class: 'card' },
  h3(title),
  p(content)
);

const Dashboard = () => div(
  h1('Dashboard'),
  Card('Users', '1,234 active'),
  Card('Revenue', '$45,678')
);
```

### Custom Hooks
```typescript
const useCounter = (initial = 0) => {
  const [count, setCount] = useState(initial);
  return {
    count,
    increment: () => setCount(count + 1),
    decrement: () => setCount(count - 1),
    reset: () => setCount(initial)
  };
};

const CounterApp = () => {
  const { count, increment, decrement, reset } = useCounter(10);
  
  return div(
    h2(`Count: ${count}`),
    button({ onClick: increment }, '+'),
    button({ onClick: decrement }, '-'),
    button({ onClick: reset }, 'Reset')
  );
};
```

### Dynamic Lists
```typescript
const TodoApp = () => {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn Osiris', done: false }
  ]);
  
  const toggle = (id: number) => setTodos(todos.map(todo => 
    todo.id === id ? { ...todo, done: !todo.done } : todo
  ));
  
  return div(
    h2('Todos'),
    ul(
      ...todos.map(todo => li(
        { 
          key: todo.id,
          style: { textDecoration: todo.done ? 'line-through' : 'none' }
        },
        span(todo.text),
        button({ onClick: () => toggle(todo.id) }, 
          todo.done ? 'Undo' : 'Done'
        )
      ))
    )
  );
};
```

### Form Handling
```typescript
const ContactForm = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  
  const updateField = (field: string) => (e: Event) => 
    setForm({ ...form, [field]: (e.target as HTMLInputElement).value });
  
  const handleSubmit = (e: Event) => {
    e.preventDefault();
    console.log('Submitted:', form);
  };
  
  return form({ onSubmit: handleSubmit },
    input({ 
      placeholder: 'Name', 
      value: form.name, 
      onInput: updateField('name') 
    }),
    input({ 
      type: 'email', 
      placeholder: 'Email', 
      value: form.email, 
      onInput: updateField('email') 
    }),
    textarea({ 
      placeholder: 'Message', 
      value: form.message, 
      onInput: updateField('message') 
    }),
    button({ type: 'submit' }, 'Send')
  );
};
```

## Architecture

### Virtual DOM
- **Diffing**: Compares virtual trees to minimize DOM operations
- **Keyed Elements**: Use `key` prop for efficient list updates
- **Batching**: Multiple state updates grouped into single render

### State System
- **Subscription**: Components auto-subscribe to state they use
- **Batching**: Updates batched with microtasks and `requestAnimationFrame`
- **Caching**: Components cached to prevent unnecessary re-renders

### Performance
```typescript
// ✅ Good - stable references
const styles = { padding: '10px', color: 'blue' };
const MyComponent = () => div({ style: styles }, 'Content');

// ❌ Avoid - new objects every render
const MyComponent = () => div({ 
  style: { padding: '10px', color: 'blue' } 
}, 'Content');

// ✅ Good - use keys for lists
const List = () => ul(...items.map(item => 
  li({ key: item.id }, item.name)
));
```

## TypeScript

Full type safety out of the box:

```typescript
// Type-safe state
const [user, setUser] = useState<User | null>(null);
const [count, setCount] = useState<number>(0);

// Type-safe components
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const Button = ({ label, onClick, variant = 'primary' }: ButtonProps) =>
  button({ 
    onClick, 
    class: `btn btn-${variant}` 
  }, label);
```

## Development

```bash
npm run dev     # Development server
npm run build   # Production build
npm run test    # Run tests
npm run preview # Preview build
```

## Browser Support

Modern browsers with ES2015+, `requestAnimationFrame`, `Promise`, and `WeakMap`:
- Chrome 61+, Firefox 60+, Safari 12+, Edge 79+

## Troubleshooting

**State not updating?** Check you're using the setter from `useState`, not mutating directly.

**Performance issues?** Use `key` props for lists, avoid creating objects in render functions.

**TypeScript errors?** Use `class` not `className`, ensure event handlers match expected signatures.

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Add tests for new functionality
4. Submit pull request

## License

Apache License 2.0
