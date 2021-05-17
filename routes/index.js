const express = require('express');
const fs = require('fs');
const Data = require('../lib/Data');

const router = express.Router();

const toc = Data.get('toc');
const metadata = Data.get('metadata');
const quran = Data.get('quran');
const equran = Data.get('en.saheeh');

router.get('/', function (req, res, next) {
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
