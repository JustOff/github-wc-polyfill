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

var httpResponseObserver = {
  observe: function (subject, topic, data) {
    if ((topic == "http-on-examine-response" || topic == "http-on-examine-cached-response") &&
        subject instanceof Ci.nsIHttpChannel &&
        (subject.URI.host == "github.com" || subject.URI.host == "gist.github.com") &&
        (subject.responseStatus == 200 || subject.responseStatus == 304)) {
      try {
        let ctype = subject.getResponseHeader("Content-Type").toLowerCase();
        if (ctype.indexOf("text/html") == -1 && ctype.indexOf("text/javascript") == -1) {
          return;
        }
      } catch (e) {}
      try {
        let csp = subject.getResponseHeader("Content-Security-Policy");
        csp = csp.replace("worker-src ", "worker-src github.githubassets.com ");
        subject.setResponseHeader("Content-Security-Policy", csp, false);
      } catch (e) {}
      subject.QueryInterface(Ci.nsITraceableChannel);
      var newListener = new tracingListener();
      newListener.originalListener = subject.setNewListener(newListener);
    }
  },
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver, Ci.nsISupportsWeakReference])
};

function tracingListener () {
  this.receivedData = [];
}

tracingListener.prototype = {
  onDataAvailable: function (request, context, inputStream, offset, count) {
    var binaryInputStream = Cc["@mozilla.org/binaryinputstream;1"].createInstance(Ci["nsIBinaryInputStream"]);
    binaryInputStream.setInputStream(inputStream);
    var data = binaryInputStream.readBytes(count);
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
    var data = this.receivedData.join("");
    try {
      data = data.replace(/<script crossorigin="anonymous" defer="defer" (.+?compat\.js.+?)data-src=(.+?)\/script>/,
                          "<script crossorigin=\"anonymous\" $1src=$2/script>");
    } catch (e) {}
    var storageStream = Cc["@mozilla.org/storagestream;1"].createInstance(Ci["nsIStorageStream"]);
    storageStream.init(8192, data.length, null);
    var os = storageStream.getOutputStream(0);
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
  Services.obs.addObserver(httpResponseObserver, "http-on-examine-response", false);
  Services.obs.addObserver(httpResponseObserver, "http-on-examine-cached-response", false);
}

function shutdown(data, reason) {
  if (reason == APP_SHUTDOWN) {
    return;
  }
  Services.obs.removeObserver(httpResponseObserver, "http-on-examine-cached-response", false);
  Services.obs.removeObserver(httpResponseObserver, "http-on-examine-response", false);
}

function install() {}

function uninstall() {}
