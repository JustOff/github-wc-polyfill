"use strict";

var fs = require('fs');
var https = require('https');
var crypto = require('crypto');

var version = "2.2.10";
var bundle = "webcomponents-ce.js";
var url = "https://unpkg.com/@webcomponents/webcomponentsjs@" + version + "/bundles/" + bundle;
var bootstrap = "bootstrap.js";

var handle = function() {
  var bdata = fs.readFileSync(bundle, "utf8");
  bdata = bdata.replace(/\/\*(\r?\n|\*)[\s\S]+?\*\//g, "");
  bdata = bdata.replace(/(\r?\n)+\/\/[\s\S]+/, "").trim();
  fs.writeFileSync(bundle.replace("ce", "include"), bdata);
  var hash = crypto.createHash("sha256").update(bdata).digest("base64");
  var b64 = Buffer.from(bdata).toString("base64");
  var sdata = fs.readFileSync(bootstrap, "utf8");
  sdata = sdata.replace(/const sha256.+?;/, "const sha256 = \"'sha256-" + hash + "'\";");
  sdata = sdata.replace(/const polyfill.+?;/, "const polyfill = atob(\"" + b64 + "\");");
  fs.writeFileSync(bootstrap, sdata);
}

try { fs.unlinkSync(bundle) } catch(e) {}

var file = fs.createWriteStream(bundle);
https.get(url, function(response) {
  response.pipe(file);
  file.on('finish', function() {
    file.close(handle);
  });
});
