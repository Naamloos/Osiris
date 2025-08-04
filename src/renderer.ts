import { cleanupComponent, cleanupState, resetState, setCurrentComponent, setCurrentEffect, updateComponentId } from "./reactivity";
import { VNode, Props, PatchOperation, ChildPatchOperation, PropPatchOperation } from "./types";

/**
 * Cache virtual DOM trees for each container element
 */
const virtualTrees = new WeakMap<HTMLElement, VNode>();

/**
 * Track event listeners for proper cleanup
 */
const elementEventListeners = new WeakMap<HTMLElement, Map<string, EventListener>>();

/**
 * Creates a Virtual Node (VNode) from element type and children
 * @param elementType HTML tag name
 * @param children Mixed array of props, VNodes, strings, or HTMLElements
 * @returns VNode representation
 */
export function $(
    elementType: string,
    ...children: (HTMLElement | VNode | Props | string)[]
): VNode {
    const props: Props = {};
    const childNodes: (VNode | string)[] = [];

    children.forEach((child) => {
        if (typeof child === "string") {
            childNodes.push(child);
        } else if (child && typeof child === "object" && "_osirisVNode" in child) {
            childNodes.push(child as VNode);
        } else if (child instanceof HTMLElement) {
            childNodes.push(convertElementToVNode(child));
        } else {
            // Treat as props
            Object.assign(props, child);
        }
    });

    return {
        type: elementType,
        props,
        children: childNodes,
        key: props.key,
        _osirisVNode: true,
    };
}

/**
 * Converts an existing DOM element to a VNode
 */
function convertElementToVNode(element: HTMLElement): VNode {
    const props: Props = {};

    // Copy attributes
    Array.from(element.attributes).forEach(attr => {
        props[attr.name] = attr.value;
    });

    // Convert child nodes
    const children: (VNode | string)[] = [];
    Array.from(element.childNodes).forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent || "";
            if (text.trim()) children.push(text);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            children.push(convertElementToVNode(child as HTMLElement));
        }
    });

    return {
        type: element.tagName.toLowerCase(),
        props,
        children,
        _osirisInstanceId: Math.random().toString(36),
        _osirisVNode: true,
    };
}

/**
 * Creates a real DOM element from a VNode
 */
function convertVNodeToElement(vnode: VNode | string): HTMLElement | Text {
    if (typeof vnode === "string") {
        return document.createTextNode(vnode);
    }

    if (!vnode?._osirisVNode) {
        throw new Error("Invalid VNode structure");
    }

    const element = document.createElement(vnode.type);

    // Apply props
    Object.entries(vnode.props).forEach(([key, value]) => {
        if (key === "key") return; // Skip virtual DOM key

        try {
            if (key.startsWith("on")) {
                // Handle event listeners
                const eventType = key.slice(2).toLowerCase();

                if (!elementEventListeners.has(element)) {
                    elementEventListeners.set(element, new Map());
                }
                elementEventListeners.get(element)!.set(eventType, value);
                element.addEventListener(eventType, value);
            } else if (key === "style" && typeof value === "object") {
                // Handle style objects
                applyStyles(element, value);
            } else {
                // Set regular attributes
                element.setAttribute(key, String(value));
            }
        } catch (error) {
            console.warn(`Failed to set property "${key}":`, error);
        }
    });

    // Append children
    vnode.children.forEach(child => {
        const childElement = convertVNodeToElement(child);
        element.appendChild(childElement);
    });

    return element;
}

/**
 * Applies CSS styles to an element
 */
function applyStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
    Object.entries(styles).forEach(([property, value]) => {
        if (value != null) {
            element.style.setProperty(property, String(value));
        }
    });
}

/**
 * Renders or updates a VNode in a container element
 */
export function updateVNode(vnode: VNode, container: HTMLElement): void {
    const currentVTree = virtualTrees.get(container);

    if (!currentVTree) {
        // Initial render
        container.innerHTML = '';
        const element = convertVNodeToElement(vnode);
        container.appendChild(element);
        virtualTrees.set(container, vnode);
    } else {
        // Update render - diff and patch
        const patches = determinePatchOperations(currentVTree, vnode);
        if (patches.length > 0 && container.firstChild) {
            applyPatches(container.firstChild as HTMLElement, patches, vnode);
        }
        virtualTrees.set(container, vnode);
    }
}

/**
 * Determines what patches are needed to transform old VNode to new VNode
 */
function determinePatchOperations(oldVNode: VNode | string | null, newVNode: VNode | string | null): PatchOperation[] {
    const patches: PatchOperation[] = [];

    if (oldVNode === null) {
        patches.push({ type: 'CREATE', vnode: newVNode });
    } else if (newVNode === null) {
        patches.push({ type: 'REMOVE' });
    } else if (typeof oldVNode === 'string' || typeof newVNode === 'string') {
        if (oldVNode !== newVNode) {
            patches.push({ type: 'REPLACE', vnode: newVNode });
        }
    } else if (oldVNode.type !== newVNode.type) {
        // Different element types - replace entirely
        if (oldVNode._osirisInstanceId) {
            updateComponentId(oldVNode._osirisInstanceId, newVNode._osirisInstanceId || '');
        }
        patches.push({ type: 'REPLACE', vnode: newVNode });
    } else if (oldVNode.key !== newVNode.key) {
        // Key changed - force replacement for proper state isolation
        if (oldVNode._osirisInstanceId) {
            cleanupComponent(oldVNode._osirisInstanceId);
        }
        patches.push({ type: 'REPLACE', vnode: newVNode });
    } else {
        // Same type and key - check props and children
        const propPatches = determinePropPatchOperations(oldVNode.props, newVNode.props);
        if (propPatches.length > 0) {
            patches.push({ type: 'UPDATE_PROPS', props: propPatches });
        }

        const childPatches = determineChildPatchOperations(oldVNode.children, newVNode.children);
        if (childPatches.length > 0) {
            patches.push({ type: 'UPDATE_CHILDREN', children: childPatches });
        }
    }

    return patches;
}

