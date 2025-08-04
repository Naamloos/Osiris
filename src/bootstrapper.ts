import { VNode } from './types';
import { resetState, setCurrentEffect, setCurrentComponent, cleanupComponent } from './reactivity';
import { updateVNode } from './renderer';

/**
 * Cache for rendered components to avoid unnecessary re-renders
 */
const componentCache = new WeakMap<HTMLElement, {
    component: () => VNode,
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
    const container = parent || document.body;
    const cached = componentCache.get(container);

    // Clean up old component if different
    if (cached && cached.component !== component) {
        cleanupComponent(cached.instanceId);
        componentCache.delete(container);
    }

    // Return early if same component is already cached
    if (cached && cached.component === component) {
        return container;
    }

    // Generate unique instance ID for state isolation
    const containerId = container.id || container.className || 'anonymous';
    const instanceId = `${containerId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    let isScheduled = false;
    let renderCount = 0;

    const updateComponent = () => {
        // Prevent infinite loops and multiple updates per frame
        if (isScheduled || renderCount > 10) {
            if (renderCount > 10) {
                console.warn('Too many renders detected, possible infinite loop in component:', instanceId);
            }
            return;
        }

        isScheduled = true;
        renderCount++;

        requestAnimationFrame(() => {
            try {
                // Set component context for state isolation
                setCurrentComponent(instanceId);
                resetState();
                setCurrentEffect(updateComponent);

                // Render and update DOM
                const vnode = component();
                vnode._osirisInstanceId = instanceId;
                updateVNode(vnode, container);

                // Update cache
                componentCache.set(container, {
                    component,
                    updateFunction: updateComponent,
                    instanceId
                });

            } catch (error) {
                console.error('Error during component update:', error);
            } finally {
                setCurrentEffect(null);
                setCurrentComponent(null);
                isScheduled = false;

                // Reset render count after successful render
                setTimeout(() => renderCount = 0, 0);
            }
        });
    };

    // Initial render
    updateComponent();

    return container;
}