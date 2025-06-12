// HTML element factory functions
import { $, VNode } from "./dom";
import { Props } from "../types/Props";

// Type representing any children that can be passed to elements
type Child = VNode | string | Props;

// Helper type for element creation functions
type ElementFunction<T> = (...children: (Child | Partial<T>)[]) => VNode;

// Function to create element factories
function createElementFactory<T>(tagName: string): ElementFunction<T> {
    return (...children: (Child | Partial<T>)[]) => {
        // Optimized prop detection - check first arg more efficiently
        if (children.length > 0) {
            const first = children[0];
            // More efficient type checking
            if (first != null && typeof first === 'object' && 
                !('type' in first) && !('nodeType' in first) && 
                typeof first !== 'string') {
                return $(tagName, first, ...children.slice(1));
            }
        }
        // No props, just children
        return $(tagName, ...children);
    };
}

// Common HTML elements
export const div = createElementFactory<HTMLDivElement>('div');
export const span = createElementFactory<HTMLSpanElement>('span');
export const p = createElementFactory<HTMLParagraphElement>('p');
export const h1 = createElementFactory<HTMLHeadingElement>('h1');
export const h2 = createElementFactory<HTMLHeadingElement>('h2');
export const h3 = createElementFactory<HTMLHeadingElement>('h3');
export const h4 = createElementFactory<HTMLHeadingElement>('h4');
export const h5 = createElementFactory<HTMLHeadingElement>('h5');
export const h6 = createElementFactory<HTMLHeadingElement>('h6');
export const a = createElementFactory<HTMLAnchorElement>('a');
export const button = createElementFactory<HTMLButtonElement>('button');
export const input = createElementFactory<HTMLInputElement>('input');
export const textarea = createElementFactory<HTMLTextAreaElement>('textarea');
export const select = createElementFactory<HTMLSelectElement>('select');
export const option = createElementFactory<HTMLOptionElement>('option');
export const ul = createElementFactory<HTMLUListElement>('ul');
export const ol = createElementFactory<HTMLOListElement>('ol');
export const li = createElementFactory<HTMLLIElement>('li');
export const img = createElementFactory<HTMLImageElement>('img');
export const table = createElementFactory<HTMLTableElement>('table');
export const tr = createElementFactory<HTMLTableRowElement>('tr');
export const th = createElementFactory<HTMLTableHeaderCellElement>('th');
export const td = createElementFactory<HTMLTableCellElement>('td');
export const form = createElementFactory<HTMLFormElement>('form');
export const label = createElementFactory<HTMLLabelElement>('label');
export const nav = createElementFactory<HTMLDivElement>('nav');
export const header = createElementFactory<HTMLHeadElement>('header');
export const footer = createElementFactory<HTMLDivElement>('footer');
export const main = createElementFactory<HTMLDivElement>('main');
export const section = createElementFactory<HTMLDivElement>('section');
export const article = createElementFactory<HTMLDivElement>('article');
export const aside = createElementFactory<HTMLDivElement>('aside');
export const audio = createElementFactory<HTMLAudioElement>('audio');
export const b = createElementFactory<HTMLSpanElement>('b');
export const blockquote = createElementFactory<HTMLQuoteElement>('blockquote');
export const br = createElementFactory<HTMLBRElement>('br');
export const canvas = createElementFactory<HTMLCanvasElement>('canvas');
export const code = createElementFactory<HTMLElement>('code');
export const col = createElementFactory<HTMLTableColElement>('col');
export const colgroup = createElementFactory<HTMLTableColElement>('colgroup');
export const datalist = createElementFactory<HTMLDataListElement>('datalist');
export const dd = createElementFactory<HTMLDListElement>('dd');
export const del = createElementFactory<HTMLModElement>('del');
export const details = createElementFactory<HTMLDetailsElement>('details');
export const dfn = createElementFactory<HTMLElement>('dfn');
export const dialog = createElementFactory<HTMLDialogElement>('dialog');
export const dl = createElementFactory<HTMLDListElement>('dl');
export const dt = createElementFactory<HTMLElement>('dt');
export const em = createElementFactory<HTMLElement>('em');
export const embed = createElementFactory<HTMLEmbedElement>('embed');
export const fieldset = createElementFactory<HTMLFieldSetElement>('fieldset');
export const figcaption = createElementFactory<HTMLElement>('figcaption');
export const figure = createElementFactory<HTMLElement>('figure');
export const hr = createElementFactory<HTMLElement>('hr');
export const i = createElementFactory<HTMLElement>('i');
export const iframe = createElementFactory<HTMLIFrameElement>('iframe');
export const ins = createElementFactory<HTMLElement>('ins');
export const kbd = createElementFactory<HTMLElement>('kbd');
export const legend = createElementFactory<HTMLElement>('legend');
export const map = createElementFactory<HTMLElement>('map');
export const mark = createElementFactory<HTMLElement>('mark');
export const meter = createElementFactory<HTMLMeterElement>('meter');
export const noscript = createElementFactory<HTMLElement>('noscript');
export const object = createElementFactory<HTMLElement>('object');
export const optgroup = createElementFactory<HTMLOptGroupElement>('optgroup');
export const output = createElementFactory<HTMLElement>('output');
export const picture = createElementFactory<HTMLElement>('picture');
export const pre = createElementFactory<HTMLElement>('pre');
export const progress = createElementFactory<HTMLElement>('progress');
export const q = createElementFactory<HTMLElement>('q');
export const ruby = createElementFactory<HTMLElement>('ruby');
export const s = createElementFactory<HTMLElement>('s');
export const samp = createElementFactory<HTMLElement>('samp');
export const script = createElementFactory<HTMLElement>('script');
export const small = createElementFactory<HTMLElement>('small');
export const source = createElementFactory<HTMLElement>('source');
export const strong = createElementFactory<HTMLElement>('strong');
export const style = createElementFactory<HTMLElement>('style');
export const sub = createElementFactory<HTMLElement>('sub');
export const summary = createElementFactory<HTMLElement>('summary');
export const sup = createElementFactory<HTMLElement>('sup');
export const svg = createElementFactory<HTMLElement>('svg');
export const tbody = createElementFactory<HTMLElement>('tbody');
export const template = createElementFactory<HTMLElement>('template');
export const tfoot = createElementFactory<HTMLElement>('tfoot');
export const thead = createElementFactory<HTMLTableSectionElement>('thead');
export const time = createElementFactory<HTMLElement>('time');
export const track = createElementFactory<HTMLElement>('track');
export const u = createElementFactory<HTMLElement>('u');
export const var_ = createElementFactory<HTMLElement>('var');
export const video = createElementFactory<HTMLElement>('video');
export const wbr = createElementFactory<HTMLBRElement>('wbr');