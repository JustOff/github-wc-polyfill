/*
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.

 GitHub Web Components Polyfill Add-on
 Copyright (c) 2020 JustOff. All rights reserved.

 Element.prototype.toggleAttribute and Array.prototype.flat polyfills
 Copyright (c) 2005-2020 Mozilla and individual contributors.
 https://developer.mozilla.org/docs/Web/API/Element/toggleAttribute
 https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/flat

 Array.prototype.flatMap polyfill
 Copyright (c) 2017 Aluan Haddad.
 https://github.com/aluanhaddad/flat-map

 PerformanceObserver polyfill
 Copyright (c) 2020 Fastly, Inc.
 https://github.com/fastly/performance-observer-polyfill

 Promise.any polyfill
 Copyright (c) 2019, Andrea Giammarchi, @WebReflection
 https://github.com/ungap/promise-any

 Custom Elements polyfill
 Copyright (c) 2020 The Polymer Project Authors. All rights reserved.
 https://github.com/webcomponents/polyfills
*/

"use strict";

var Cc = Components.classes, Ci = Components.interfaces, Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

const isSeaMonkey = Services.appinfo.name == "SeaMonkey";

const pfSeaMonkey = `(function(){
if (!Element.prototype.toggleAttribute) {
  Element.prototype.toggleAttribute = function(name, force) {
    if(force !== void 0) force = !!force 
    
    if (this.hasAttribute(name)) {
      if (force) return true;

      this.removeAttribute(name);
      return false;
    }
    if (force === false) return false;
      
    this.setAttribute(name, "");
    return true;
  };
}
function flattenIntoArray(target, source, start, depth, mapperFunction, thisArg) {
  const mapperFunctionProvied = mapperFunction !== undefined;
  let targetIndex = start;
  let sourceIndex = 0;
  const sourceLen = source.length;
  while (sourceIndex < sourceLen) {
    const p = sourceIndex;
    const exists = !!source[p];
    if (exists === true) {
      let element = source[p];
      if (element) {
        if (mapperFunctionProvied) {
          element = mapperFunction.call(thisArg, element, sourceIndex, target);
        }
        const spreadable = Object.getOwnPropertySymbols(element).includes(Symbol.isConcatSpreadable) || Array.isArray(element);
        if (spreadable === true && depth > 0) {
          const nextIndex = flattenIntoArray(target, element, targetIndex, depth - 1);
          targetIndex = nextIndex;
        } else {
          if (!Number.isSafeInteger(targetIndex)) {
            throw TypeError();
          }
          target[targetIndex] = element;
        }
      }
    }
    targetIndex += 1;
    sourceIndex += 1;
  }
  return targetIndex;
}
function arraySpeciesCreate(originalArray, length) {
  const isArray = Array.isArray(originalArray);
  if (!isArray) {
    return Array(length);
  }
  let C = Object.getPrototypeOf(originalArray).constructor;
  if (C) {
    if (typeof C === 'object' || typeof C === 'function') {
      C = C[Symbol.species.toString()];
      C = C !== null ? C : undefined;
    }
    if (C === undefined) {
      return Array(length);
    }
    if (typeof C !== 'function') {
      throw TypeError('invalid constructor');
    }
    const result = new C(length);
    return result;
  }
}
if (!Object.prototype.hasOwnProperty.call(Array.prototype, 'flatMap')) {
  Array.prototype.flatMap = function flatMap(callbackFn, thisArg) {
    const o = Object(this);
    if (!callbackFn || typeof callbackFn.call !== 'function') {
      throw TypeError('callbackFn must be callable.');
    }
    const t = thisArg !== undefined ? thisArg : undefined;
    const a = arraySpeciesCreate(o, o.length);
    flattenIntoArray(a, o, 0, 1, callbackFn, t);
    return a.filter(x => x !== undefined, a);
  };
}
if (!Array.prototype.flat) {
  Array.prototype.flat = function() {
    var depth = arguments[0];
    depth = depth === undefined ? 1 : Math.floor(depth);
    if (depth < 1) return Array.prototype.slice.call(this);
    return (function flat(arr, depth) {
      var len = arr.length >>> 0;
      var flattened = [];
      var i = 0;
      while (i < len) {
        if (i in arr) {
          var el = arr[i];
          if (Array.isArray(el) && depth > 0)
            flattened = flattened.concat(flat(el, depth - 1));
          else flattened.push(el);
        }
        i++;
      }
      return flattened;
    })(this, depth);
  };
}
}).call(this);`;
const hashSeaMonkey = "'sha256-e4RJ1+xAp4xhtpaeSLNr50yP+/R80IwoR3JYjsq58MY='";
const pfBase = `typeof queueMicrotask !== 'function' && (queueMicrotask = function(f) {setTimeout(f, 0)});(function(){return function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=0)}([function(e,t,r){"use strict";function n(e){return(n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function o(e){return function(e){if(Array.isArray(e)){for(var t=0,r=new Array(e.length);t<e.length;t++)r[t]=e[t];return r}}(e)||function(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}()}function i(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function u(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function s(e){var t="function"==typeof Map?new Map:void 0;return(s=function(e){if(null===e||(r=e,-1===Function.toString.call(r).indexOf("[native code]")))return e;var r;if("function"!=typeof e)throw new TypeError("Super expression must either be null or a function");if(void 0!==t){if(t.has(e))return t.get(e);t.set(e,n)}function n(){return c(e,arguments,f(this).constructor)}return n.prototype=Object.create(e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),a(n,e)})(e)}function c(e,t,r){return(c=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}()?Reflect.construct:function(e,t,r){var n=[null];n.push.apply(n,t);var o=new(Function.bind.apply(e,n));return r&&a(o,r.prototype),o}).apply(null,arguments)}function a(e,t){return(a=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function f(e){return(f=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}r.r(t);var l=function(e){function t(e){var r,i,s,c,a;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),i=function(e,t){return!t||"object"!==n(t)&&"function"!=typeof t?u(e):t}(this,(r=f(t)).call.apply(r,[this].concat(o(e)))),s=u(i),a=void 0,(c="_entries")in s?Object.defineProperty(s,c,{value:a,enumerable:!0,configurable:!0,writable:!0}):s[c]=a,i._entries=e,i}var r,s,c;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&a(e,t)}(t,e),r=t,(s=[{key:"getEntries",value:function(){return this._entries}},{key:"getEntriesByType",value:function(e){return this._entries.filter((function(t){return t.entryType===e}))}},{key:"getEntriesByName",value:function(e,t){return this._entries.filter((function(t){return t.name===e})).filter((function(e){return!t||e.entryType===t}))}}])&&i(r.prototype,s),c&&i(r,c),t}(s(Array));function y(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function p(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function v(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function b(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}var d=["mark","measure","navigation","resource"],h="Failed to execute 'observe' on 'PerformanceObserver': either an 'entryTypes' or 'type' member must be present.",m="Failed to execute 'observe' on 'PerformanceObserver': either an 'entryTypes' or 'type' member must be present, not both.",g="Aborting 'observe' on 'PerformanceObserver': no valid entry types present in either 'entryTypes' or 'type' member.",O="Invalid or unsupported entry types provided to 'observe' on 'PerformanceObserver'.",w=function(e){return d.some((function(t){return e===t}))},P=new(function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},r=t.registeredObservers,n=void 0===r?new Set:r,o=t.processedEntries,i=void 0===o?new Set:o,u=t.interval,s=void 0===u?100:u,c=t.context,a=void 0===c?self:c;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),p(this,"registeredObservers",void 0),p(this,"processedEntries",void 0),p(this,"interval",void 0),p(this,"intervalId",void 0),p(this,"context",void 0),this.registeredObservers=n,this.processedEntries=i,this.interval=s,this.context=a,this.intervalId=null}var t,r,n;return t=e,(r=[{key:"getNewEntries",value:function(){var e=this;return this.context.performance.getEntries().filter((function(t){return!e.processedEntries.has(t)}))}},{key:"getObserversForType",value:function(e,t){return Array.from(e).filter((function(e){return e.entryTypes.some((function(e){return e===t}))}))}},{key:"processBuffer",value:function(e){var t=Array.from(e.buffer),r=new l(t);e.buffer.clear(),t.length&&e.callback&&e.callback.call(void 0,r,e)}},{key:"processEntries",value:function(){var e=this;this.getNewEntries().forEach((function(t){var r=t.entryType;e.getObserversForType(e.registeredObservers,r).forEach((function(e){e.buffer.add(t)})),e.processedEntries.add(t)}));var t=function(){return e.registeredObservers.forEach(e.processBuffer)};"requestAnimationFrame"in this.context?this.context.requestAnimationFrame(t):this.context.setTimeout(t,0)}},{key:"add",value:function(e){this.registeredObservers.add(e),1===this.registeredObservers.size&&this.observe()}},{key:"remove",value:function(e){this.registeredObservers.delete(e),this.registeredObservers.size||this.disconnect()}},{key:"observe",value:function(){this.intervalId=this.context.setInterval(this.processEntries.bind(this),this.interval)}},{key:"disconnect",value:function(){this.intervalId=this.context.clearInterval(this.intervalId)}}])&&y(t.prototype,r),n&&y(t,n),e}()),k=function(){function e(t){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:P;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),b(this,"callback",void 0),b(this,"buffer",void 0),b(this,"entryTypes",[]),b(this,"taskQueue",void 0),this.callback=t,this.buffer=new Set,this.taskQueue=r}var t,r,n;return t=e,(r=[{key:"observe",value:function(e){if(!e)throw new Error(h);if(e.entryTypes&&e.type)throw new Error(m);var t;if(e.entryTypes)t=e.entryTypes;else{if(!e.type)throw new Error(h);t=[e.type]}var r=t.filter(w);r.length>0&&r.length!==t.length&&console.warn(O),r.length?(this.entryTypes=r,this.taskQueue.add(this)):console.warn(g)}},{key:"disconnect",value:function(){this.taskQueue.remove(this)}},{key:"takeRecords",value:function(){var e=Array.from(this.buffer);return new l(e)}}])&&v(t.prototype,r),n&&v(t,n),e}();b(k,"supportedEntryTypes",d);var E="PerformanceObserver"in self&&"function"==typeof PerformanceObserver?PerformanceObserver:k,j=self;j.PerformanceObserver||(j.PerformanceObserver=E)}])}).call(this);(function(){if(Element.prototype.replaceChildren===undefined){Element.prototype.replaceChildren=function(...nodesOrDOMStrings){while(this.lastChild){this.removeChild(this.lastChild)}if(nodesOrDOMStrings.length){this.append(...nodesOrDOMStrings)}}}}());if(!('any' in Promise && typeof Promise.any == 'function'))Promise.any = function($) {return new Promise(function (D, E, A, L) {A = []; L = $.map(function ($, i) {return Promise.resolve($).then(D, function (O) {return ((A[i] = O), --L) || E({errors: A});});}).length;});}`;
const hashBase = "'sha256-Y97hZdvuJztaJyvPJfwpU8LImTg64KGz8oN2jC/bVMY='";
const customElements = `(function(){var n=window.Document.prototype.createElement,p=window.Document.prototype.createElementNS,aa=window.Document.prototype.importNode,ba=window.Document.prototype.prepend,ca=window.Document.prototype.append,da=window.DocumentFragment.prototype.prepend,ea=window.DocumentFragment.prototype.append,q=window.Node.prototype.cloneNode,r=window.Node.prototype.appendChild,t=window.Node.prototype.insertBefore,u=window.Node.prototype.removeChild,v=window.Node.prototype.replaceChild,w=Object.getOwnPropertyDescriptor(window.Node.prototype,
"textContent"),y=window.Element.prototype.attachShadow,z=Object.getOwnPropertyDescriptor(window.Element.prototype,"innerHTML"),A=window.Element.prototype.getAttribute,B=window.Element.prototype.setAttribute,C=window.Element.prototype.removeAttribute,D=window.Element.prototype.getAttributeNS,E=window.Element.prototype.setAttributeNS,F=window.Element.prototype.removeAttributeNS,G=window.Element.prototype.insertAdjacentElement,H=window.Element.prototype.insertAdjacentHTML,fa=window.Element.prototype.prepend,
ha=window.Element.prototype.append,ia=window.Element.prototype.before,ja=window.Element.prototype.after,ka=window.Element.prototype.replaceWith,la=window.Element.prototype.remove,ma=window.HTMLElement,I=Object.getOwnPropertyDescriptor(window.HTMLElement.prototype,"innerHTML"),na=window.HTMLElement.prototype.insertAdjacentElement,oa=window.HTMLElement.prototype.insertAdjacentHTML;var pa=new Set;"annotation-xml color-profile font-face font-face-src font-face-uri font-face-format font-face-name missing-glyph".split(" ").forEach(function(a){return pa.add(a)});function qa(a){var b=pa.has(a);a=/^[a-z][.0-9_a-z]*-[-.0-9_a-z]*$/.test(a);return!b&&a}var ra=document.contains?document.contains.bind(document):document.documentElement.contains.bind(document.documentElement);
function J(a){var b=a.isConnected;if(void 0!==b)return b;if(ra(a))return!0;for(;a&&!(a.__CE_isImportDocument||a instanceof Document);)a=a.parentNode||(window.ShadowRoot&&a instanceof ShadowRoot?a.host:void 0);return!(!a||!(a.__CE_isImportDocument||a instanceof Document))}function K(a){var b=a.children;if(b)return Array.prototype.slice.call(b);b=[];for(a=a.firstChild;a;a=a.nextSibling)a.nodeType===Node.ELEMENT_NODE&&b.push(a);return b}
function L(a,b){for(;b&&b!==a&&!b.nextSibling;)b=b.parentNode;return b&&b!==a?b.nextSibling:null}
function M(a,b,c){for(var f=a;f;){if(f.nodeType===Node.ELEMENT_NODE){var d=f;b(d);var e=d.localName;if("link"===e&&"import"===d.getAttribute("rel")){f=d.import;void 0===c&&(c=new Set);if(f instanceof Node&&!c.has(f))for(c.add(f),f=f.firstChild;f;f=f.nextSibling)M(f,b,c);f=L(a,d);continue}else if("template"===e){f=L(a,d);continue}if(d=d.__CE_shadowRoot)for(d=d.firstChild;d;d=d.nextSibling)M(d,b,c)}f=f.firstChild?f.firstChild:L(a,f)}};function N(){var a=!(null===O||void 0===O||!O.noDocumentConstructionObserver),b=!(null===O||void 0===O||!O.shadyDomFastWalk);this.h=[];this.a=[];this.f=!1;this.shadyDomFastWalk=b;this.C=!a}function P(a,b,c,f){var d=window.ShadyDom;if(a.shadyDomFastWalk&&d&&d.inUse){if(b.nodeType===Node.ELEMENT_NODE&&c(b),b.querySelectorAll)for(a=d.nativeMethods.querySelectorAll.call(b,"*"),b=0;b<a.length;b++)c(a[b])}else M(b,c,f)}function sa(a,b){a.f=!0;a.h.push(b)}function ta(a,b){a.f=!0;a.a.push(b)}
function Q(a,b){a.f&&P(a,b,function(c){return R(a,c)})}function R(a,b){if(a.f&&!b.__CE_patched){b.__CE_patched=!0;for(var c=0;c<a.h.length;c++)a.h[c](b);for(c=0;c<a.a.length;c++)a.a[c](b)}}function S(a,b){var c=[];P(a,b,function(d){return c.push(d)});for(b=0;b<c.length;b++){var f=c[b];1===f.__CE_state?a.connectedCallback(f):T(a,f)}}function U(a,b){var c=[];P(a,b,function(d){return c.push(d)});for(b=0;b<c.length;b++){var f=c[b];1===f.__CE_state&&a.disconnectedCallback(f)}}
function V(a,b,c){c=void 0===c?{}:c;var f=c.D,d=c.upgrade||function(g){return T(a,g)},e=[];P(a,b,function(g){a.f&&R(a,g);if("link"===g.localName&&"import"===g.getAttribute("rel")){var h=g.import;h instanceof Node&&(h.__CE_isImportDocument=!0,h.__CE_registry=document.__CE_registry);h&&"complete"===h.readyState?h.__CE_documentLoadHandled=!0:g.addEventListener("load",function(){var k=g.import;if(!k.__CE_documentLoadHandled){k.__CE_documentLoadHandled=!0;var l=new Set;f&&(f.forEach(function(m){return l.add(m)}),
l.delete(k));V(a,k,{D:l,upgrade:d})}})}else e.push(g)},f);for(b=0;b<e.length;b++)d(e[b])}
function T(a,b){try{var c=b.ownerDocument,f=c.__CE_registry;var d=f&&(c.defaultView||c.__CE_isImportDocument)?W(f,b.localName):void 0;if(d&&void 0===b.__CE_state){d.constructionStack.push(b);try{try{if(new d.constructorFunction!==b)throw Error("The custom element constructor did not produce the element being upgraded.");}finally{d.constructionStack.pop()}}catch(k){throw b.__CE_state=2,k;}b.__CE_state=1;b.__CE_definition=d;if(d.attributeChangedCallback&&b.hasAttributes()){var e=d.observedAttributes;
for(d=0;d<e.length;d++){var g=e[d],h=b.getAttribute(g);null!==h&&a.attributeChangedCallback(b,g,null,h,null)}}J(b)&&a.connectedCallback(b)}}catch(k){X(k)}}N.prototype.connectedCallback=function(a){var b=a.__CE_definition;if(b.connectedCallback)try{b.connectedCallback.call(a)}catch(c){X(c)}};N.prototype.disconnectedCallback=function(a){var b=a.__CE_definition;if(b.disconnectedCallback)try{b.disconnectedCallback.call(a)}catch(c){X(c)}};
N.prototype.attributeChangedCallback=function(a,b,c,f,d){var e=a.__CE_definition;if(e.attributeChangedCallback&&-1<e.observedAttributes.indexOf(b))try{e.attributeChangedCallback.call(a,b,c,f,d)}catch(g){X(g)}};
function ua(a,b,c,f){var d=b.__CE_registry;if(d&&(null===f||"http://www.w3.org/1999/xhtml"===f)&&(d=W(d,c)))try{var e=new d.constructorFunction;if(void 0===e.__CE_state||void 0===e.__CE_definition)throw Error("Failed to construct '"+c+"': The returned value was not constructed with the HTMLElement constructor.");if("http://www.w3.org/1999/xhtml"!==e.namespaceURI)throw Error("Failed to construct '"+c+"': The constructed element's namespace must be the HTML namespace.");if(e.hasAttributes())throw Error("Failed to construct '"+
c+"': The constructed element must not have any attributes.");if(null!==e.firstChild)throw Error("Failed to construct '"+c+"': The constructed element must not have any children.");if(null!==e.parentNode)throw Error("Failed to construct '"+c+"': The constructed element must not have a parent node.");if(e.ownerDocument!==b)throw Error("Failed to construct '"+c+"': The constructed element's owner document is incorrect.");if(e.localName!==c)throw Error("Failed to construct '"+c+"': The constructed element's local name is incorrect.");
return e}catch(g){return X(g),b=null===f?n.call(b,c):p.call(b,f,c),Object.setPrototypeOf(b,HTMLUnknownElement.prototype),b.__CE_state=2,b.__CE_definition=void 0,R(a,b),b}b=null===f?n.call(b,c):p.call(b,f,c);R(a,b);return b}
function X(a){var b=a.message,c=a.sourceURL||a.fileName||"",f=a.line||a.lineNumber||0,d=a.column||a.columnNumber||0,e=void 0;void 0===ErrorEvent.prototype.initErrorEvent?e=new ErrorEvent("error",{cancelable:!0,message:b,filename:c,lineno:f,colno:d,error:a}):(e=document.createEvent("ErrorEvent"),e.initErrorEvent("error",!1,!0,b,c,f),e.preventDefault=function(){Object.defineProperty(this,"defaultPrevented",{configurable:!0,get:function(){return!0}})});void 0===e.error&&Object.defineProperty(e,"error",
{configurable:!0,enumerable:!0,get:function(){return a}});window.dispatchEvent(e);e.defaultPrevented||console.error(a)};function va(){var a=this;this.a=void 0;this.w=new Promise(function(b){a.g=b})}va.prototype.resolve=function(a){if(this.a)throw Error("Already resolved.");this.a=a;this.g(a)};function wa(a){var b=document;this.g=void 0;this.b=a;this.a=b;V(this.b,this.a);"loading"===this.a.readyState&&(this.g=new MutationObserver(this.A.bind(this)),this.g.observe(this.a,{childList:!0,subtree:!0}))}function xa(a){a.g&&a.g.disconnect()}wa.prototype.A=function(a){var b=this.a.readyState;"interactive"!==b&&"complete"!==b||xa(this);for(b=0;b<a.length;b++)for(var c=a[b].addedNodes,f=0;f<c.length;f++)V(this.b,c[f])};function Y(a){this.j=new Map;this.l=new Map;this.u=new Map;this.o=!1;this.s=new Map;this.i=function(b){return b()};this.c=!1;this.m=[];this.b=a;this.v=a.C?new wa(a):void 0}Y.prototype.B=function(a,b){var c=this;if(!(b instanceof Function))throw new TypeError("Custom element constructor getters must be functions.");ya(this,a);this.j.set(a,b);this.m.push(a);this.c||(this.c=!0,this.i(function(){return za(c)}))};
Y.prototype.define=function(a,b){var c=this;if(!(b instanceof Function))throw new TypeError("Custom element constructors must be functions.");ya(this,a);Aa(this,a,b);this.m.push(a);this.c||(this.c=!0,this.i(function(){return za(c)}))};function ya(a,b){if(!qa(b))throw new SyntaxError("The element name '"+b+"' is not valid.");if(W(a,b))throw Error("A custom element with name '"+(b+"' has already been defined."));if(a.o)throw Error("A custom element is already being defined.");}
function Aa(a,b,c){a.o=!0;var f;try{var d=c.prototype;if(!(d instanceof Object))throw new TypeError("The custom element constructor's prototype is not an object.");var e=function(m){var x=d[m];if(void 0!==x&&!(x instanceof Function))throw Error("The '"+m+"' callback must be a function.");return x};var g=e("connectedCallback");var h=e("disconnectedCallback");var k=e("adoptedCallback");var l=(f=e("attributeChangedCallback"))&&c.observedAttributes||[]}catch(m){throw m;}finally{a.o=!1}c={localName:b,
constructorFunction:c,connectedCallback:g,disconnectedCallback:h,adoptedCallback:k,attributeChangedCallback:f,observedAttributes:l,constructionStack:[]};a.l.set(b,c);a.u.set(c.constructorFunction,c);return c}Y.prototype.upgrade=function(a){V(this.b,a)};
function za(a){if(!1!==a.c){a.c=!1;for(var b=[],c=a.m,f=new Map,d=0;d<c.length;d++)f.set(c[d],[]);V(a.b,document,{upgrade:function(k){if(void 0===k.__CE_state){var l=k.localName,m=f.get(l);m?m.push(k):a.l.has(l)&&b.push(k)}}});for(d=0;d<b.length;d++)T(a.b,b[d]);for(d=0;d<c.length;d++){for(var e=c[d],g=f.get(e),h=0;h<g.length;h++)T(a.b,g[h]);(e=a.s.get(e))&&e.resolve(void 0)}c.length=0}}Y.prototype.get=function(a){if(a=W(this,a))return a.constructorFunction};
Y.prototype.whenDefined=function(a){if(!qa(a))return Promise.reject(new SyntaxError("'"+a+"' is not a valid custom element name."));var b=this.s.get(a);if(b)return b.w;b=new va;this.s.set(a,b);var c=this.l.has(a)||this.j.has(a);a=-1===this.m.indexOf(a);c&&a&&b.resolve(void 0);return b.w};Y.prototype.polyfillWrapFlushCallback=function(a){this.v&&xa(this.v);var b=this.i;this.i=function(c){return a(function(){return b(c)})}};
function W(a,b){var c=a.l.get(b);if(c)return c;if(c=a.j.get(b)){a.j.delete(b);try{return Aa(a,b,c())}catch(f){X(f)}}}window.CustomElementRegistry=Y;Y.prototype.define=Y.prototype.define;Y.prototype.upgrade=Y.prototype.upgrade;Y.prototype.get=Y.prototype.get;Y.prototype.whenDefined=Y.prototype.whenDefined;Y.prototype.polyfillDefineLazy=Y.prototype.B;Y.prototype.polyfillWrapFlushCallback=Y.prototype.polyfillWrapFlushCallback;function Z(a,b,c){function f(d){return function(e){for(var g=[],h=0;h<arguments.length;++h)g[h]=arguments[h];h=[];for(var k=[],l=0;l<g.length;l++){var m=g[l];m instanceof Element&&J(m)&&k.push(m);if(m instanceof DocumentFragment)for(m=m.firstChild;m;m=m.nextSibling)h.push(m);else h.push(m)}d.apply(this,g);for(g=0;g<k.length;g++)U(a,k[g]);if(J(this))for(g=0;g<h.length;g++)k=h[g],k instanceof Element&&S(a,k)}}void 0!==c.prepend&&(b.prepend=f(c.prepend));void 0!==c.append&&(b.append=f(c.append))};function Ba(a){Document.prototype.createElement=function(b){return ua(a,this,b,null)};Document.prototype.importNode=function(b,c){b=aa.call(this,b,!!c);this.__CE_registry?V(a,b):Q(a,b);return b};Document.prototype.createElementNS=function(b,c){return ua(a,this,c,b)};Z(a,Document.prototype,{prepend:ba,append:ca})};function Ca(a){function b(f){return function(d){for(var e=[],g=0;g<arguments.length;++g)e[g]=arguments[g];g=[];for(var h=[],k=0;k<e.length;k++){var l=e[k];l instanceof Element&&J(l)&&h.push(l);if(l instanceof DocumentFragment)for(l=l.firstChild;l;l=l.nextSibling)g.push(l);else g.push(l)}f.apply(this,e);for(e=0;e<h.length;e++)U(a,h[e]);if(J(this))for(e=0;e<g.length;e++)h=g[e],h instanceof Element&&S(a,h)}}var c=Element.prototype;void 0!==ia&&(c.before=b(ia));void 0!==ja&&(c.after=b(ja));void 0!==ka&&
(c.replaceWith=function(f){for(var d=[],e=0;e<arguments.length;++e)d[e]=arguments[e];e=[];for(var g=[],h=0;h<d.length;h++){var k=d[h];k instanceof Element&&J(k)&&g.push(k);if(k instanceof DocumentFragment)for(k=k.firstChild;k;k=k.nextSibling)e.push(k);else e.push(k)}h=J(this);ka.apply(this,d);for(d=0;d<g.length;d++)U(a,g[d]);if(h)for(U(a,this),d=0;d<e.length;d++)g=e[d],g instanceof Element&&S(a,g)});void 0!==la&&(c.remove=function(){var f=J(this);la.call(this);f&&U(a,this)})};function Da(a){function b(d,e){Object.defineProperty(d,"innerHTML",{enumerable:e.enumerable,configurable:!0,get:e.get,set:function(g){var h=this,k=void 0;J(this)&&(k=[],P(a,this,function(x){x!==h&&k.push(x)}));e.set.call(this,g);if(k)for(var l=0;l<k.length;l++){var m=k[l];1===m.__CE_state&&a.disconnectedCallback(m)}this.ownerDocument.__CE_registry?V(a,this):Q(a,this);return g}})}function c(d,e){d.insertAdjacentElement=function(g,h){var k=J(h);g=e.call(this,g,h);k&&U(a,h);J(g)&&S(a,h);return g}}function f(d,
e){function g(h,k){for(var l=[];h!==k;h=h.nextSibling)l.push(h);for(k=0;k<l.length;k++)V(a,l[k])}d.insertAdjacentHTML=function(h,k){h=h.toLowerCase();if("beforebegin"===h){var l=this.previousSibling;e.call(this,h,k);g(l||this.parentNode.firstChild,this)}else if("afterbegin"===h)l=this.firstChild,e.call(this,h,k),g(this.firstChild,l);else if("beforeend"===h)l=this.lastChild,e.call(this,h,k),g(l||this.firstChild,null);else if("afterend"===h)l=this.nextSibling,e.call(this,h,k),g(this.nextSibling,l);
else throw new SyntaxError("The value provided ("+String(h)+") is not one of 'beforebegin', 'afterbegin', 'beforeend', or 'afterend'.");}}y&&(Element.prototype.attachShadow=function(d){d=y.call(this,d);if(a.f&&!d.__CE_patched){d.__CE_patched=!0;for(var e=0;e<a.h.length;e++)a.h[e](d)}return this.__CE_shadowRoot=d});z&&z.get?b(Element.prototype,z):I&&I.get?b(HTMLElement.prototype,I):ta(a,function(d){b(d,{enumerable:!0,configurable:!0,get:function(){return q.call(this,!0).innerHTML},set:function(e){var g=
"template"===this.localName,h=g?this.content:this,k=p.call(document,this.namespaceURI,this.localName);for(k.innerHTML=e;0<h.childNodes.length;)u.call(h,h.childNodes[0]);for(e=g?k.content:k;0<e.childNodes.length;)r.call(h,e.childNodes[0])}})});Element.prototype.setAttribute=function(d,e){if(1!==this.__CE_state)return B.call(this,d,e);var g=A.call(this,d);B.call(this,d,e);e=A.call(this,d);a.attributeChangedCallback(this,d,g,e,null)};Element.prototype.setAttributeNS=function(d,e,g){if(1!==this.__CE_state)return E.call(this,
d,e,g);var h=D.call(this,d,e);E.call(this,d,e,g);g=D.call(this,d,e);a.attributeChangedCallback(this,e,h,g,d)};Element.prototype.removeAttribute=function(d){if(1!==this.__CE_state)return C.call(this,d);var e=A.call(this,d);C.call(this,d);null!==e&&a.attributeChangedCallback(this,d,e,null,null)};Element.prototype.removeAttributeNS=function(d,e){if(1!==this.__CE_state)return F.call(this,d,e);var g=D.call(this,d,e);F.call(this,d,e);var h=D.call(this,d,e);g!==h&&a.attributeChangedCallback(this,e,g,h,d)};
na?c(HTMLElement.prototype,na):G&&c(Element.prototype,G);oa?f(HTMLElement.prototype,oa):H&&f(Element.prototype,H);Z(a,Element.prototype,{prepend:fa,append:ha});Ca(a)};var Ea={};function Fa(a){function b(){var c=this.constructor;var f=document.__CE_registry.u.get(c);if(!f)throw Error("Failed to construct a custom element: The constructor was not registered with customElements.");var d=f.constructionStack;if(0===d.length)return d=n.call(document,f.localName),Object.setPrototypeOf(d,c.prototype),d.__CE_state=1,d.__CE_definition=f,R(a,d),d;var e=d.length-1,g=d[e];if(g===Ea)throw Error("Failed to construct '"+f.localName+"': This element was already constructed.");d[e]=Ea;
Object.setPrototypeOf(g,c.prototype);R(a,g);return g}b.prototype=ma.prototype;Object.defineProperty(HTMLElement.prototype,"constructor",{writable:!0,configurable:!0,enumerable:!1,value:b});window.HTMLElement=b};function Ga(a){function b(c,f){Object.defineProperty(c,"textContent",{enumerable:f.enumerable,configurable:!0,get:f.get,set:function(d){if(this.nodeType===Node.TEXT_NODE)f.set.call(this,d);else{var e=void 0;if(this.firstChild){var g=this.childNodes,h=g.length;if(0<h&&J(this)){e=Array(h);for(var k=0;k<h;k++)e[k]=g[k]}}f.set.call(this,d);if(e)for(d=0;d<e.length;d++)U(a,e[d])}}})}Node.prototype.insertBefore=function(c,f){if(c instanceof DocumentFragment){var d=K(c);c=t.call(this,c,f);if(J(this))for(f=
0;f<d.length;f++)S(a,d[f]);return c}d=c instanceof Element&&J(c);f=t.call(this,c,f);d&&U(a,c);J(this)&&S(a,c);return f};Node.prototype.appendChild=function(c){if(c instanceof DocumentFragment){var f=K(c);c=r.call(this,c);if(J(this))for(var d=0;d<f.length;d++)S(a,f[d]);return c}f=c instanceof Element&&J(c);d=r.call(this,c);f&&U(a,c);J(this)&&S(a,c);return d};Node.prototype.cloneNode=function(c){c=q.call(this,!!c);this.ownerDocument.__CE_registry?V(a,c):Q(a,c);return c};Node.prototype.removeChild=function(c){var f=
c instanceof Element&&J(c),d=u.call(this,c);f&&U(a,c);return d};Node.prototype.replaceChild=function(c,f){if(c instanceof DocumentFragment){var d=K(c);c=v.call(this,c,f);if(J(this))for(U(a,f),f=0;f<d.length;f++)S(a,d[f]);return c}d=c instanceof Element&&J(c);var e=v.call(this,c,f),g=J(this);g&&U(a,f);d&&U(a,c);g&&S(a,c);return e};w&&w.get?b(Node.prototype,w):sa(a,function(c){b(c,{enumerable:!0,configurable:!0,get:function(){for(var f=[],d=this.firstChild;d;d=d.nextSibling)d.nodeType!==Node.COMMENT_NODE&&
f.push(d.textContent);return f.join("")},set:function(f){for(;this.firstChild;)u.call(this,this.firstChild);null!=f&&""!==f&&r.call(this,document.createTextNode(f))}})})};var O=window.customElements;function Ha(){var a=new N;Fa(a);Ba(a);Z(a,DocumentFragment.prototype,{prepend:da,append:ea});Ga(a);Da(a);a=new Y(a);document.__CE_registry=a;Object.defineProperty(window,"customElements",{configurable:!0,enumerable:!0,value:a})}O&&!O.forcePolyfill&&"function"==typeof O.define&&"function"==typeof O.get||Ha();window.__CE_installPolyfill=Ha;
}).call(self);`;
const hashCElements = "'sha256-rWWOwtKo7HU91YBF/nwZe2B2qiwVkRbtgbN0jJqfqXs='";

