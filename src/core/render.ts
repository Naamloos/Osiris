import { resetState, setCurrentEffect, createStateStore, setCurrentStore, StateStore } from './state';
import { render, VNode } from './dom';
import { Props } from '../types/Props';

// Cache for rendered components to avoid unnecessary re-renders
const componentCache = new WeakMap<HTMLElement, {
    component: () => VNode;
    lastVNode: VNode | null;
    updateFunction: () => void;
    store: StateStore;
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

    let cache = componentCache.get(container);
    if (!cache || cache.component !== component) {
        cache = { component, lastVNode: null, updateFunction: () => {}, store: createStateStore() };
        componentCache.set(container, cache);
    }

    const { store } = cache;
    resetState();

    let isScheduled = false;
    
    const updateComponent = () => {
        // Prevent multiple updates in the same frame
        if (isScheduled) return;
        isScheduled = true;
        
        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
            setCurrentStore(store);
            resetState();
            setCurrentEffect(updateComponent);
            
            try {
                // Render virtual DOM tree
                const vnode = component();

                // Only render if the vnode actually changed
                const cacheEntry = componentCache.get(container)!;
                if (!cacheEntry.lastVNode || !areVNodesShallowEqual(cacheEntry.lastVNode, vnode)) {
                    render(vnode, container);
                    cacheEntry.lastVNode = vnode;
                }

                // Trim unused state slots when component structure changes
                store.states.length = store.stateIndex;
            } catch (error) {
                console.error('Error during component update:', error);
            } finally {
                setCurrentEffect(null);
                isScheduled = false;
            }
        });
    };
    
    cache.updateFunction = updateComponent;

    // Initial render
    updateComponent();
    
    return container;
}

/**
 * Quick shallow equality check for VNodes to prevent unnecessary renders
 */
function areVNodesShallowEqual(a: VNode, b: VNode): boolean {
    if (!a || !b) return a === b;
    if (a.type !== b.type) return false;
    if (a.children.length !== b.children.length) return false;
    
    // For arrays or objects in state, always re-render to be safe
    if (a.children.length > 1 || b.children.length > 1) return false;
    
    // For simple cases with just text content, do a quick comparison
    if (a.children.length === 1 && typeof a.children[0] === 'string' && 
        b.children.length === 1 && typeof b.children[0] === 'string') {
        return a.children[0] === b.children[0] && shallowEqual(a.props, b.props);
    }
    
    return false;
}

function shallowEqual(props: Props, props1: Props): boolean {
    if (props === props1) return true;
    if (typeof props !== 'object' || props === null || typeof props1 !== 'object' || props1 === null) return false;

    const keysA = Object.keys(props);
    const keysB = Object.keys(props1);

    if (keysA.length !== keysB.length) {
        return false;
    }

    for (let i = 0; i < keysA.length; i++) {
        if (!props1.hasOwnProperty(keysA[i]) || props[keysA[i]] !== props1[keysA[i]]) {
            return false;
        }
    }

    return true;
}