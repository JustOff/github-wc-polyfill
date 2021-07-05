var doms = [ 
  '0xacab.org',
  'code.briarproject.org',
  'code.foxkit.us',
  'code.videolan.org',
  'dev.gajim.org',
  'forge.tedomum.net',
  'framagit.org',
  'git.callpipe.com',
  'git.cardiff.ac.uk',
  'git.cit.bcit.ca',
  'git.coop',
  'git.drk.sc',
  'git.drupalcode.org',
  'git.empiresmod.com',
  'git.feneas.org',
  'git.fosscommunity.in',
  'git.gnu.io',
  'git.happy-dev.fr',
  'git.immc.ucl.ac.be',
  'git.jami.net',
  'git.ligo.org',
  'git.linux-kernel.at',
  'git.najer.info',
  'git.nzoss.org.nz',
  'git.oeru.org',
  'git.pleroma.social',
  'git.pwmt.org',
  'git.silence.dev',
  'git.synz.io',
  'gitgud.io',
  'gitplac.si',
  'invent.kde.org',
  'lab.libreho.st',
  'mau.dev',
  'mpeg.expert',
  'opencode.net',
  'repo.getmonero.org',
  'salsa.debian.org',
  'skylab.vc.h-brs.de',
  'source.joinmastodon.org',
  'source.puri.sm',
  'source.small-tech.org'
];

doms = doms.sort().filter((el, pos, ary) => !pos || el != ary[pos - 1]);
var tld = doms.filter((el) => el.indexOf(".") == -1);
var tldr = new RegExp("\\.(" + tld.join("|") + ")$");
doms = doms.filter((el) => el.indexOf(".") > -1 && !tldr.test(el));
var dn = "", tlds = [], res1 = [], res2 = {};

function mkres(dl, drs) {
  if (drs.length > 1) {
    res1.push(dl + ".(" + drs.join("|") + ")");
  } else {
    if (drs[0] in res2) {
      res2[drs[0]].push(dl);
    } else {
      res2[drs[0]] = [dl];
    }
  }
}

for (var dom of doms) {
  var dns = dom.split(/(.+?)\.(.+)/).slice(1,3);
  if (dn == dns[0]) {
    tlds.push(dns[1]);
  } else {
    dn != "" && mkres(dn, tlds);
    dn = dns[0]; tlds = []; tlds.push(dns[1]);
  }
}
mkres(dn, tlds);

for (var r in res2) {
  if (res2[r].length > 1) {
    res1.push("(" + res2[r].join("|") + ")." + r);
  } else {
    res1.push(res2[r] + "." + r);
  }
}

res1 = res1.concat(tld).sort();
console.log('const glmask = "^gitlab\.|^(' + res1.join("|").replace(/\./g,"\\.") + ')$";');
