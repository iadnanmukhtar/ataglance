"use strict";
const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
    res.redirect(301, 'https://quranataglance.com');
});

module.exports = router;