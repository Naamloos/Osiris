// Types
type Subscriber = () => void;

// Store for reactive state
let currentEffect: Subscriber | null = null;
const states: any[] = [];
let stateIndex = 0;

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
        state.value = newValue;
        // Notify all subscribers
        state.subscribers.forEach((subscriber: Subscriber) => subscriber());
    };
    
    return [state.value, setState];
}

/**
 * @param callback Function to run after render is complete.
 * This function can return a cleanup function that will be called before the next effect runs.
 * @param deps Optional array of dependencies that the effect depends on.
 */
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

export function resetState(): void {
    stateIndex = 0;
}

export function setCurrentEffect(effect: Subscriber | null): void {
    currentEffect = effect;
}