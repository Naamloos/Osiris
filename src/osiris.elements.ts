import { $ } from "./osiris";
import { Props } from "./types/Props";

// Type representing any children that can be passed to elements
type Child = HTMLElement | string | Props;

// Helper type for element creation functions
type ElementFunction = (propsOrChild?: Props | Child, ...children: Child[]) => HTMLElement;

// Function to create element factories
function createElementFactory(tagName: string): ElementFunction {
    return (propsOrChild?: Props | Child, ...children: Child[]) => {
        // If first argument is props object (not a string or HTMLElement)
        if (propsOrChild && typeof propsOrChild !== 'string' && !(propsOrChild instanceof HTMLElement)) {
            return $(tagName, propsOrChild, ...children);
        } else {
            // First argument is a child, not props
            return $(tagName, ...[propsOrChild, ...children].filter(Boolean) as Child[]);
        }
    };
}

// Common HTML elements
export const div = createElementFactory('div');
export const span = createElementFactory('span');
export const p = createElementFactory('p');
export const h1 = createElementFactory('h1');
export const h2 = createElementFactory('h2');
export const h3 = createElementFactory('h3');
export const h4 = createElementFactory('h4');
export const h5 = createElementFactory('h5');
export const h6 = createElementFactory('h6');
export const a = createElementFactory('a');
export const button = createElementFactory('button');
export const input = createElementFactory('input');
export const textarea = createElementFactory('textarea');
export const select = createElementFactory('select');
export const option = createElementFactory('option');
export const ul = createElementFactory('ul');
export const ol = createElementFactory('ol');
export const li = createElementFactory('li');
export const img = createElementFactory('img');
export const table = createElementFactory('table');
export const tr = createElementFactory('tr');
export const th = createElementFactory('th');
export const td = createElementFactory('td');
export const form = createElementFactory('form');
export const label = createElementFactory('label');
export const nav = createElementFactory('nav');
export const header = createElementFactory('header');
export const footer = createElementFactory('footer');
export const main = createElementFactory('main');
export const section = createElementFactory('section');
export const article = createElementFactory('article');