// Known GitLab instances based on https://gitlab.com/vednoc/dark-gitlab/-/blob/master/gitlab.user.css
const glmask = "^gitlab\\.|^((0xacab|framagit)\\.org|code\\.(briarproject\\.org|foxkit\\.us|videolan\\.org)|dev\\.gajim\\.org|forge\\.tedomum\\.net|foss\\.heptapod\\.net|git\\.(alchemyviewer\\.org|callpipe\\.com|cardiff\\.ac\\.uk|cit\\.bcit\\.ca|coop|drk\\.sc|drupalcode\\.org|empiresmod\\.com|feneas\\.org|fosscommunity\\.in|gnu\\.io|happy-dev\\.fr|immc\\.ucl\\.ac\\.be|jami\\.net|ligo\\.org|linux-kernel\\.at|najer\\.info|nzoss\\.org\\.nz|oeru\\.org|pleroma\\.social|pwmt\\.org|rockylinux\\.org|silence\\.dev|synz\\.io)|gitgud\\.io|gitplac\\.si|invent\\.kde\\.org|lab\\.libreho\\.st|mau\\.dev|mpeg\\.expert|opencode\\.net|repo\\.getmonero\\.org|salsa\\.debian\\.org|skylab\\.vc\\.h-brs\\.de|source\\.(joinmastodon\\.org|puri\\.sm|small-tech\\.org))$";
const githost = new RegExp("^(gist\\.)?github\\.(githubassets\\.)?com$|" + glmask);
const gitlab = new RegExp(glmask);
const gitlabjs = new RegExp("^/assets/webpack/.+\\.chunk\\.js$");

