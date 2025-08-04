/**
 * Represents a Virtual Node (VNode) in a virtual DOM structure.
 * This interface defines the structure of a VNode, which includes
 * the type of element, its properties, and its children.
 */
export interface VNode {
    type: string;
    props: Props;
    children: (VNode | string)[];
    key?: string | number;
    _osirisInstanceId?: string;
    _osirisVNode: true;
}

export type VNodeChild = VNode | string | Props;

export type VNodeFactory<T> = (...children: (VNodeChild | Partial<T>)[]) => VNode;

/**
 * Represents the properties of a node.
 * This interface allows for dynamic properties and includes optional style and class attributes.
 */
export interface Props {
    [key: string]: any;
    style?: Partial<CSSStyleDeclaration>;
    class?: string;
}

interface PatchOperation {
    type: 'CREATE' | 'REMOVE' | 'REPLACE' | 'UPDATE_PROPS' | 'UPDATE_CHILDREN';
    vnode?: VNode | string | null;
    props?: PropPatchOperation[];
    children?: ChildPatchOperation[];
}

interface PropPatchOperation {
    type: 'SET_PROP' | 'REMOVE_PROP';
    key: string;
    value?: any;
}

interface ChildPatchOperation {
    index: number;
    patches: PatchOperation[];
}