// Style handling functionality

/**
 * Apply CSS styles to an element
 * @param element The DOM element to apply styles to
 * @param styles Object containing style properties
 */
export const applyStyles = (element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void => {
    Object.keys(styles).forEach((style) => {
        try {
            // @ts-ignore This is safe as we are using CSSStyleDeclaration keys
            element.style.setProperty(style, styles[style] as string);
        } catch (e) {
            console.warn(`Failed to apply style "${style}":`, e);
        }
    });
}