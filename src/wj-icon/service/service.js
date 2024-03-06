import { fileURLToPath } from "url";
import path from "path";
export const iconContent = new Map();
const requests = new Map();

let parser;

export const getSrc = (src) => {
  if (isStr(src)) {
    src = src.trim();
    if (isSrc(src)) {
      return src;
    }
  }
  return null;
};

export const isSrc = (str) => str.length > 0 && /(\/|\.)/.test(str);

export const isSvgDataUrl = (url) => url.startsWith('data:image/svg+xml');

export const isEncodedDataUrl = (url) => url.indexOf(';utf8,') !== -1;

export const isStr = (val) => typeof val === 'string';

export const validateContent = (svgContent) => {
  const div = document.createElement('div');
  div.innerHTML = svgContent;

  const svgElm = div.firstElementChild;
  if (svgElm && svgElm.nodeName.toLowerCase() === 'svg') {
    const svgClass = svgElm.getAttribute('class') || '';

    if (isValid(svgElm)) {
      return div.innerHTML;
    }
  }
  return '';
};

export const isValid = (elm) => {
  if (elm.nodeType === 1) {
    if (elm.nodeName.toLowerCase() === 'script') {
      return false;
    }

    for (let i = 0; i < elm.attributes.length; i++) {
      const name = elm.attributes[i].name;
      if (isStr(name) && name.toLowerCase().indexOf('on') === 0) {
        return false;
      }
    }

    for (let i = 0; i < elm.childNodes.length; i++) {
      if (!isValid(elm.childNodes[i])) {
        return false;
      }
    }
  }
  return true;
};

export const getSvgContent = (url, sanitize) => {
  let req = requests.get(url);
  if (!req) {
    if (typeof fetch !== 'undefined' && typeof document !== 'undefined') {
      if (isSvgDataUrl(url) && isEncodedDataUrl(url)) {
        if (!parser) {
          parser = new DOMParser();
        }
        const doc = parser.parseFromString(url, 'text/html');
        const svg = doc.querySelector('svg');
        if (svg) {
          iconContent.set(url, svg.outerHTML);
        }
        return Promise.resolve();
      } else {
        req = fetch(url).then((rsp) => {
          if (rsp.ok) {
            return rsp.text().then((svgContent) => {
              if (svgContent && sanitize !== false) {
                svgContent = validateContent(svgContent);
              }
              iconContent.set(url, svgContent || '');
            });
          }
          iconContent.set(url, '');
        });
        requests.set(url, req);
      }
    } else {
      iconContent.set(url, '');
      return Promise.resolve();
    }
  }
  return req;
};

export const getUrl = (i) => {
  let url = getSrc(i.src);
  if (url) {
    return url;
  }

  url = getName(i.name);

  if (url) {
    return getNamedUrl(url);
  }

  return null;
};

export function getName(iconName){

  if (!isStr(iconName) || iconName.trim() === '') {
    return null;
  }

  const invalidChars = iconName.replace(/[a-z]|-|\d/gi, '');
  if (invalidChars !== '') {
    return null;
  }

  return iconName;
};

// const getNamedUrl = (iconName) => {
//   const iconUrl = `assets/img/icons/svg/${iconName}.svg`;
//   console.log("SOM:", iconUrl);
//   const url = new URL(iconUrl, import.meta.url);
//   console.log(url)
//   return url.href;
// };
/*
static get importPath() {
  return import.meta.url
}
*/
export function getNamedUrl(iconName) {
	console.log("Current directory:", process.cwd());
	const __dirname = process.cwd();

  const path = `http://localhost:4201/assets/img/icons/svg/${iconName}.svg`

 //let parsedUrl = new URL(import.meta.url);
  let pathName = __dirname;
  //https://github.com/webpack/webpack/issues/6719
   // const cssText =  fetch(new URL('fancy-button.css', import.meta.url)).then(r => r.text());
        //const rawMarkup =  fetch(new URL('fancy-button.html', import.meta.url)).then(r => r.text());

  // Remove the file name from the path to get the directory
  let folderPath = pathName.substring(0, pathName.lastIndexOf('/'));
let testPath = __dirname + folderPath + path;
let testPath2 = path;
console.log("testPath_updated:"+testPath2);
  return new URL(path).href;
}