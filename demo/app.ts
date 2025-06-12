import { useState, div, h1, button, p } from '../src';

const app = () => {
    // Create a reactive state for button click count
    const [clickCount, setClickCount] = useState(0);
    
    return div({ class: 'container' },
        h1({ 
            class: 'heading', 
            style: { animation: 'tilt 3s ease-in-out infinite' } 
        }, 'Osiris'),

        p('A lightweight implementation of a UI framework with hooks.'),
        p(`${clickCount} clicks so far.`),

        button({
            class: 'button', 
            onClick: () => setClickCount(clickCount + 1)
        }, `Clicks: ${clickCount}`)
    );
};

// Export the app wrapped in renderComponent to make it reactive
export default app;