import { resetState, setCurrentEffect } from './state';
import { render, VNode } from './dom';

// Cache for rendered components to avoid unnecessary re-renders
const componentCache = new WeakMap<HTMLElement, { 
    component: () => VNode, 
    lastVNode: VNode,
    updateFunction: () => void 
}>();

/**
 * Renders a component with reactive state management
 * @param component Function that returns a VNode
 * @param parent Optional parent element to append to
 * @returns The parent element containing the component
 */
export function renderComponent(component: () => VNode, parent?: HTMLElement): HTMLElement {
    // Use document.body as default parent if none provided
    const container = parent || document.body;
    
    // Check if component is already cached
    const cached = componentCache.get(container);
    if (cached && cached.component === component) {
        return container;
    }
    
    // Reset state index before rendering
    resetState();
    
    let isScheduled = false;
    
    const updateComponent = () => {
        // Prevent multiple updates in the same frame
        if (isScheduled) return;
        isScheduled = true;
        
        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
            resetState();
            setCurrentEffect(updateComponent);
            
            try {
                // Render virtual DOM tree
                const vnode = component();
                
                // Only render if the vnode actually changed
                const cache = componentCache.get(container);
                if (!cache || !areVNodesShallowEqual(cache.lastVNode, vnode)) {
                    render(vnode, container);
                    
                    // Update cache
                    componentCache.set(container, {
                        component,
                        lastVNode: vnode,
                        updateFunction: updateComponent
                    });
                }
            } catch (error) {
                console.error('Error during component update:', error);
            } finally {
                setCurrentEffect(null);
                isScheduled = false;
            }
        });
    };
    
    // Initial render
    updateComponent();
    
    // Cache the component
    componentCache.set(container, {
        component,
        lastVNode: component(), // Store initial vnode
        updateFunction: updateComponent
    });
    
    return container;
}

/**
 * Quick shallow equality check for VNodes to prevent unnecessary renders
 */
function areVNodesShallowEqual(a: VNode, b: VNode): boolean {
    if (!a || !b) return a === b;
    if (a.type !== b.type) return false;
    if (a.children.length !== b.children.length) return false;
    
    // For simple cases with just text content, do a quick comparison
    if (a.children.length === 1 && typeof a.children[0] === 'string' && 
        b.children.length === 1 && typeof b.children[0] === 'string') {
        return a.children[0] === b.children[0];
    }
    
    return false;
}