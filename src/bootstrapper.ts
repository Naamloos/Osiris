import { Props } from './types';
import { resetState, setCurrentEffect, setCurrentComponent, componentStates, cleanupComponent } from './reactivity';
import { updateVNode } from './renderer';
import { VNode } from './types';

// Cache for rendered components to avoid unnecessary re-renders
const componentCache = new WeakMap<HTMLElement, {
    component: () => VNode,
    lastVNode: VNode | null,
    updateFunction: () => void,
    instanceId: string
}>();

/**
 * Renders a component with reactive state management
 * @param component Function that returns a VNode
 * @param parent Optional parent element to append to
 * @returns The parent element containing the component
 */
export function bootstrapOsiris(component: () => VNode, parent?: HTMLElement): HTMLElement {
    // Use document.body as default parent if none provided
    const container = parent || document.body;

    // Check if component is already cached
    const cached = componentCache.get(container);

    // If we have a different component in the same container, clean up the old one
    if (cached && cached.component !== component) {
        console.log('Different component detected, cleaning up old component');
        cleanupComponent(cached.instanceId);
        componentCache.delete(container);
    }

    // If same component is already cached, return early
    if (cached && cached.component === component) {
        return container;
    }

    // Generate a unique instance ID based on container and timestamp for better isolation
    const containerId = container.id || container.className || 'anonymous';
    const persistentInstanceId = `${containerId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    let isScheduled = false;
    let renderCount = 0;

    const updateComponent = () => {
        // Prevent multiple updates in the same frame and limit recursive calls
        if (isScheduled || renderCount > 10) {
            if (renderCount > 10) {
                console.warn('Too many renders detected, possible infinite loop in component:', persistentInstanceId);
            }
            return;
        }

        isScheduled = true;
        renderCount++;

        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
            try {
                // Set the current component context for state isolation
                setCurrentComponent(persistentInstanceId);
                resetState();
                setCurrentEffect(updateComponent);

                // Render virtual DOM tree
                const vnode = component();
                vnode._osirisInstanceId = persistentInstanceId;

                // Update the DOM
                updateVNode(vnode, container);

                // Update cache
                componentCache.set(container, {
                    component,
                    lastVNode: vnode,
                    updateFunction: updateComponent,
                    instanceId: persistentInstanceId
                });

            } catch (error) {
                console.error('Error during component update:', error);
            } finally {
                setCurrentEffect(null);
                setCurrentComponent(null);
                isScheduled = false;

                // Reset render count after successful render
                setTimeout(() => {
                    renderCount = 0;
                }, 0);
            }
        });
    };

    // Initial render
    updateComponent();

    // Cache the component
    componentCache.set(container, {
        component,
        lastVNode: null,
        updateFunction: updateComponent,
        instanceId: persistentInstanceId
    });

    return container;
}

/**
 * Quick shallow equality check for VNodes to prevent unnecessary renders
 */
function areVNodesShallowEqual(a: VNode, b: VNode): boolean {
    if (!a || !b) return a === b;
    if (a.type !== b.type) return false;
    if (a.children?.length !== b.children?.length) return false;

    // For arrays or objects in state, always re-render to be safe
    if (a.children?.length > 1 || b.children?.length > 1) return false;

    // For simple cases with just text content, do a quick comparison
    if (a.children?.length === 1 && typeof a.children[0] === 'string' &&
        b.children?.length === 1 && typeof b.children[0] === 'string') {
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