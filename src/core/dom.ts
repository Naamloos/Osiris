import { Props } from "../types/Props";
import { applyStyles } from "./styles";

/**
 * Creates a new HTML element with specified children.
 * @param elementType The type of HTML element to create (e.g., 'div', 'span', etc.)
 * @param children The child elements or text to append to the created element.
 * @returns The created HTML element.
 */
export function $(elementType: string, ...children: (HTMLElement | Props | string)[]): HTMLElement {
    const element = document.createElement(elementType);
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof HTMLElement) {
            element.appendChild(child);
        }
        // If child is object, append all object properties as attributes, ignoring types
        else if (typeof child === 'object' && child !== null) {
            Object.keys(child).forEach(key => {
                try {
                    if (key.startsWith('on')) {
                        // Handle event listeners
                        element.addEventListener(key.slice(2).toLowerCase(), child[key]);
                    } 
                    if(key === 'style' && typeof child[key] === 'object') {
                        // Handle styles
                        applyStyles(element, child[key]);
                    }
                    else {
                        // Set attributes
                        element.setAttribute(key, child[key]);
                    }
                } catch (e) {
                    console.warn(`Failed to set attribute or event listener for key "${key}":`, e);
                }
            });
        }
    });
    return element;
}