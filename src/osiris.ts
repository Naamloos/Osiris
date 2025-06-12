import { Props } from "./types/Props";

// Store for reactive state
type Subscriber = () => void;
let currentEffect: Subscriber | null = null;
const states: any[] = [];
let stateIndex = 0;

// useState hook
export function useState<T>(initialValue: T): [T, (newValue: T) => void] {
    const index = stateIndex++;
    if (states[index] === undefined) {
        states[index] = {
            value: initialValue,
            subscribers: new Set<Subscriber>()
        };
    }
    
    const state = states[index];
    
    // Subscribe the current effect if one exists
    if (currentEffect) {
        state.subscribers.add(currentEffect);
    }
    
    const setState = (newValue: T) => {
        state.value = newValue;
        // Notify all subscribers
        state.subscribers.forEach((subscriber: Subscriber) => subscriber());
    };
    
    return [state.value, setState];
}

// useEffect hook
export function useEffect(callback: () => void | (() => void), deps?: any[]) {
    // Run effect after render is complete
    setTimeout(() => {
        // Cleanup previous effect
        const cleanup = callback();
        
        // Return cleanup function
        if (cleanup && typeof cleanup === 'function') {
            // Store cleanup for next time
        }
    }, 0);
}

// Component rendering with reactivity
export function renderComponent(component: () => HTMLElement, parent?: HTMLElement): HTMLElement {
    // Reset state index before rendering
    stateIndex = 0;
    
    // Create a wrapper to handle updates
    const wrapper = document.createElement('div');
    
    const updateComponent = () => {
        stateIndex = 0;
        currentEffect = updateComponent;
        
        // Clear previous content
        wrapper.innerHTML = '';
        
        // Render new content
        const newElement = component();
        wrapper.appendChild(newElement);
        
        currentEffect = null;
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

export function $(elementType: string, ...children: (HTMLElement | Props | string)[]): HTMLElement {
        const element = document.createElement(elementType);
        children.forEach(child => {
                if (typeof child === 'string') {
                        element.appendChild(document.createTextNode(child));
                } else if (child instanceof HTMLElement) {
                        element.appendChild(child);
                }

                // If child is object, append all object properties as attributes, ignoring types
                else if (typeof child === 'object' && child !== null) {
                        Object.keys(child).forEach(key => {
                                try {
                                        if (key.startsWith('on')) {
                                                // Handle event listeners
                                                element.addEventListener(key.slice(2).toLowerCase(), child[key]);
                                        } 
                                        if( key === 'style' && typeof child[key] === 'object') {
                                                // Handle styles
                                                applyStyles(element, child[key]);
                                        }
                                        else {
                                                // Set attributes
                                                element.setAttribute(key, child[key]);
                                        }
                                } catch (e) {
                                        console.warn(`Failed to set attribute or event listener for key "${key}":`, e);
                                }
                        });
                }
        });
        return element;
}

const applyStyles = (element: HTMLElement, styles: Record<string, string>) => {
        Object.keys(styles).forEach(style => {
                try {
                        (element.style as any)[style] = styles[style];
                } catch (e) {
                        console.warn(`Failed to apply style "${style}":`, e);
                }
        });
}

// Re-export all elements from osiris.elements.ts
export * from './osiris.elements';