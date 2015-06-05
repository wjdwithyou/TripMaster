var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	if (req.session.user_id)
		res.redirect('/members');
	else
		res.render('index', { title: 'Trip Master' });
});

module.exports = router;
