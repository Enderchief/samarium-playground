import {
  getHighlighter,
  type ILanguageRegistration,
  type Highlighter,
  setCDN,
  setWasm,
} from "shiki";

setCDN("https://unpkg.com/shiki");

import grammar from "./samarium.tmLanguage.json";

export let theme: string = "github-dark";
export function setTheme(t: string) {
  theme = t;
}

export const sm = {
  id: "samarium",
  scopeName: "source.samarium",
  grammar: grammar as unknown,
} as ILanguageRegistration;

const cache: Record<string, Highlighter> = {};

export function getTheme(t: string) {
  return cache[t];
}
export async function loadTheme(t: string) {
  cache[t] = await getHighlighter({ theme: t, langs: [sm] });
}

export async function highlight(elem: HTMLElement) {
  if (theme in cache) {
    elem.textContent = elem.textContent;
    elem.innerHTML = getTheme(theme).codeToHtml(elem.textContent!, {
      lang: "samarium",
    });
  } else {
    const hl = await loadTheme(theme).then(() => getTheme(theme));
    elem.textContent = elem.textContent;
    elem.textContent = elem.textContent;
    elem.innerHTML = hl.codeToHtml(elem.textContent!, { lang: "samarium" });
  }
}
