import { resetState, setCurrentEffect } from './state';

/**
 * Renders a component with reactive state management
 * @param component Function that returns an HTMLElement
 * @param parent Optional parent element to append to
 * @returns The wrapper element containing the component
 */
export function renderComponent(component: () => HTMLElement, parent?: HTMLElement): HTMLElement {
    // Reset state index before rendering
    resetState();
    
    // Create a wrapper to handle updates
    const wrapper = document.createElement('div');
    
    const updateComponent = () => {
        resetState();
        setCurrentEffect(updateComponent);
        
        // Clear previous content
        wrapper.innerHTML = '';
        
        // Render new content
        const newElement = component();
        wrapper.appendChild(newElement);
        
        setCurrentEffect(null);
    };
    
    // Initial render
    updateComponent();
    
    // If parent is specified, append the wrapper to it
    // Otherwise, append to document.body
    if (parent) {
        parent.appendChild(wrapper);
    } else {
        document.body.appendChild(wrapper);
    }
    
    return wrapper;
}