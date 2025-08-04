type Subscriber = () => void;

interface StateEntry {
    value: any;
    subscribers: Set<Subscriber>;
    componentId: string;
}

// Store for reactive state per component
let currentEffect: Subscriber | null = null;
let currentComponent: string | null = null;
export const componentStates = new Map<string, { states: StateEntry[], stateIndex: number }>();

// Track which components are currently updating to prevent race conditions
const updatingComponents = new Set<string>();

/**
 * React-like state hook for managing component state
 * @param initialValue Initial value for the state
 * @returns Tuple containing current state value and setter function
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

    // Initialize state if needed or type changed (component switching)
    if (componentState.states[index] === undefined ||
        (componentState.states[index] && typeof componentState.states[index].value !== typeof initialValue)) {
        componentState.states[index] = {
            value: initialValue,
            subscribers: new Set<Subscriber>(),
            componentId: currentComponent
        };
    }

    const state = componentState.states[index];

    // Subscribe current effect if it belongs to the same component
    if (currentEffect && state.componentId === currentComponent) {
        state.subscribers.add(currentEffect);
    }

    const setState = (newValue: T) => {
        // Skip if value unchanged or component is already updating
        if (state.value === newValue || updatingComponents.has(state.componentId)) {
            return;
        }

        state.value = newValue;
        updatingComponents.add(state.componentId);

        // Batch updates with requestAnimationFrame
        requestAnimationFrame(() => {
            // Trigger all subscribers for this state
            state.subscribers.forEach(subscriber => {
                try {
                    subscriber();
                } catch (error) {
                    console.error('Error in state subscriber:', error);
                }
            });

            updatingComponents.delete(state.componentId);
        });
    };

    return [state.value, setState];
}

/**
 * React-like effect hook for side effects
 * @param callback Function to run after render, can return cleanup function
 * @param deps Optional dependency array (currently unused but follows React API)
 */
export function useEffect(callback: () => void | (() => void), deps?: any[]): void {
    if (!currentComponent) {
        console.warn('useEffect called outside of component render function');
        return;
    }

    const componentId = currentComponent;

    // Schedule effect to run after render
    requestAnimationFrame(() => {
        try {
            const cleanup = callback();
            // TODO: Implement proper cleanup tracking per component
            if (cleanup && typeof cleanup === 'function') {
                // Store cleanup function for future implementation
            }
        } catch (error) {
            console.error(`Error in useEffect for component ${componentId}:`, error);
        }
    });
}

/**
 * Reset state index for component (called before each render)
 */
export function resetState(componentId?: string): void {
    const targetComponent = componentId || currentComponent;
    if (targetComponent) {
        const componentState = componentStates.get(targetComponent);
        if (componentState) {
            componentState.stateIndex = 0;
        }
    }
}

/**
 * Clean up all state for a component
 */
export function cleanupState(componentId: string): void {
    componentStates.delete(componentId);
}

/**
 * Set the current effect subscriber (for state subscription)
 */
export function setCurrentEffect(effect: Subscriber | null): void {
    currentEffect = effect;
}

/**
 * Set the current component context
 */
export function setCurrentComponent(instanceId: string | null): void {
    currentComponent = instanceId;
}

/**
 * Update component ID when component instance changes
 */
export function updateComponentId(oldInstanceId: string, newInstanceId: string): void {
    const state = componentStates.get(oldInstanceId);
    if (state) {
        // Update component ID in all state entries
        state.states.forEach(stateEntry => {
            if (stateEntry?.componentId === oldInstanceId) {
                stateEntry.componentId = newInstanceId;
            }
        });

        componentStates.set(newInstanceId, state);
        componentStates.delete(oldInstanceId);
    }
}

/**
 * Complete cleanup of component state and subscribers
 */
export function cleanupComponent(instanceId: string): void {
    const componentState = componentStates.get(instanceId);
    if (componentState) {
        // Clear all subscribers
        componentState.states.forEach(state => {
            state?.subscribers?.clear();
        });
        componentStates.delete(instanceId);
    }

    updatingComponents.delete(instanceId);
}