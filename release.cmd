@echo off
set VER=1.2.2

sed -i -E "s/version>.+?</version>%VER%</" install.rdf
sed -i -E "s/version>.+?</version>%VER%</; s/download\/.+?\/github-wc-polyfill-.+?\.xpi/download\/%VER%\/github-wc-polyfill-%VER%\.xpi/" update.xml

set XPI=github-wc-polyfill-%VER%.xpi
if exist %XPI% del %XPI%
zip -r9q %XPI% bootstrap.js icon.png install.rdf
