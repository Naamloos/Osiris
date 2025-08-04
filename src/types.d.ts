/**
 * Represents a Virtual Node (VNode) in the virtual DOM structure.
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
 * Represents the properties of a DOM element.
 */
export interface Props {
    [key: string]: any;
    style?: Partial<CSSStyleDeclaration>;
    class?: string;
    key?: string | number;
}

/**
 * Patch operations for virtual DOM diffing
 */
export interface PatchOperation {
    type: 'CREATE' | 'REMOVE' | 'REPLACE' | 'UPDATE_PROPS' | 'UPDATE_CHILDREN';
    vnode?: VNode | string | null;
    props?: PropPatchOperation[];
    children?: ChildPatchOperation[];
}

export interface PropPatchOperation {
    type: 'SET_PROP' | 'REMOVE_PROP';
    key: string;
    value?: any;
}

export interface ChildPatchOperation {
    index: number;
    patches: PatchOperation[];
}