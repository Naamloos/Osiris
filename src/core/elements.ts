// HTML element factory functions
import { $ } from "./dom";
import { Props } from "../types/Props";

// Type representing any children that can be passed to elements
type Child = HTMLElement | string | Props;

// Helper type for element creation functions
type ElementFunction = (...children: Child[]) => HTMLElement;

// Function to create element factories
function createElementFactory(tagName: string): ElementFunction {
    return (...children: Child[]) => {
        // If first argument is props object (not a string or HTMLElement)
        if (children.length > 0 && typeof children[0] !== 'string' && !(children[0] instanceof HTMLElement)) {
            return $(tagName, children[0], ...children.slice(1));
        } else {
            // First argument is a child, not props
            return $(tagName, ...children.filter(Boolean) as Child[]);
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
export const aside = createElementFactory('aside');
export const audio = createElementFactory('audio');
export const b = createElementFactory('b');
export const blockquote = createElementFactory('blockquote');
export const br = createElementFactory('br');
export const canvas = createElementFactory('canvas');
export const code = createElementFactory('code');
export const col = createElementFactory('col');
export const colgroup = createElementFactory('colgroup');
export const datalist = createElementFactory('datalist');
export const dd = createElementFactory('dd');
export const del = createElementFactory('del');
export const details = createElementFactory('details');
export const dfn = createElementFactory('dfn');
export const dialog = createElementFactory('dialog');
export const dl = createElementFactory('dl');
export const dt = createElementFactory('dt');
export const em = createElementFactory('em');
export const embed = createElementFactory('embed');
export const fieldset = createElementFactory('fieldset');
export const figcaption = createElementFactory('figcaption');
export const figure = createElementFactory('figure');
export const hr = createElementFactory('hr');
export const i = createElementFactory('i');
export const iframe = createElementFactory('iframe');
export const ins = createElementFactory('ins');
export const kbd = createElementFactory('kbd');
export const legend = createElementFactory('legend');
export const map = createElementFactory('map');
export const mark = createElementFactory('mark');
export const meter = createElementFactory('meter');
export const noscript = createElementFactory('noscript');
export const object = createElementFactory('object');
export const optgroup = createElementFactory('optgroup');
export const output = createElementFactory('output');
export const picture = createElementFactory('picture');
export const pre = createElementFactory('pre');
export const progress = createElementFactory('progress');
export const q = createElementFactory('q');
export const ruby = createElementFactory('ruby');
export const s = createElementFactory('s');
export const samp = createElementFactory('samp');
export const script = createElementFactory('script');
export const small = createElementFactory('small');
export const source = createElementFactory('source');
export const strong = createElementFactory('strong');
export const style = createElementFactory('style');
export const sub = createElementFactory('sub');
export const summary = createElementFactory('summary');
export const sup = createElementFactory('sup');
export const svg = createElementFactory('svg');
export const tbody = createElementFactory('tbody');
export const template = createElementFactory('template');
export const tfoot = createElementFactory('tfoot');
export const thead = createElementFactory('thead');
export const time = createElementFactory('time');
export const track = createElementFactory('track');
export const u = createElementFactory('u');
export const var_ = createElementFactory('var');
export const video = createElementFactory('video');
export const wbr = createElementFactory('wbr');