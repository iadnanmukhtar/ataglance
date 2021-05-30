"use strict";
const express = require('express');
const Data = require('../lib/Data');
const Config = require('../lib/Config');

const router = express.Router();

var toc = Data.get('toc');
for (var i = 0; i < toc.length; i++)
  toc[i].ref = i + 1;
const metadata = Data.get('metadata');
const quran = Data.get('quran');
const arQuran = Data.get('quran.clean');
const enQuran = Data.get('quran.en');

router.get('/', function (req, res, next) {
  if (req.hostname.match('quranunlocked')) {
    res.redirect(301, 'https://quranataglance.com');
    return;
  }
  if (req.query.q) {
    var results = [];
    if (req.query.q.match(/[a-z0-9\'\"\_\-]/ig))
      results = searchEnglish(req.query.q.trim());
    else
      results = searchArabic(req.query.q.trim());
    res.render('search', {
      q: req.query.q,
      results: results,
      quran: quran,
      equran: enQuran,
      md: metadata
    });
  } else
    res.render('index', {
      admin: Config.isAdmin(req.cookies.admin),
      toc: toc,
      quran: quran,
      md: metadata
    });
});

router.get('/r/:q', function (req, res, next) {
  var m = req.params.q.match(/^(\d+)[:_]?(\d+)?-?(\d+)?/);
  var sura = m[1];
  var start = (m[2] != null) ? m[2] : 0;
  var end = (m[3] != null) ? m[3] : start;
  var text = [];
  var trans = [];
  for (var i = (start - 1); i < end; i++) {
    text.push(quran[sura - 1].ayas[i]);
    trans.push(enQuran[sura - 1].ayas[i]);
  }
  var content = {
    text: text,
    trans: trans
  }
  res.json(content);
});

router.post('/u', function (req, res, next) {
  if (!Config.isAdmin(req.cookies.admin)) {
    res.status(403);
    return;
  }
  var result = Data.updateTOC(toc, req.body);
  toc = Data.get('toc');
  res.json(result);
});

function searchEnglish(qs) {
  return search(qs, 'en');
}

function searchArabic(qs) {
  qs = qs.replace(/[\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652\u0670]+/g, '');
  qs = qs.replace(/[اءأآإ]/g, '[اءأآإ]');
  qs = qs.replace(/[يىئ]/g, '[يىئ]');
  qs = qs.replace(/[ؤو]/g, '[ؤو]');
  return search(qs, 'ar');
}

function search(qs, lang) {
  var results = [];
  // search exact
  var q = new RegExp('(' + qs + ')', 'ig');
  results = results.concat(searchQ(q, lang));
  // search proximity
  var prevq = q;
  var qt = qs.split(/[\s\-\_\,\.\']+/);
  q = '';
  for (var i = 0; i < qt.length; i++) {
    q += qt[i];
    if (i < qt.length-1)
      q += '.+';
  }
  q = new RegExp('(' + q + ')', 'ig');
  if ((prevq + lang) != (q + lang)) {
    results = results.concat(searchQ(q, lang).filter(function (value) {
      var add = true;
      for (var i = 0; i < results.length; i++) {
        if (results[i].sura == value.sura && results[i].aya == value.aya) {
          add = false;
          break;
        }
      }
      return add;
    }));
  }
  // search either or
  var prevq = q;
  var qt = qs.split(/[\s\-\_\,\.\']+/);
  q = '';
  for (var i = 0; i < qt.length; i++) {
    q += qt[i];
    if (i < qt.length-1)
      q += '|';
  }
  q = new RegExp('(' + q + ')', 'ig');
  if ((prevq + lang) != (q + lang)) {
    results = results.concat(searchQ(q, lang).filter(function (value) {
      var add = true;
      for (var i = 0; i < results.length; i++) {
        if (results[i].sura == value.sura && results[i].aya == value.aya) {
          add = false;
          break;
        }
      }
      return add;
    }));
  }

  return results;
}

function searchQ(q, lang) {
  console.log('searching for: ' + lang + ' ' + q);
  var results = [];
  if (lang == 'en') {
    // search name
    for (var i = 0; i < metadata.sura.length; i++) {
      var text = 'Sura ' + (i + 1) + ' ' + metadata.sura[i].ename + ' ' + metadata.sura[i].tname + ' ' + metadata.sura[i].oname;
      if (text.match(q)) {
        results.push({
          "sura": i+1,
          "topics": ('Sura ' + (i+1) + ' ' + metadata.sura[i].tname).replace(q, '<em>$1</em>'),
          "aya": 1,
          "text": quran[i].ayas[0].text,
          "trans": enQuran[i].ayas[0].text
        });
        break;
      }
    }
    // search TOC
    for (var i = 0; i < toc.length; i++) {
      if ((toc[i].topics + ' ' + toc[i].tags).match(q)) {
        var aya = toc[i].range.split('-')[0];
        results.push({
          "sura": toc[i].sura,
          "topics": toc[i].topics.replace(q, '<em>$1</em>'),
          "aya": aya,
          "text": quran[toc[i].sura-1].ayas[aya-1].text,
          "trans": enQuran[toc[i].sura-1].ayas[aya-1].text
        });
        break;
      }
    }
  }
  // search text
  var searchable = (lang == 'en') ? enQuran : arQuran;
  for (var i = 0; i < searchable.length; i++) {
    for (var j = 0; j < searchable[i].ayas.length; j++) {
      var text = (i + 1) + ':' + (j + 1) + ' ' + searchable[i].ayas[j].text;
      if (text.match(q))
        if (lang == 'en')
          results.push({
            "sura": i + 1,
            "aya": j + 1,
            "text": quran[i].ayas[j].text,
            "trans": enQuran[i].ayas[j].text.replace(q, '<em>$1</em>')
          });
        else
          results.push({
            "sura": i + 1,
            "aya": j + 1,
            "text": arQuran[i].ayas[j].text.replace(q, '<em>$1</em>'),
            "trans": enQuran[i].ayas[j].text
          });
      if (results.length > 1000)
        break;
    }
  }
  return results;
}

module.exports = router;
