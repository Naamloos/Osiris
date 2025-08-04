import { cleanupComponent, cleanupState, resetState, setCurrentComponent, setCurrentEffect, updateComponentId } from "./reactivity";
import { VNode, Props, PatchOperation, ChildPatchOperation, PropPatchOperation } from "./types";

const virtualTrees = new WeakMap<HTMLElement, VNode>();

// Track event listeners for proper cleanup
const elementEventListeners = new WeakMap<HTMLElement, Map<string, EventListener>>();

export function $(
    elementType: string,
    ...children: (HTMLElement | VNode | Props | string)[]
): VNode {
    const props: Props = {};
    const childNodes: (VNode | string)[] = [];

    children.forEach((child) => {
        // If child is a string, push it directly
        if (typeof child === "string") {
            childNodes.push(child);
            return;
        }
        // If child is identified as a VNode, push it directly
        if ("_osirisVNode" in child && child._osirisVNode) {
            // If it's already a VNode, just push it
            childNodes.push(child as VNode);
            return;
        }

        // If child is an HTMLElement, we can convert it to a VNode
        if (child instanceof HTMLElement) {
            // If it's an HTMLElement, convert it to a VNode
            childNodes.push(convertElementToVNode(child));
            return;
        }

        // Otherwise, treat it as props
        Object.assign(props, child);
    });

    return {
        type: elementType,
        props,
        children: childNodes,
        key: props.key,
        _osirisVNode: true,
    };
}

function convertElementToVNode(element: HTMLElement): VNode {
    const props: Props = {};

    // Copy attributes
    for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        props[attr.name] = attr.value;
    }

    // Convert children
    const children: (VNode | string)[] = [];
    for (let i = 0; i < element.childNodes.length; i++) {
        const child = element.childNodes[i];
        if (child.nodeType === Node.TEXT_NODE) {
            children.push(child.textContent || "");
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            children.push(convertElementToVNode(child as HTMLElement));
        }
    }

    return {
        type: element.tagName.toLowerCase(),
        props,
        children,
        _osirisInstanceId: Math.random().toString(36), // Unique ID for instance tracking,
        _osirisVNode: true, // Indicate that this is a VNode
    };
}

/**
 * Creates a real DOM element from a virtual DOM node
 */
function convertVNodeToElement(vnode: VNode | string): HTMLElement | Text {
    if (typeof vnode === "string") {
        return document.createTextNode(vnode);
    } else if (
        !vnode ||
        typeof vnode !== "object"
        || !vnode._osirisVNode
    ) {
        throw new Error("Invalid VNode structure");
    }

    const element = document.createElement(vnode.type);

    // Apply props
    Object.keys(vnode.props).forEach((key) => {
        try {
            if (key === "key") {
                // Skip key prop as it's for virtual DOM only
                return;
            } else if (key.startsWith("on")) {
                // Handle event listeners
                const eventType = key.slice(2).toLowerCase();
                const handler = vnode.props[key];

                // Track the event listener for cleanup
                if (!elementEventListeners.has(element)) {
                    elementEventListeners.set(element, new Map());
                }
                elementEventListeners.get(element)!.set(eventType, handler);

                element.addEventListener(eventType, handler);
            } else if (
                key === "style" &&
                typeof vnode.props[key] === "object"
            ) {
                // Handle styles
                styleElement(element, vnode.props[key]);
            } else {
                // Set attributes
                element.setAttribute(key, vnode.props[key]);
            }
        } catch (e) {
            console.warn(
                `Failed to set attribute or event listener for key "${key}":`,
                e
            );
        }
    });

    // Append children
    vnode.children.forEach((child) => {
        const childElement = convertVNodeToElement(child);
        element.appendChild(childElement);
    });

    return element;
}

/**
 * Applies CSS styles to an element
 * @param element The DOM element to apply styles to
 * @param styles Object containing style properties
 */