var cookie;

var httpObserver = {
  observe: function (subject, topic, data) {
    if ((topic == "http-on-examine-response" || topic == "http-on-examine-cached-response") &&
        subject instanceof Ci.nsIHttpChannel && githost.test(subject.URI.host) &&
        (subject.responseStatus == 200 || subject.responseStatus == 304)) {
      try {
        if (subject.responseStatus == 200 &&
            (subject.loadInfo.externalContentPolicyType == Ci.nsIContentPolicy.TYPE_DOCUMENT ||
             subject.loadInfo.externalContentPolicyType == Ci.nsIContentPolicy.TYPE_SUBDOCUMENT) &&
            subject.getResponseHeader("Content-Type").indexOf("text/html") != -1) {
          try {
            let csp = subject.getResponseHeader("Content-Security-Policy");
            if (gitlab.test(subject.URI.host)) {
              if (subject.URI.host != "0xacab.org") {
                csp = csp.replace(/script-src /g, "script-src " + hashCElements + " ");
              }
            } else {
              csp = csp.replace(/script-src /g, "script-src " + hashBase + " ");
              if (isSeaMonkey) {
                csp = csp.replace(/script-src /g, "script-src github.com gist.github.com " + hashSeaMonkey + " ");
                csp = csp.replace(/default-src 'none'/g, "default-src github.com gist.github.com");
              }
            }
            subject.setResponseHeader("Content-Security-Policy", csp, false);
          } catch (e) {}
          subject.QueryInterface(Ci.nsITraceableChannel);
          let newListener = new tracingListener();
          if (gitlab.test(subject.URI.host)) {
            newListener.site = "gitlab";
          } else {
            newListener.site = "github";
          }
          newListener.originalListener = subject.setNewListener(newListener);
        } else if (gitlab.test(subject.URI.host) && gitlabjs.test(subject.URI.path)) {
          subject.QueryInterface(Ci.nsITraceableChannel);
          let newListener = new tracingListener();
          newListener.site = "gitlabjs";
          newListener.originalListener = subject.setNewListener(newListener);
        } else if (subject.URI.path.indexOf("/socket-worker-") != -1) {
          let csp = subject.getResponseHeader("Content-Security-Policy");
          csp = csp.replace(/worker-src /g, "worker-src github.githubassets.com ");
          subject.setResponseHeader("Content-Security-Policy", csp, false);
        }
      } catch (e) {}
    } else if (isSeaMonkey && topic == "http-on-modify-request" && subject instanceof Ci.nsIHttpChannel &&
        (subject.URI.host == "github.com" || subject.URI.host == "gist.github.com")) {
      try {
        cookie = subject.getRequestHeader("Cookie");
      } catch (e) {
        if (cookie) {
          subject.setRequestHeader("Cookie", cookie, false);
        }
      }
    }
  },
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver, Ci.nsISupportsWeakReference])
};

