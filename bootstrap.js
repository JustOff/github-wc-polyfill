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
const pfBase = `typeof queueMicrotask !== 'function' && (queueMicrotask = function(f) {setTimeout(f, 0)});(function(){return function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=0)}([function(e,t,r){"use strict";function n(e){return(n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function o(e){return function(e){if(Array.isArray(e)){for(var t=0,r=new Array(e.length);t<e.length;t++)r[t]=e[t];return r}}(e)||function(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}()}function i(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function u(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function s(e){var t="function"==typeof Map?new Map:void 0;return(s=function(e){if(null===e||(r=e,-1===Function.toString.call(r).indexOf("[native code]")))return e;var r;if("function"!=typeof e)throw new TypeError("Super expression must either be null or a function");if(void 0!==t){if(t.has(e))return t.get(e);t.set(e,n)}function n(){return c(e,arguments,f(this).constructor)}return n.prototype=Object.create(e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),a(n,e)})(e)}function c(e,t,r){return(c=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}()?Reflect.construct:function(e,t,r){var n=[null];n.push.apply(n,t);var o=new(Function.bind.apply(e,n));return r&&a(o,r.prototype),o}).apply(null,arguments)}function a(e,t){return(a=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function f(e){return(f=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}r.r(t);var l=function(e){function t(e){var r,i,s,c,a;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),i=function(e,t){return!t||"object"!==n(t)&&"function"!=typeof t?u(e):t}(this,(r=f(t)).call.apply(r,[this].concat(o(e)))),s=u(i),a=void 0,(c="_entries")in s?Object.defineProperty(s,c,{value:a,enumerable:!0,configurable:!0,writable:!0}):s[c]=a,i._entries=e,i}var r,s,c;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&a(e,t)}(t,e),r=t,(s=[{key:"getEntries",value:function(){return this._entries}},{key:"getEntriesByType",value:function(e){return this._entries.filter((function(t){return t.entryType===e}))}},{key:"getEntriesByName",value:function(e,t){return this._entries.filter((function(t){return t.name===e})).filter((function(e){return!t||e.entryType===t}))}}])&&i(r.prototype,s),c&&i(r,c),t}(s(Array));function y(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function p(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function v(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function b(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}var d=["mark","measure","navigation","resource"],h="Failed to execute 'observe' on 'PerformanceObserver': either an 'entryTypes' or 'type' member must be present.",m="Failed to execute 'observe' on 'PerformanceObserver': either an 'entryTypes' or 'type' member must be present, not both.",g="Aborting 'observe' on 'PerformanceObserver': no valid entry types present in either 'entryTypes' or 'type' member.",O="Invalid or unsupported entry types provided to 'observe' on 'PerformanceObserver'.",w=function(e){return d.some((function(t){return e===t}))},P=new(function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},r=t.registeredObservers,n=void 0===r?new Set:r,o=t.processedEntries,i=void 0===o?new Set:o,u=t.interval,s=void 0===u?100:u,c=t.context,a=void 0===c?self:c;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),p(this,"registeredObservers",void 0),p(this,"processedEntries",void 0),p(this,"interval",void 0),p(this,"intervalId",void 0),p(this,"context",void 0),this.registeredObservers=n,this.processedEntries=i,this.interval=s,this.context=a,this.intervalId=null}var t,r,n;return t=e,(r=[{key:"getNewEntries",value:function(){var e=this;return this.context.performance.getEntries().filter((function(t){return!e.processedEntries.has(t)}))}},{key:"getObserversForType",value:function(e,t){return Array.from(e).filter((function(e){return e.entryTypes.some((function(e){return e===t}))}))}},{key:"processBuffer",value:function(e){var t=Array.from(e.buffer),r=new l(t);e.buffer.clear(),t.length&&e.callback&&e.callback.call(void 0,r,e)}},{key:"processEntries",value:function(){var e=this;this.getNewEntries().forEach((function(t){var r=t.entryType;e.getObserversForType(e.registeredObservers,r).forEach((function(e){e.buffer.add(t)})),e.processedEntries.add(t)}));var t=function(){return e.registeredObservers.forEach(e.processBuffer)};"requestAnimationFrame"in this.context?this.context.requestAnimationFrame(t):this.context.setTimeout(t,0)}},{key:"add",value:function(e){this.registeredObservers.add(e),1===this.registeredObservers.size&&this.observe()}},{key:"remove",value:function(e){this.registeredObservers.delete(e),this.registeredObservers.size||this.disconnect()}},{key:"observe",value:function(){this.intervalId=this.context.setInterval(this.processEntries.bind(this),this.interval)}},{key:"disconnect",value:function(){this.intervalId=this.context.clearInterval(this.intervalId)}}])&&y(t.prototype,r),n&&y(t,n),e}()),k=function(){function e(t){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:P;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),b(this,"callback",void 0),b(this,"buffer",void 0),b(this,"entryTypes",[]),b(this,"taskQueue",void 0),this.callback=t,this.buffer=new Set,this.taskQueue=r}var t,r,n;return t=e,(r=[{key:"observe",value:function(e){if(!e)throw new Error(h);if(e.entryTypes&&e.type)throw new Error(m);var t;if(e.entryTypes)t=e.entryTypes;else{if(!e.type)throw new Error(h);t=[e.type]}var r=t.filter(w);r.length>0&&r.length!==t.length&&console.warn(O),r.length?(this.entryTypes=r,this.taskQueue.add(this)):console.warn(g)}},{key:"disconnect",value:function(){this.taskQueue.remove(this)}},{key:"takeRecords",value:function(){var e=Array.from(this.buffer);return new l(e)}}])&&v(t.prototype,r),n&&v(t,n),e}();b(k,"supportedEntryTypes",d);var E="PerformanceObserver"in self&&"function"==typeof PerformanceObserver?PerformanceObserver:k,j=self;j.PerformanceObserver||(j.PerformanceObserver=E)}])}).call(this);`;
const hashBase = "'sha256-zvLOLKAJGgE15UlxzrfJku98SqXX+62K0wvG3qHJYOo='";

