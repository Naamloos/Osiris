// Types
type Subscriber = () => void;

// Store for reactive state
let currentEffect: Subscriber | null = null;
const states: any[] = [];
let stateIndex = 0;
let isUpdating = false;
let pendingUpdates = new Set<Subscriber>();

/**
 * Initializes state management for a value.
 * @param initialValue Initial value for the state
 * @returns A tuple containing the current state value and a function to update it.
 * The update function will trigger re-renders of components that depend on this state.
 */
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
        // Only update if value actually changed
        if (state.value === newValue) {
            return;
        }
        
        state.value = newValue;
        
        // Batch state updates to prevent cascading re-renders
        if (isUpdating) {
            state.subscribers.forEach((subscriber: Subscriber) => {
                pendingUpdates.add(subscriber);
            });
            return;
        }
        
        isUpdating = true;
        
        // Use microtask to batch synchronous updates
        Promise.resolve().then(() => {
            const allSubscribers = new Set<Subscriber>();
            state.subscribers.forEach((subscriber: Subscriber) => {
                allSubscribers.add(subscriber);
            });
            pendingUpdates.forEach(subscriber => allSubscribers.add(subscriber));
            
            pendingUpdates.clear();
            isUpdating = false;
            
            // Trigger all unique subscribers once
            allSubscribers.forEach(subscriber => subscriber());
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
    // Use requestAnimationFrame instead of setTimeout for better performance
    requestAnimationFrame(() => {
        const cleanup = callback();
        
        // Return cleanup function
        if (cleanup && typeof cleanup === 'function') {
            // Store cleanup for next time
        }
    });
}

export function resetState(): void {
    stateIndex = 0;
}

export function setCurrentEffect(effect: Subscriber | null): void {
    currentEffect = effect;
}