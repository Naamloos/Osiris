type Subscriber = () => void;

// Store for reactive state per component
let currentEffect: Subscriber | null = null;
let currentComponent: string | null = null;
export const componentStates = new Map<string, { states: any[], stateIndex: number }>();

// Track which components are currently updating to prevent race conditions
const updatingComponents = new Set<string>();

/**
 * Initializes state management for a value.
 * @param initialValue Initial value for the state
 * @returns A tuple containing the current state value and a function to update it.
 * The update function will trigger re-renders of components that depend on this state.
 */
export function useState<T>(initialValue: T): [T, (newValue: T) => void] {
    if (!currentComponent) {
        throw new Error('useState must be called within a component render function');
    }

    // Get or create component-specific state storage
    let componentState = componentStates.get(currentComponent);
    if (!componentState) {
        componentState = { states: [], stateIndex: 0 };
        componentStates.set(currentComponent, componentState);
    }

    const index = componentState.stateIndex++;

    // Always check if we need to reinitialize state based on the initial value type
    // This helps detect when we're switching between different component types
    if (componentState.states[index] === undefined ||
        (componentState.states[index] && typeof componentState.states[index].value !== typeof initialValue)) {
        componentState.states[index] = {
            value: initialValue,
            subscribers: new Set<Subscriber>(),
            componentId: currentComponent // Track which component owns this state
        };
    }

    const state = componentState.states[index];

    // Subscribe the current effect if one exists and it belongs to the same component
    if (currentEffect && state.componentId === currentComponent) {
        state.subscribers.add(currentEffect);
    }

    const setState = (newValue: T) => {
        // Only update if value actually changed
        if (state.value === newValue) {
            return;
        }

        // Prevent recursive updates from the same component
        if (updatingComponents.has(state.componentId)) {
            return;
        }

        state.value = newValue;

        // Mark component as updating
        updatingComponents.add(state.componentId);

        // Use requestAnimationFrame to batch updates
        requestAnimationFrame(() => {
            // Only trigger subscribers for this specific component's state
            if (state.subscribers.size > 0) {
                // Create a copy of subscribers to iterate over in case the set changes during iteration
                const subscribersToCall: Subscriber[] = Array.from(state.subscribers);

                subscribersToCall.forEach((subscriber) => {
                    try {
                        subscriber();
                    } catch (error) {
                        console.error('Error in state subscriber:', error);
                    }
                });
            }

            // Clear the updating flag
            updatingComponents.delete(state.componentId);
        });
    };

    return [state.value, setState];
}

/**
 * @param callback Function to run after render is complete.
 * This function can return a cleanup function that will be called before the next effect runs.
 * @param deps Optional array of dependencies that the effect depends on.
 */
export function useEffect(callback: () => void | (() => void), deps?: any[]) {
    if (!currentComponent) {
        console.warn('useEffect called outside of component render function');
        return;
    }

    const componentId = currentComponent;

    // Use requestAnimationFrame instead of setTimeout for better performance
    requestAnimationFrame(() => {
        // Only run effect if we're still in the same component context
        try {
            const cleanup = callback();

            // Store cleanup function for the component
            if (cleanup && typeof cleanup === 'function') {
                // TODO: Implement cleanup tracking per component
            }
        } catch (error) {
            console.error(`Error in useEffect for component ${componentId}:`, error);
        }
    });
}

export function resetState(componentId?: string): void {
    // Reset state index for the specified component or the current component if none is provided
    const targetComponent = componentId || currentComponent;
    if (targetComponent) {
        const componentState = componentStates.get(targetComponent);
        if (componentState) {
            componentState.stateIndex = 0;
        }
    }
}

export function cleanupState(componentId: string): void {
    // Remove all state for the specified component
    if (componentStates.has(componentId)) {
        componentStates.delete(componentId);
    }
}

export function setCurrentEffect(effect: Subscriber | null): void {
    currentEffect = effect;
}

export function setCurrentComponent(instanceId: string | null): void {
    currentComponent = instanceId;
}

export function updateComponentId(oldInstanceId: string, newInstanceId: string): void {
    if (componentStates.has(oldInstanceId)) {
        const state = componentStates.get(oldInstanceId);
        if (state) {
            // Update the component ID in all state entries
            state.states.forEach(stateEntry => {
                if (stateEntry && stateEntry.componentId === oldInstanceId) {
                    stateEntry.componentId = newInstanceId;
                }
            });

            componentStates.set(newInstanceId, state);
            componentStates.delete(oldInstanceId);
        }
    }
}

/**
 * Clean up state and subscribers for a component when it's unmounted
 */
export function cleanupComponent(instanceId: string): void {
    if (componentStates.has(instanceId)) {
        const componentState = componentStates.get(instanceId);
        if (componentState) {
            // Clear all subscribers for this component's states
            componentState.states.forEach(state => {
                if (state && state.subscribers) {
                    state.subscribers.clear();
                }
            });
        }

        componentStates.delete(instanceId);
    }

    // Remove from updating components if present
    updatingComponents.delete(instanceId);
}