var cookie;

var httpObserver = {
  observe: function (subject, topic, data) {
    if ((topic == "http-on-examine-response" || topic == "http-on-examine-cached-response") &&
        subject instanceof Ci.nsIHttpChannel &&
        (subject.URI.host == "github.com" || subject.URI.host == "gist.github.com") &&
        (subject.responseStatus == 200 || subject.responseStatus == 304)) {
      try {
        if (subject.responseStatus == 200 &&
            (subject.loadInfo.externalContentPolicyType == Ci.nsIContentPolicy.TYPE_DOCUMENT ||
             subject.loadInfo.externalContentPolicyType == Ci.nsIContentPolicy.TYPE_SUBDOCUMENT) &&
            subject.getResponseHeader("Content-Type").indexOf("text/html") != -1) {
          let csp = subject.getResponseHeader("Content-Security-Policy");
          csp = csp.replace("script-src ", "script-src " + hashBase + " ");
          if (isSeaMonkey) {
            csp = csp.replace("script-src ", "script-src github.com gist.github.com " + hashSeaMonkey + " ");
            csp = csp.replace("default-src 'none'", "default-src github.com gist.github.com");
          }
          subject.setResponseHeader("Content-Security-Policy", csp, false);
          subject.QueryInterface(Ci.nsITraceableChannel);
          let newListener = new tracingListener();
          newListener.originalListener = subject.setNewListener(newListener);
        } else if (subject.URI.path.indexOf("/socket-worker-") == 0) {
          let csp = subject.getResponseHeader("Content-Security-Policy");
          csp = csp.replace("worker-src ", "worker-src github.githubassets.com ");
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
      data = data.replace("<head>", "<head><script crossorigin=\"anonymous\" integrity=\"sha512-g4ztuyuFPzjTvIqYBeZdHEDaHz2K6RCz4RszsnL3m5ko4kiWCjB9W6uIScLkNr8l/BtC2dYiIFkOdOLDYBHLqQ==\" type=\"application/javascript\" src=\"https://github.githubassets.com/assets/compat-838cedbb.js\"></script>");
      data = data.replace("<head>", "<head><script>" + pfBase + "</script>");
      if (isSeaMonkey) {
        data = data.replace("<head>", "<head><script>" + pfSeaMonkey + "</script>");
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
