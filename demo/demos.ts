import { useState, div, h3, button, input, ul, li, span, p, strong } from "../src";
import clickButton from "./clickButton";

const CounterDemo = () => {
    const [clickCount, setClickCount] = useState(0);
    return div({ class: 'demo-content' },
        h3(`Count: ${clickCount}`),
        button({
            class: 'demo-button',
            onClick: () => setClickCount(clickCount + 1)
        }, 'Increment'),
        button({
            class: 'demo-button secondary',
            onClick: () => setClickCount(0)
        }, 'Reset')
    )
};

const TodoDemo = () => {
    const [todoText, setTodoText] = useState('');
    const [todos, setTodos] = useState([
        { id: 1, text: 'Learn Osiris', completed: false },
        { id: 2, text: 'Build something awesome', completed: false }
    ]);

    const addTodo = () => {
        if (todoText.trim()) {
            let newTodos = [...todos];
            newTodos.push({
                id: Date.now(),
                text: todoText,
                completed: false
            });
            setTodos(newTodos);
            setTodoText('');
        }
    };

    const toggleTodo = (id: number) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    return div({ class: 'demo-content' },
        div({ class: 'todo-input' },
            input({
                class: 'demo-input',
                placeholder: 'Add a todo...',
                value: todoText,
                onInput: (e: Event) => setTodoText((e.target as HTMLInputElement).value),
                onKeyDown: (e: KeyboardEvent) => e.key === 'Enter' && addTodo()
            }),
            button({
                class: 'demo-button',
                onClick: addTodo
            }, 'Add')
        ),
        ul({ class: 'todo-list' },
            ...todos.map(todo =>
                li({
                    key: todo.id,
                    class: 'todo-item'
                },
                    span({
                        class: todo.completed ? 'completed' : '',
                        style: {
                            textDecoration: todo.completed ? 'line-through' : 'none',
                            opacity: todo.completed ? '0.6' : '1'
                        }
                    }, todo.text),
                    button({
                        class: 'demo-button small',
                        onClick: () => toggleTodo(todo.id)
                    }, todo.completed ? 'Undo' : 'Done')
                )
            )
        )
    );
};

const FormDemo = () => {
    const [formData, setFormData] = useState({ name: '', email: '' });

    return div({ class: 'demo-content' },
        div({ class: 'form-demo' },
            input({
                class: 'demo-input',
                placeholder: 'Name',
                value: formData.name,
                onInput: (e: Event) => setFormData({
                    ...formData,
                    name: (e.target as HTMLInputElement).value
                })
            }),
            input({
                class: 'demo-input',
                type: 'email',
                placeholder: 'Email',
                value: formData.email,
                onInput: (e: Event) => setFormData({
                    ...formData,
                    email: (e.target as HTMLInputElement).value
                })
            }),
            button({
                class: 'demo-button',
                onClick: () => alert(`Hello ${formData.name}! Email: ${formData.email}`)
            }, 'Submit')
        ),
        div({ class: 'form-preview' },
            p(strong('Form State:')),
            p(`Name: ${formData.name || '(empty)'}`),
            p(`Email: ${formData.email || '(empty)'}`)
        )
    )
};

const ComponentsDemo = () => {
    const Card = (title: string, content: string) =>
        div({ class: 'demo-card' },
            h3({ class: 'card-title' }, title),
            p({ class: 'card-content' }, content)
        );

    return div({ class: 'demo-content' },
        Card('Feature Card', 'This demonstrates component composition in Osiris'),
        Card('Another Card', 'Components can be easily reused and composed together'),
    );
};

const demos = {
    counter: {
        title: 'State Management - Counter',
        description: 'Basic reactive state with useState hook',
        code: `const CounterDemo = () => {
    const [clickCount, setClickCount] = useState(0);
    return div({ class: 'demo-content' },
        h3(\`Count: \${clickCount}\`),
        button({
            class: 'demo-button',
            onClick: () => setClickCount(clickCount + 1)
        }, 'Increment'),
        button({
            class: 'demo-button secondary',
            onClick: () => setClickCount(0)
        }, 'Reset')
    )
};`,
        component: () => CounterDemo()
    },
    todo: {
        title: 'Dynamic Lists - Todo App',
        description: 'Managing arrays and conditional rendering',
        code: `const TodoDemo = () => {
    const [todoText, setTodoText] = useState('');
    const [todos, setTodos] = useState([
        { id: 1, text: 'Learn Osiris', completed: false },
        { id: 2, text: 'Build something awesome', completed: false }
    ]);

    const addTodo = () => {
        if (todoText.trim()) {
            let newTodos = [...todos];
            newTodos.push({
                id: Date.now(),
                text: todoText,
                completed: false
            });
            setTodos(newTodos);
            setTodoText('');
        }
    };

    const toggleTodo = (id: number) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    return div({ class: 'demo-content' },
        div({ class: 'todo-input' },
            input({
                class: 'demo-input',
                placeholder: 'Add a todo...',
                value: todoText,
                onInput: (e: Event) => setTodoText((e.target as HTMLInputElement).value),
                onKeyDown: (e: KeyboardEvent) => e.key === 'Enter' && addTodo()
            }),
            button({
                class: 'demo-button',
                onClick: addTodo
            }, 'Add')
        ),
        ul({ class: 'todo-list' },
            ...todos.map(todo =>
                li({
                    key: todo.id,
                    class: 'todo-item'
                },
                    span({
                        class: todo.completed ? 'completed' : '',
                        style: {
                            textDecoration: todo.completed ? 'line-through' : 'none',
                            opacity: todo.completed ? '0.6' : '1'
                        }
                    }, todo.text),
                    button({
                        class: 'demo-button small',
                        onClick: () => toggleTodo(todo.id)
                    }, todo.completed ? 'Undo' : 'Done')
                )
            )
        )
    );
};`,
        component: () => TodoDemo()
    },
    form: {
        title: 'Form Handling',
        description: 'Form state management and event handling',
        code: `const FormDemo = () => {
    const [formData, setFormData] = useState({ name: '', email: '' });

    return div({ class: 'demo-content' },
        div({ class: 'form-demo' },
            input({
                class: 'demo-input',
                placeholder: 'Name',
                value: formData.name,
                onInput: (e: Event) => setFormData({
                    ...formData,
                    name: (e.target as HTMLInputElement).value
                })
            }),
            input({
                class: 'demo-input',
                type: 'email',
                placeholder: 'Email',
                value: formData.email,
                onInput: (e: Event) => setFormData({
                    ...formData,
                    email: (e.target as HTMLInputElement).value
                })
            }),
            button({
                class: 'demo-button',
                onClick: () => alert(\`Hello \${formData.name}! Email: \${formData.email}\`)
            }, 'Submit')
        ),
        div({ class: 'form-preview' },
            p(strong('Form State:')),
            p(\`Name: \${formData.name || '(empty)'}\`),
            p(\`Email: \${formData.email || '(empty)'}\`)
        )
    )
};`,
        component: () => FormDemo()
    },
    components: {
        title: 'Component Composition',
        description: 'Reusable components and composition patterns',
        code: `const ComponentsDemo = () => {
    const Card = (title: string, content: string) =>
        div({ class: 'demo-card' },
            h3({ class: 'card-title' }, title),
            p({ class: 'card-content' }, content)
        );

    return div({ class: 'demo-content' },
        Card('Feature Card', 'This demonstrates component composition in Osiris'),
        Card('Another Card', 'Components can be easily reused and composed together'),
    );
};`,
        component: () => ComponentsDemo()
    }
};

export default demos;