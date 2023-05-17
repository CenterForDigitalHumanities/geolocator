#!/usr/bin/env node
/**
 * GET home page.
 * @author cubap@slu.edu
 */

var express = require('express');
var router = express.Router();
const path = require('path');

const root = path.join(__dirname,"../public")

router.get('/', function(req, res, next) {
  res.sendFile('index.html', {root} )
});

module.exports = router;
