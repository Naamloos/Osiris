import { useState, div, h1, button, li, p, ul } from './osiris';

// Extracted styles as objects
const styles = {
    container: {
        fontFamily: 'Arial, sans-serif', 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '20px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginTop: '50px',
    },
    heading: {
        color: '#333', 
        borderBottom: '2px solid #ddd', 
        paddingBottom: '10px'
    },
    button: {
        backgroundColor: '#4CAF50', 
        color: 'white', 
        border: 'none', 
        padding: '10px 15px', 
        borderRadius: '4px', 
        cursor: 'pointer', 
        margin: '10px 0'
    },
    list: {
        listStyleType: 'circle', 
        margin: '15px 0'
    },
    listItem: {
        padding: '5px 0'
    },
    nestedContainer: {
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#e9e9e9', 
        borderRadius: '4px'
    }
};

const app = () => {
    // Create a reactive state for button click count
    const [clickCount, setClickCount] = useState(0);
    
    return div({style: styles.container},
        h1({style: styles.heading}, 'Osiris Framework'),
        p('A lightweight implementation of a UI framework with hooks.'),
        button({
            style: styles.button, 
            onClick: () => setClickCount(clickCount + 1)
        }, `Clicks: ${clickCount}`),
        ul({style: styles.list},
            li({style: styles.listItem}, 'Item 1'),
            li({style: styles.listItem}, 'Item 2'),
            li({style: styles.listItem}, 'Item 3')
        )
    );
};

// Export the app wrapped in renderComponent to make it reactive
export default app;