/**
 * Determines prop changes between two VNodes
 */
function determinePropPatchOperations(oldProps: Props, newProps: Props): PropPatchOperation[] {
    const patches: PropPatchOperation[] = [];
    const allKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);

    allKeys.forEach(key => {
        if (key === 'key') return; // Skip virtual DOM key

        const oldValue = oldProps[key];
        const newValue = newProps[key];

        if (oldValue !== newValue) {
            if (newValue === undefined) {
                patches.push({ type: 'REMOVE_PROP', key });
            } else {
                patches.push({ type: 'SET_PROP', key, value: newValue });
            }
        }
    });

    return patches;
}

/**
 * Determines child changes using simple diffing algorithm
 */
function determineChildPatchOperations(oldChildren: (VNode | string)[], newChildren: (VNode | string)[]): ChildPatchOperation[] {
    const patches: ChildPatchOperation[] = [];
    const maxLength = Math.max(oldChildren.length, newChildren.length);

    // Simple index-based diffing (could be improved with keyed diffing)
    for (let i = 0; i < maxLength; i++) {
        const oldChild = oldChildren[i] || null;
        const newChild = newChildren[i] || null;

        const childPatches = determinePatchOperations(oldChild, newChild);
        if (childPatches.length > 0) {
            patches.push({ index: i, patches: childPatches });
        }
    }

    return patches;
}

/**
 * Applies patches to transform DOM elements
 */
function applyPatches(element: HTMLElement | Text, patches: PatchOperation[], vnode?: VNode): HTMLElement | Text {
    let currentElement = element;

    patches.forEach(patch => {
        switch (patch.type) {
            case 'CREATE':
                if (patch.vnode) {
                    currentElement = convertVNodeToElement(patch.vnode);
                }
                break;

            case 'REMOVE':
                if (currentElement.parentNode) {
                    currentElement.parentNode.removeChild(currentElement);
                    if (vnode?._osirisInstanceId) {
                        cleanupState(vnode._osirisInstanceId);
                        cleanupComponent(vnode._osirisInstanceId);
                    }
                }
                break;

            case 'REPLACE':
                if (patch.vnode && currentElement.parentNode) {
                    const newElement = convertVNodeToElement(patch.vnode);
                    currentElement.parentNode.replaceChild(newElement, currentElement);
                    currentElement = newElement;
                }
                break;

            case 'UPDATE_PROPS':
                if (currentElement instanceof HTMLElement && patch.props) {
                    patch.props.forEach(propPatch => {
                        applyPropPatch(currentElement as HTMLElement, propPatch);
                    });
                }
                break;

            case 'UPDATE_CHILDREN':
                if (currentElement instanceof HTMLElement && patch.children) {
                    patch.children.forEach(childPatch => {
                        const childElement = currentElement.childNodes[childPatch.index];
                        if (childElement) {
                            applyPatches(childElement as HTMLElement | Text, childPatch.patches);
                        } else {
                            // Handle new children
                            childPatch.patches.forEach(childChildPatch => {
                                if (childChildPatch.type === 'CREATE' && childChildPatch.vnode) {
                                    const newChild = convertVNodeToElement(childChildPatch.vnode);
                                    currentElement.appendChild(newChild);
                                }
                            });
                        }
                    });
                }
                break;
        }
    });

    return currentElement;
}

/**
 * Applies a single property patch to an element
 */
function applyPropPatch(element: HTMLElement, patch: PropPatchOperation): void {
    const { key, value } = patch;

    try {
        if (patch.type === 'REMOVE_PROP') {
            if (key.startsWith('on')) {
                // Remove event listener
                const eventType = key.slice(2).toLowerCase();
                const listeners = elementEventListeners.get(element);
                const handler = listeners?.get(eventType);
                if (handler) {
                    element.removeEventListener(eventType, handler);
                    listeners!.delete(eventType);
                }
            } else {
                element.removeAttribute(key);
            }
        } else {
            // SET_PROP
            if (key.startsWith('on')) {
                // Update event listener
                const eventType = key.slice(2).toLowerCase();
                const listeners = elementEventListeners.get(element);

                // Remove old listener
                const oldHandler = listeners?.get(eventType);
                if (oldHandler) {
                    element.removeEventListener(eventType, oldHandler);
                }

                // Add new listener
                if (value) {
                    if (!elementEventListeners.has(element)) {
                        elementEventListeners.set(element, new Map());
                    }
                    elementEventListeners.get(element)!.set(eventType, value);
                    element.addEventListener(eventType, value);
                }
            } else if (key === 'style' && typeof value === 'object') {
                applyStyles(element, value);
            } else {
                element.setAttribute(key, String(value));
            }
        }
    } catch (error) {
        console.warn(`Failed to apply property patch "${key}":`, error);
    }
}
