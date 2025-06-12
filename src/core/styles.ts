// Style handling functionality

/**
 * Apply CSS styles to an element
 * @param element The DOM element to apply styles to
 * @param styles Object containing style properties
 */
export const applyStyles = (element: HTMLElement, styles: Record<string, string | number>): void => {
    Object.keys(styles).forEach((style) => {
        try {
            (element.style as any)[style] = styles[style];
        } catch (e) {
            console.warn(`Failed to apply style "${style}":`, e);
        }
    });
}