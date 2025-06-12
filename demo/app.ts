import { useState, div, h1, button, p } from '../src';
import clickButton from './clickButton';

const app = () => {
    // Create a reactive state for button click count
    const [clickCount, setClickCount] = useState(0);
    
    return div({ class: 'container' },
        h1({ 
            class: 'heading', 
            style: { animation: 'tilt 3s ease-in-out infinite' },
            id: 'osiris-title'
        }, 'Osiris'),

        p('💖 A lightweight implementation of a UI framework with hooks.'),
        p(`${clickCount} clicks so far.`),

        // nested reactive component
        clickButton(() => setClickCount(clickCount + 1), `Clicks: ${clickCount}`),
    );
};

export default app;