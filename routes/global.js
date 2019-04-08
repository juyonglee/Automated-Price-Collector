var express = require('express');
var router = express.Router();

const priceGenerator = require('./priceModule');

/* GET home page. */
router.post('/', function(req, res, next) {
    priceGenerator(res);
});

module.exports = router;
