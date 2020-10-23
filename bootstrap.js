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
const pfQueueMicrotask = `typeof queueMicrotask !== 'function' && (queueMicrotask = function(f) {setTimeout(f, 0)})`;
const hashQueueMicrotask = "'sha256-igeL9oZ0EoGLhbsoV8SGLqJ+N2TODXWU9AOUmKvnXLM='";

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
          csp = csp.replace("script-src ", "script-src " + hashQueueMicrotask + " ");
          if (isSeaMonkey) {
            csp = csp.replace("script-src ", "script-src github.com gist.github.com " + hashSeaMonkey + " ");
            csp = csp.replace("default-src 'none'", "default-src github.com/socket-worker.js gist.github.com/socket-worker.js");
          }
          subject.setResponseHeader("Content-Security-Policy", csp, false);
          subject.QueryInterface(Ci.nsITraceableChannel);
          let newListener = new tracingListener();
          newListener.originalListener = subject.setNewListener(newListener);
        } else if (subject.URI.path == "/socket-worker.js") {
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

function textFromInputStream(inputStream, count) {
  let scriptableInputStream = Cc["@mozilla.org/scriptableinputstream;1"].createInstance(Ci["nsIScriptableInputStream"]);
  scriptableInputStream.init(inputStream);
  return scriptableInputStream.readBytes(count);
}

function inputStreamFromText(text) {
  let storageStream = Cc["@mozilla.org/storagestream;1"].createInstance(Ci["nsIStorageStream"]);
  storageStream.init(8192, text.length, null);
  let outputStream = storageStream.getOutputStream(0)
  outputStream.write(text, text.length);
  outputStream.close();
  return storageStream.newInputStream(0);
}

function tracingListener () {
}

tracingListener.prototype = {
  patched: false,

  onDataAvailable: function (request, context, inputStream, offset, count) {
    if (!this.patched) {
      let data = textFromInputStream(inputStream, count);
      try {
        data = data.replace("<head>", "<head><script crossorigin=\"anonymous\" integrity=\"sha512-g4ztuyuFPzjTvIqYBeZdHEDaHz2K6RCz4RszsnL3m5ko4kiWCjB9W6uIScLkNr8l/BtC2dYiIFkOdOLDYBHLqQ==\" type=\"application/javascript\" src=\"https://github.githubassets.com/assets/compat-838cedbb.js\"></script>");
        data = data.replace("<head>", "<head><script>" + pfQueueMicrotask + "</script>");
        if (isSeaMonkey) {
          data = data.replace("<head>", "<head><script>" + pfSeaMonkey + "</script>");
        }
      } catch (e) {}
      offset = 0;
      count = data.length;
      inputStream = inputStreamFromText(data);
      this.patched = true;
    }
    this.originalListener.onDataAvailable(request, context, inputStream, offset, count);
  },
  onStartRequest: function (request, context) {
    this.originalListener.onStartRequest(request, context);
  },
  onStopRequest: function (request, context, statusCode) {
    this.originalListener.onStopRequest(request, context, statusCode);
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
