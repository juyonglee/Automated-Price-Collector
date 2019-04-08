var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
//   runningLogic(res);
res.render('index', { title: '흥청망청' });
});

module.exports = router;
