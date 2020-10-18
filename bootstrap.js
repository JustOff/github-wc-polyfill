/*
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.

 GitHub Web Components Polyfill Add-on
 Copyright (c) 2020 JustOff. All rights reserved.
*/

"use strict";

var Ci = Components.interfaces, Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/services-crypto/utils.js");

Cu.importGlobalProperties(["XMLHttpRequest", "btoa"]);

const polyfill = {
    // first try newest online
    url: "https://unpkg.com/@webcomponents/webcomponentsjs/webcomponents-bundle.js",
    // fallback buildin @2.4.4
    res: "chrome://github-wc-polyfill/content/webcomponents-bundle.js",
};

XPCOMUtils.defineLazyGetter(polyfill, "sha256", function() {
    function finishXHR(url) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send(null);
        return xhr;
    }
    let response = finishXHR(polyfill.url);
    if (response.status == 200) {
        polyfill.text = response.responseText;
    } else {
        polyfill.text = finishXHR(polyfill.res).responseText;
    }
    return btoa(CryptoUtils.UTF8AndSHA256(polyfill.text));
});

var httpResponseObserver = {
  observe: function (subject, topic, data) {
    if ((topic == "http-on-examine-response" || topic == "http-on-examine-cached-response") &&
        subject instanceof Ci.nsIHttpChannel && subject.URI.host == "github.com" &&
        (subject.responseStatus == 200 || subject.responseStatus == 304)) {
      try {
        let ctype = subject.getResponseHeader("Content-Type").toLowerCase();
        if (ctype.indexOf("text/html") == -1 && ctype.indexOf("text/javascript") == -1) {
          return;
        }
      } catch (e) {}
      try {
        let csp = subject.getResponseHeader("Content-Security-Policy");
        csp = csp.replace("script-src ", "script-src 'sha256-" + polyfill.sha256 + "' ");
        csp = csp.replace("worker-src ", "worker-src github.githubassets.com ");
        subject.setResponseHeader("Content-Security-Policy", csp, false);
      } catch (e) {}
    }
  },
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver, Ci.nsISupportsWeakReference])
};

var deiObserver = {
  observe: function(subject, topic, data) {
    if (topic == "document-element-inserted" && subject instanceof Ci.nsIDOMDocument &&
        subject.defaultView && subject.defaultView == subject.defaultView.top &&
        subject.location.protocol == "https:" &&
        subject.location.hostname == "github.com" &&
        subject.contentType == "text/html") {
      let script = subject.createElement("script");
      script.textContent = polyfill.text;
      let heads = subject.documentElement.getElementsByTagName("head");
      if (heads.length && heads[0].firstElementChild) {
        heads[0].insertBefore(script, heads[0].firstElementChild);
      }
    }
  },
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver, Ci.nsISupportsWeakReference])
};

function startup(data, reason) {
  Services.obs.addObserver(httpResponseObserver, "http-on-examine-response", false);
  Services.obs.addObserver(httpResponseObserver, "http-on-examine-cached-response", false);
  Services.obs.addObserver(deiObserver, "document-element-inserted", false);
}

function shutdown(data, reason) {
  if (reason == APP_SHUTDOWN) {
    return;
  }
  Services.obs.removeObserver(deiObserver, "document-element-inserted", false);
  Services.obs.removeObserver(httpResponseObserver, "http-on-examine-cached-response", false);
  Services.obs.removeObserver(httpResponseObserver, "http-on-examine-response", false);
}

function install() {}

function uninstall() {}
