export interface Props {
    [key: string]: any;
    style?: {
        [key: keyof CSSStyleDeclaration]: string | number;
    };
    class?: string;
}