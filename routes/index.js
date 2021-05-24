const express = require('express');
const fs = require('fs');
const Data = require('../lib/Data');

const router = express.Router();

const toc = Data.get('toc');
const metadata = Data.get('metadata');
const quran = Data.get('quran');
const squran = Data.get('quran.clean');
const equran = Data.get('en.saheeh');

router.get('/', function (req, res, next) {
  if (req.query.q) {
    var results = [];
    if (req.query.q.match(/[a-z]/i)) {
      var q = new RegExp('(' + req.query.q + ')', 'ig');
      for (var i = 0; i < equran.length; i++) {
        for (var j = 0; j < equran[i].ayas.length; j++) {
          if (equran[i].ayas[j].text.toLowerCase().match(q))
            results.push({
              "sura": i + 1,
              "aya": j + 1,
              "text": quran[i].ayas[j].text,
              "trans": equran[i].ayas[j].text.replace(q, '<em>$1</em>')
            });
          if (results.length > 1000)
            break;
        }
      }
    } else {
      for (var i = 0; i < quran.length; i++) {
        var q = req.query.q.replace(/[\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652\u0670]+/g, '');
        q = new RegExp('(' + q + ')', 'g');
        for (var j = 0; j < quran[i].ayas.length; j++) {
          if (squran[i].ayas[j].text.match(q))
            results.push({
              "sura": i + 1,
              "aya": j + 1,
              "text": squran[i].ayas[j].text.replace(q, '<em>$1</em>'),
              "trans": equran[i].ayas[j].text
            });
          if (results.length > 1000)
            break;
        }
      }
    }
    res.render('search', {
      q: req.query.q,
      results: results,
      quran: quran,
      equran: quran,
      md: metadata
    });
  } else
    res.render('index', {
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
    trans.push(equran[sura - 1].ayas[i]);
  }
  var content = {
    text: text,
    trans: trans
  }
  res.json(content);
});

module.exports = router;