function tracingListener () {
  this.receivedData = [];
}

tracingListener.prototype = {
  onDataAvailable: function (request, context, inputStream, offset, count) {
    let binaryInputStream = Cc["@mozilla.org/binaryinputstream;1"].createInstance(Ci["nsIBinaryInputStream"]);
    binaryInputStream.setInputStream(inputStream);
    let data = binaryInputStream.readBytes(count);
    this.receivedData.push(data);
  },
  onStartRequest: function (request, context) {
    try {
      this.originalListener.onStartRequest(request, context);
    } catch (err) {
      request.cancel(err.result);
    }
  },
  onStopRequest: function (request, context, statusCode) {
    let data = this.receivedData.join("");
    try {
      if (this.site == "github") {
        data = data.replace("<head>", "<head><script crossorigin=\"anonymous\" integrity=\"sha512-g4ztuyuFPzjTvIqYBeZdHEDaHz2K6RCz4RszsnL3m5ko4kiWCjB9W6uIScLkNr8l/BtC2dYiIFkOdOLDYBHLqQ==\" type=\"application/javascript\" src=\"https://github.githubassets.com/assets/compat-838cedbb.js\"></script>");
        data = data.replace(/<script.+chunk-index2-[a-z0-9]+\.js"><\/script>/, "<script crossorigin=\"anonymous\" defer=\"defer\" integrity=\"sha512-o/3J98IT190CWjNtrpkWpVUdnrkKSwQ1jDFOagsCc8ZvvyaqewKygiqxbxF/Z/BzHnrUvLkTe43sQ/D4PAyGRA==\" type=\"application/javascript\" data-module-id=\"./chunk-index2.js\" data-src=\"https://github.githubassets.com/assets/chunk-index2-a3fdc9f7.js\"></script>");
        data = data.replace("<head>", "<head><script>" + pfBase + "</script>");
        if (isSeaMonkey) {
          data = data.replace("<head>", "<head><script>" + pfSeaMonkey + "</script>");
        }
      } else if (this.site == "gitlab") {
        data = data.replace("<script", "<script>" + customElements + "</script><script");
      } else if (this.site == "gitlabjs") {
        // https://gitlab.com/gitlab-org/gitlab/-/commit/5522a5ffb6a0522e11dd684cce5c5e99ae6c24ce
        data = data.replace("(?<iid>", "(").replace(".groups.iid", "[1]");
        // https://gitlab.com/gitlab-org/gitlab-ui/-/commit/d23c341bb8cef5683bf2d49556dabe4008be76cf
        data = data.replace("\\p{Emoji}", "[\\u{1f300}-\\u{1f5ff}\\u{1f900}-\\u{1f9ff}\\u{1f600}-\\u{1f64f}\\u{1f680}-\\u{1f6ff}\\u{2600}-\\u{26ff}\\u{2700}-\\u{27bf}\\u{1f1e6}-\\u{1f1ff}\\u{1f191}-\\u{1f251}\\u{1f004}\\u{1f0cf}\\u{1f170}-\\u{1f171}\\u{1f17e}-\\u{1f17f}\\u{1f18e}\\u{3030}\\u{2b50}\\u{2b55}\\u{2934}-\\u{2935}\\u{2b05}-\\u{2b07}\\u{2b1b}-\\u{2b1c}\\u{3297}\\u{3299}\\u{303d}\\u{00a9}\\u{00ae}\\u{2122}\\u{23f3}\\u{24c2}\\u{23e9}-\\u{23ef}\\u{25b6}\\u{23f8}-\\u{23fa}]");
        // https://gitlab.com/gitlab-org/gitlab/-/merge_requests/79161
        data = data.replace(/\(\?<(indent|leader|isOl|isUl|content)>/g,"(<$1>").replace(/(const{indent:.,content:.,leader:.}=)o.groups;/,"$1{};");
      }
    } catch (e) {}
    let storageStream = Cc["@mozilla.org/storagestream;1"].createInstance(Ci["nsIStorageStream"]);
    storageStream.init(8192, data.length, null);
    let os = storageStream.getOutputStream(0);
    if (data.length > 0) {
      os.write(data, data.length);
    }
    os.close();
    try {
      this.originalListener.onDataAvailable(request, context, storageStream.newInputStream(0), 0, data.length);
    } catch (e) {}
    try {
      this.originalListener.onStopRequest(request, context, statusCode);
    } catch (e) {}
  },
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIStreamListener, Ci.nsISupports])
}

function startup(data, reason) {
  Services.obs.addObserver(httpObserver, "http-on-examine-response", false);
  Services.obs.addObserver(httpObserver, "http-on-examine-cached-response", false);
  if (isSeaMonkey) {
    Services.obs.addObserver(httpObserver, "http-on-modify-request", false);
  }
}

function shutdown(data, reason) {
  if (reason == APP_SHUTDOWN) {
    return;
  }
  if (isSeaMonkey) {
    Services.obs.removeObserver(httpObserver, "http-on-modify-request", false);
  }
  Services.obs.removeObserver(httpObserver, "http-on-examine-cached-response", false);
  Services.obs.removeObserver(httpObserver, "http-on-examine-response", false);
}

function install() {}

function uninstall() {}
