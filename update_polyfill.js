"use strict";

var fs = require('fs');
var https = require('https');
var crypto = require('crypto');

var version = "2.4.4";
var bundle = "webcomponents-bundle.js";
var url = "https://unpkg.com/@webcomponents/webcomponentsjs@" + version + "/" + bundle;
bundle = "content/" + bundle;

try { fs.unlinkSync(bundle) } catch(e) {}

var file = fs.createWriteStream(bundle);
https.get(url, function(response) {
  response.pipe(file);
});
