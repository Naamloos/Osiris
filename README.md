# Osiris

Reactive Vanilla Typescript UI framework for building modern user interfaces with a minimal footprint.

## Features

- **Virtual DOM** - Efficient updates with a lightweight diffing algorithm
- **Functional Components** - Build UIs with reusable function components
- **Hooks API** - State management using hooks like `useState`
- **Style Objects** - Clean component styling with JavaScript objects
- **Minimal API Surface** - Simple and intuitive API design

## Basic Usage

```typescript
import { useState, div, h1, button } from './osiris';

const app = () => {
  // Create a reactive state for button click count
  const [clickCount, setClickCount] = useState(0);
  
  return div({style: {fontFamily: 'Arial, sans-serif'}},
    h1('Osiris Framework'),
    button({
      onClick: () => setClickCount(clickCount + 1)
    }, `Clicks: ${clickCount}`)
  );
};

export default app;
```

## Core API

### Elements

- `div`, `h1`, `p`, `ul`, `li`, `button` - Create DOM elements with props and children
- Other HTML elements available through similar functions

### Hooks

- `useState(initialState)` - Adds reactive state to functional components
- More hooks coming soon!

## Example Components

### Counter Component

```typescript
const Counter = () => {
  const [count, setCount] = useState(0);
  
  return div(
    h1(`Count: ${count}`),
    button({
      onClick: () => setCount(count + 1)
    }, 'Increment'),
    button({
      onClick: () => setCount(count - 1)
    }, 'Decrement')
  );
};
```

## Styling Components

Osiris components can be styled using JavaScript objects:

```typescript
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px'
  },
  button: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '10px 15px'
  }
};

const StyledComponent = () => {
  return div({style: styles.container},
    button({style: styles.button}, 'Styled Button')
  );
};
```

## Browser Support

Osiris works in all modern browsers (Chrome, Firefox, Safari, Edge)

## License

Apache License 2.0
