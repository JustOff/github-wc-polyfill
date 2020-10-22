/*
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.

 Copyright (c) 2020 JustOff. All rights reserved.
*/

"use strict";

var Cc = Components.classes, Ci = Components.interfaces, Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

const isSeaMonkey = Services.appinfo.name == "SeaMonkey";

const polyfill = `if (!Element.prototype.toggleAttribute) {
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
}`;

const sha256 = "'sha256-a1mbTwJSodgsH6xIck4zziyRaF6F6MYFDaWPqucYPeo='";

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
             subject.loadInfo.externalContentPolicyType == Ci.nsIContentPolicy.TYPE_SUBDOCUMENT)) {
          let ctype = subject.getResponseHeader("Content-Type").toLowerCase();
          if (ctype.indexOf("text/html") != -1) {
            if (isSeaMonkey) {
              let csp = subject.getResponseHeader("Content-Security-Policy");
              csp = csp.replace("script-src ", "script-src github.com " + sha256 + " ");
              csp = csp.replace("default-src 'none'", "default-src github.com/socket-worker.js gist.github.com/socket-worker.js");
              subject.setResponseHeader("Content-Security-Policy", csp, false);
            }
            subject.QueryInterface(Ci.nsITraceableChannel);
            let newListener = new tracingListener();
            newListener.originalListener = subject.setNewListener(newListener);
          }
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
      data = data.replace(/<script crossorigin="anonymous" defer="defer" (.+?compat\.js.+?)data-src=(.+?)\/script>/,
                          "<script crossorigin=\"anonymous\" $1src=$2/script>");
      if (isSeaMonkey) {
        data = data.replace("<head>", "<head><script>" + polyfill + "</script>");
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
