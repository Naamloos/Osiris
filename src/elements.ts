import { $ } from './renderer';
import { VNodeFactory } from './types';

/**
 * Creates a factory function for HTML elements
 * @param tagName The HTML tag name
 * @returns A factory function that creates VNodes for the specified tag
 */
function createVNodeFactory<T>(tagName: string): VNodeFactory<T> {
    return (...children) => $(tagName, ...children);
}

// Document structure elements
export const html = createVNodeFactory<HTMLHtmlElement>('html');
export const head = createVNodeFactory<HTMLHeadElement>('head');
export const body = createVNodeFactory<HTMLBodyElement>('body');

// Content sectioning
export const header = createVNodeFactory<HTMLElement>('header');
export const nav = createVNodeFactory<HTMLElement>('nav');
export const main = createVNodeFactory<HTMLElement>('main');
export const section = createVNodeFactory<HTMLElement>('section');
export const article = createVNodeFactory<HTMLElement>('article');
export const aside = createVNodeFactory<HTMLElement>('aside');
export const footer = createVNodeFactory<HTMLElement>('footer');

// Text content
export const div = createVNodeFactory<HTMLDivElement>('div');
export const span = createVNodeFactory<HTMLSpanElement>('span');
export const p = createVNodeFactory<HTMLParagraphElement>('p');
export const blockquote = createVNodeFactory<HTMLQuoteElement>('blockquote');
export const pre = createVNodeFactory<HTMLPreElement>('pre');

// Headings
export const h1 = createVNodeFactory<HTMLHeadingElement>('h1');
export const h2 = createVNodeFactory<HTMLHeadingElement>('h2');
export const h3 = createVNodeFactory<HTMLHeadingElement>('h3');
export const h4 = createVNodeFactory<HTMLHeadingElement>('h4');
export const h5 = createVNodeFactory<HTMLHeadingElement>('h5');
export const h6 = createVNodeFactory<HTMLHeadingElement>('h6');

// Lists
export const ul = createVNodeFactory<HTMLUListElement>('ul');
export const ol = createVNodeFactory<HTMLOListElement>('ol');
export const li = createVNodeFactory<HTMLLIElement>('li');
export const dl = createVNodeFactory<HTMLDListElement>('dl');
export const dt = createVNodeFactory<HTMLElement>('dt');
export const dd = createVNodeFactory<HTMLElement>('dd');

// Inline text semantics
export const a = createVNodeFactory<HTMLAnchorElement>('a');
export const strong = createVNodeFactory<HTMLElement>('strong');
export const em = createVNodeFactory<HTMLElement>('em');
export const b = createVNodeFactory<HTMLElement>('b');
export const i = createVNodeFactory<HTMLElement>('i');
export const u = createVNodeFactory<HTMLElement>('u');
export const small = createVNodeFactory<HTMLElement>('small');
export const mark = createVNodeFactory<HTMLElement>('mark');
export const del = createVNodeFactory<HTMLModElement>('del');
export const ins = createVNodeFactory<HTMLModElement>('ins');
export const sub = createVNodeFactory<HTMLElement>('sub');
export const sup = createVNodeFactory<HTMLElement>('sup');
export const code = createVNodeFactory<HTMLElement>('code');
export const kbd = createVNodeFactory<HTMLElement>('kbd');
export const samp = createVNodeFactory<HTMLElement>('samp');
export const var_ = createVNodeFactory<HTMLElement>('var');
export const time = createVNodeFactory<HTMLTimeElement>('time');

// Forms
export const form = createVNodeFactory<HTMLFormElement>('form');
export const input = createVNodeFactory<HTMLInputElement>('input');
export const textarea = createVNodeFactory<HTMLTextAreaElement>('textarea');
export const button = createVNodeFactory<HTMLButtonElement>('button');
export const select = createVNodeFactory<HTMLSelectElement>('select');
export const option = createVNodeFactory<HTMLOptionElement>('option');
export const optgroup = createVNodeFactory<HTMLOptGroupElement>('optgroup');
export const label = createVNodeFactory<HTMLLabelElement>('label');
export const fieldset = createVNodeFactory<HTMLFieldSetElement>('fieldset');
export const legend = createVNodeFactory<HTMLLegendElement>('legend');
export const datalist = createVNodeFactory<HTMLDataListElement>('datalist');
export const output = createVNodeFactory<HTMLOutputElement>('output');
export const progress = createVNodeFactory<HTMLProgressElement>('progress');
export const meter = createVNodeFactory<HTMLMeterElement>('meter');

// Tables
export const table = createVNodeFactory<HTMLTableElement>('table');
export const thead = createVNodeFactory<HTMLTableSectionElement>('thead');
export const tbody = createVNodeFactory<HTMLTableSectionElement>('tbody');
export const tfoot = createVNodeFactory<HTMLTableSectionElement>('tfoot');
export const tr = createVNodeFactory<HTMLTableRowElement>('tr');
export const th = createVNodeFactory<HTMLTableHeaderCellElement>('th');
export const td = createVNodeFactory<HTMLTableCellElement>('td');
export const col = createVNodeFactory<HTMLTableColElement>('col');
export const colgroup = createVNodeFactory<HTMLTableColElement>('colgroup');

// Media
export const img = createVNodeFactory<HTMLImageElement>('img');
export const audio = createVNodeFactory<HTMLAudioElement>('audio');
export const video = createVNodeFactory<HTMLVideoElement>('video');
export const source = createVNodeFactory<HTMLSourceElement>('source');
export const track = createVNodeFactory<HTMLTrackElement>('track');
export const canvas = createVNodeFactory<HTMLCanvasElement>('canvas');
export const svg = createVNodeFactory<SVGSVGElement>('svg');

// Interactive elements
export const details = createVNodeFactory<HTMLDetailsElement>('details');
export const summary = createVNodeFactory<HTMLElement>('summary');
export const dialog = createVNodeFactory<HTMLDialogElement>('dialog');

// Other elements
export const br = createVNodeFactory<HTMLBRElement>('br');
export const hr = createVNodeFactory<HTMLHRElement>('hr');
export const wbr = createVNodeFactory<HTMLElement>('wbr');
export const embed = createVNodeFactory<HTMLEmbedElement>('embed');
export const object = createVNodeFactory<HTMLObjectElement>('object');
export const iframe = createVNodeFactory<HTMLIFrameElement>('iframe');
export const noscript = createVNodeFactory<HTMLElement>('noscript');
export const script = createVNodeFactory<HTMLScriptElement>('script');
export const style = createVNodeFactory<HTMLStyleElement>('style');
export const template = createVNodeFactory<HTMLTemplateElement>('template');

// Additional semantic elements
export const figure = createVNodeFactory<HTMLElement>('figure');
export const figcaption = createVNodeFactory<HTMLElement>('figcaption');
export const picture = createVNodeFactory<HTMLPictureElement>('picture');
export const map = createVNodeFactory<HTMLMapElement>('map');
export const area = createVNodeFactory<HTMLAreaElement>('area');
export const ruby = createVNodeFactory<HTMLElement>('ruby');
export const q = createVNodeFactory<HTMLQuoteElement>('q');
export const dfn = createVNodeFactory<HTMLElement>('dfn');