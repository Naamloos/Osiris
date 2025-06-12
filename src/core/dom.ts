import { Props } from "../types/Props";
import { applyStyles } from "./styles";

// Virtual DOM node structure
export interface VNode {
    type: string;
    props: Props;
    children: (VNode | string)[];
    key?: string | number;
}

// Store for virtual DOM trees per container
const containerTrees = new WeakMap<HTMLElement, VNode>();

/**
 * Creates a virtual DOM node
 * @param elementType The type of HTML element to create (e.g., 'div', 'span', etc.)
 * @param children The child elements, props, or text to append to the created element.
 * @returns A virtual DOM node
 */
export function $(elementType: string, ...children: (HTMLElement | VNode | Props | string)[]): VNode {
    const props: Props = {};
    const childNodes: (VNode | string)[] = [];

    children.forEach(child => {
        if (typeof child === 'string') {
            childNodes.push(child);
        } else if (child && typeof child === 'object') {
            // Check if it's a VNode
            if ('type' in child && 'props' in child && 'children' in child) {
                childNodes.push(child as VNode);
            }
            // Check if it's an HTMLElement (convert to VNode)
            else if (child instanceof HTMLElement) {
                childNodes.push(htmlElementToVNode(child));
            }
            // Otherwise treat as props
            else {
                Object.assign(props, child);
            }
        }
    });

    return {
        type: elementType,
        props,
        children: childNodes,
        key: props.key
    };
}

/**
 * Converts an HTMLElement to a VNode
 */
function htmlElementToVNode(element: HTMLElement): VNode {
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
            children.push(child.textContent || '');
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            children.push(htmlElementToVNode(child as HTMLElement));
        }
    }

    return {
        type: element.tagName.toLowerCase(),
        props,
        children
    };
}

/**
 * Creates a real DOM element from a virtual DOM node
 */
function createElement(vnode: VNode | string): HTMLElement | Text {
    if (typeof vnode === 'string') {
        return document.createTextNode(vnode);
    }

    const element = document.createElement(vnode.type);

    // Apply props
    Object.keys(vnode.props).forEach(key => {
        try {
            if (key === 'key') {
                // Skip key prop as it's for virtual DOM only
                return;
            } else if (key.startsWith('on')) {
                // Handle event listeners
                element.addEventListener(key.slice(2).toLowerCase(), vnode.props[key]);
            } else if (key === 'style' && typeof vnode.props[key] === 'object') {
                // Handle styles
                applyStyles(element, vnode.props[key]);
            } else {
                // Set attributes
                element.setAttribute(key, vnode.props[key]);
            }
        } catch (e) {
            console.warn(`Failed to set attribute or event listener for key "${key}":`, e);
        }
    });

    // Append children
    vnode.children.forEach(child => {
        const childElement = createElement(child);
        element.appendChild(childElement);
    });

    return element;
}

/**
 * Diffs two virtual DOM nodes and returns patch operations
 */
function diff(oldVNode: VNode | string | null, newVNode: VNode | string | null): PatchOperation[] {
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
        patches.push({ type: 'REPLACE', vnode: newVNode });
    } else {
        // Same type, check props and children
        const propPatches = diffProps(oldVNode.props, newVNode.props);
        if (propPatches.length > 0) {
            patches.push({ type: 'UPDATE_PROPS', props: propPatches });
        }

        const childPatches = diffChildren(oldVNode.children, newVNode.children);
        if (childPatches.length > 0) {
            patches.push({ type: 'UPDATE_CHILDREN', children: childPatches });
        }
    }

    return patches;
}

/**
 * Diffs props between two vnodes
 */