function styleElement(
    element: HTMLElement,
    styles: Partial<CSSStyleDeclaration>
): void {
    Object.keys(styles).forEach((style) => {
        try {
            // @ts-ignore This is safe as we are using CSSStyleDeclaration keys
            element.style.setProperty(style, styles[style] as string);
        } catch (e) {
            console.warn(`Failed to apply style "${style}":`, e);
        }
    });
};


/**
 * Renders a virtual DOM tree to a real DOM element
 */
export function updateVNode(vnode: VNode, container: HTMLElement): void {
    const currentVTree = virtualTrees.get(container);

    if (currentVTree === undefined) {
        // Initial render - clear container and create fresh DOM
        container.innerHTML = '';
        const element = convertVNodeToElement(vnode);
        container.appendChild(element);
        virtualTrees.set(container, vnode);
    } else {
        // Update render - always diff and patch for array changes
        const patches = determinePatchOperations(currentVTree, vnode);
        if (patches.length > 0 && container.firstChild) {
            applyPatches(container.firstChild as HTMLElement, patches, vnode);
        }
        virtualTrees.set(container, vnode);
    }
}

function determinePatchOperations(oldVNode: VNode | string | null, newVNode: VNode | string | null): PatchOperation[] {
    const patches: PatchOperation[] = [];

    // old VNode does not exist, so we need to create a new node
    if (oldVNode === null) {
        patches.push({ type: 'CREATE', vnode: newVNode });
    }
    // new VNode does not exist, so we need to remove the old node
    else if (newVNode === null) {
        patches.push({ type: 'REMOVE' });
    }
    // Both the old AND new VNode are a string, so if they are different, we need to replace the old node
    else if (typeof oldVNode === 'string' || typeof newVNode === 'string') {
        if (oldVNode !== newVNode) {
            patches.push({ type: 'REPLACE', vnode: newVNode });
        }
    }
    // The VNode changed type, so we need to replace the old node
    else if (oldVNode.type !== newVNode.type) {
        if (oldVNode._osirisInstanceId) {
            updateComponentId(oldVNode._osirisInstanceId, newVNode._osirisInstanceId || '');
        }
        patches.push({ type: 'REPLACE', vnode: newVNode });
    }
    // Key changed - force complete replacement to ensure proper state isolation
    else if (oldVNode.key !== newVNode.key) {
        if (oldVNode._osirisInstanceId) {
            cleanupComponent(oldVNode._osirisInstanceId);
        }
        patches.push({ type: 'REPLACE', vnode: newVNode });
    }
    else {
        // Same type, check props and children
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
 * Diffs props between two vnodes
 */
function determinePropPatchOperations(oldProps: Props, newProps: Props): PropPatchOperation[] {
    const patches: PropPatchOperation[] = [];
    const allKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);

    allKeys.forEach(key => {
        if (key === 'key') return; // Skip key prop

        const oldValue = oldProps[key];
        const newValue = newProps[key];

        // If the value has changed, we need to update it
        if (oldValue !== newValue) {
            if (newValue === undefined) {
                // If the new value is undefined, we need to remove the prop
                patches.push({ type: 'REMOVE_PROP', key });
            } else {
                // Otherwise, we set the new prop value
                patches.push({ type: 'SET_PROP', key, value: newValue });
            }
        }
    });

    return patches;
}

/**
 * Diffs children arrays using a simple keyed diffing algorithm
 */
function determineChildPatchOperations(oldChildren: (VNode | string)[], newChildren: (VNode | string)[]): ChildPatchOperation[] {
    const patches: ChildPatchOperation[] = [];
    const maxLength = Math.max(oldChildren.length, newChildren.length);

    // Handle keyed elements more carefully
    const oldKeyed = new Map<string | number, { vnode: VNode, index: number }>();
    const newKeyed = new Map<string | number, VNode>();

    // Build maps of keyed elements
    oldChildren.forEach((child, index) => {
        if (typeof child !== 'string' && child.key !== undefined) {
            oldKeyed.set(child.key, { vnode: child, index });
        }
    });

    newChildren.forEach((child) => {
        if (typeof child !== 'string' && child.key !== undefined) {
            newKeyed.set(child.key, child);
        }
    });

    // Process each position
    for (let i = 0; i < maxLength; i++) {
        const oldChild = oldChildren[i];
        const newChild = newChildren[i];

        // If we have a new keyed element, check if it moved from elsewhere
        if (typeof newChild !== 'string' && newChild?.key !== undefined) {
            const oldKeyedItem = oldKeyed.get(newChild.key);
            if (oldKeyedItem && oldKeyedItem.index !== i) {
                // Element moved - treat as replace for simplicity
                patches.push({ index: i, patches: [{ type: 'REPLACE', vnode: newChild }] });
                continue;
            }
        }

        // Normal diffing
        const childPatches = determinePatchOperations(oldChild || null, newChild || null);
        if (childPatches.length > 0) {
            patches.push({ index: i, patches: childPatches });
        }
    }

    return patches;
}

function applyPatches(element: HTMLElement | Text, patches: PatchOperation[], vnode?: VNode): HTMLElement | Text {
    let currentElement = element;

    patches.forEach(patchOp => {
        switch (patchOp.type) {
            case 'CREATE':
                if (patchOp.vnode) {
                    currentElement = convertVNodeToElement(patchOp.vnode);
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
                if (patchOp.vnode && currentElement.parentNode) {
                    const newElement = convertVNodeToElement(patchOp.vnode);
                    currentElement.parentNode.replaceChild(newElement, currentElement);
                    currentElement = newElement;
                }
                break;

            case 'UPDATE_PROPS':
                if (currentElement instanceof HTMLElement && patchOp.props) {
                    patchOp.props.forEach(propPatch => {
                        applyPropPatch(currentElement as HTMLElement, propPatch);
                    });
                }
                break;

            case 'UPDATE_CHILDREN':
                if (currentElement instanceof HTMLElement && patchOp.children) {
                    patchOp.children.forEach(childPatch => {
                        const childElement = currentElement.childNodes[childPatch.index];
                        if (childElement) {
                            applyPatches(childElement as HTMLElement | Text, childPatch.patches);
                        } else {
                            // Handle new children being added
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
 * Applies a property patch to an element
 */
function applyPropPatch(element: HTMLElement, propPatch: PropPatchOperation): void {
    switch (propPatch.type) {
        case 'SET_PROP':
            try {
                if (propPatch.key.startsWith('on')) {
                    // Handle event listeners - remove old and add new
                    const eventType = propPatch.key.slice(2).toLowerCase();

                    // Remove old event listener if it exists
                    const listeners = elementEventListeners.get(element);
                    if (listeners && listeners.has(eventType)) {
                        const oldHandler = listeners.get(eventType);
                        if (oldHandler) {
                            element.removeEventListener(eventType, oldHandler);
                        }
                    }

                    // Add new event listener
                    if (propPatch.value) {
                        if (!elementEventListeners.has(element)) {
                            elementEventListeners.set(element, new Map());
                        }
                        elementEventListeners.get(element)!.set(eventType, propPatch.value);
                        element.addEventListener(eventType, propPatch.value);
                    }
                } else if (propPatch.key === 'style' && typeof propPatch.value === 'object') {
                    // Handle styles
                    styleElement(element, propPatch.value);
                } else {
                    // Set attributes
                    element.setAttribute(propPatch.key, propPatch.value);
                }
            } catch (e) {
                console.warn(`Failed to set property "${propPatch.key}":`, e);
            }
            break;

        case 'REMOVE_PROP':
            try {
                if (propPatch.key.startsWith('on')) {
                    // Remove event listener
                    const eventType = propPatch.key.slice(2).toLowerCase();
                    const listeners = elementEventListeners.get(element);
                    if (listeners && listeners.has(eventType)) {
                        const handler = listeners.get(eventType);
                        if (handler) {
                            element.removeEventListener(eventType, handler);
                        }
                        listeners.delete(eventType);
                    }
                } else {
                    element.removeAttribute(propPatch.key);
                }
            } catch (e) {
                console.warn(`Failed to remove property "${propPatch.key}":`, e);
            }
            break;
    }
}
