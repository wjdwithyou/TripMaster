var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('main/main', { title: 'Trip Master', bUserLogin:((req.session.user_id) ? true : false)});
});

module.exports = router;