function diffProps(oldProps: Props, newProps: Props): PropPatch[] {
    const patches: PropPatch[] = [];
    const allKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);

    allKeys.forEach(key => {
        if (key === 'key') return; // Skip key prop

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
 * Diffs children arrays using a simple keyed diffing algorithm
 */
function diffChildren(oldChildren: (VNode | string)[], newChildren: (VNode | string)[]): ChildPatch[] {
    const patches: ChildPatch[] = [];
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
        const childPatches = diff(oldChild || null, newChild || null);
        if (childPatches.length > 0) {
            patches.push({ index: i, patches: childPatches });
        }
    }

    return patches;
}

/**
 * Applies patches to a real DOM element
 */
function patch(element: HTMLElement | Text, patches: PatchOperation[]): HTMLElement | Text {
    let currentElement = element;

    patches.forEach(patchOp => {
        switch (patchOp.type) {
            case 'CREATE':
                if (patchOp.vnode) {
                    currentElement = createElement(patchOp.vnode);
                }
                break;

            case 'REMOVE':
                if (currentElement.parentNode) {
                    currentElement.parentNode.removeChild(currentElement);
                }
                break;

            case 'REPLACE':
                if (patchOp.vnode && currentElement.parentNode) {
                    const newElement = createElement(patchOp.vnode);
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
                            patch(childElement as HTMLElement | Text, childPatch.patches);
                        } else {
                            // Handle new children being added
                            childPatch.patches.forEach(childChildPatch => {
                                if (childChildPatch.type === 'CREATE' && childChildPatch.vnode) {
                                    const newChild = createElement(childChildPatch.vnode);
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
function applyPropPatch(element: HTMLElement, propPatch: PropPatch): void {
    switch (propPatch.type) {
        case 'SET_PROP':
            try {
                if (propPatch.key.startsWith('on')) {
                    // Handle event listeners - remove old and add new
                    element.addEventListener(propPatch.key.slice(2).toLowerCase(), propPatch.value);
                } else if (propPatch.key === 'style' && typeof propPatch.value === 'object') {
                    // Handle styles
                    applyStyles(element, propPatch.value);
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
                element.removeAttribute(propPatch.key);
            } catch (e) {
                console.warn(`Failed to remove property "${propPatch.key}":`, e);
            }
            break;
    }
}

/**
 * Renders a virtual DOM tree to a real DOM element
 */
export function render(vnode: VNode, container: HTMLElement): void {
    const currentVTree = containerTrees.get(container);
    
    if (currentVTree === undefined) {
        // Initial render - clear container and create fresh DOM
        container.innerHTML = '';
        const element = createElement(vnode);
        container.appendChild(element);
        containerTrees.set(container, vnode);
    } else {
        // Update render - always diff and patch for array changes
        const patches = diff(currentVTree, vnode);
        if (patches.length > 0 && container.firstChild) {
            patch(container.firstChild as HTMLElement, patches);
        }
        containerTrees.set(container, vnode);
    }
}

/**
 * Quick equality check for VNodes to avoid unnecessary diffing
 */
function areVNodesEqual(a: VNode, b: VNode): boolean {
    if (a.type !== b.type) return false;
    if (a.children.length !== b.children.length) return false;
    
    // Quick check for text nodes
    if (a.children.length === 1 && b.children.length === 1) {
        if (typeof a.children[0] === 'string' && typeof b.children[0] === 'string') {
            return a.children[0] === b.children[0] && shallowEqual(a.props, b.props);
        }
    }
    
    return false;
}

/**
 * Shallow comparison of props objects
 */
function shallowEqual(a: Props, b: Props): boolean {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (let key of keysA) {
        if (a[key] !== b[key]) return false;
    }
    
    return true;
}

// Patch operation types
interface PatchOperation {
    type: 'CREATE' | 'REMOVE' | 'REPLACE' | 'UPDATE_PROPS' | 'UPDATE_CHILDREN';
    vnode?: VNode | string | null;
    props?: PropPatch[];
    children?: ChildPatch[];
}

interface PropPatch {
    type: 'SET_PROP' | 'REMOVE_PROP';
    key: string;
    value?: any;
}

interface ChildPatch {
    index: number;
    patches: PatchOperation[];
}