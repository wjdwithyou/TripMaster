var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	if (req.session.user_id)
		res.redirect('/members');
	else
		res.render('index', { title: 'Trip Master'});
});

router.get('/top', function(req, res, next){
	if (req.session.user_id)
		res.render('top', {bUserLogin: true} );
	else
		res.render('top', {bUserLogin: false} );
});

router.get('/body', function(req, res, next){
	if (req.session.user_id)
		res.render('body', {bUserLogin: true} );
	else
		res.render('body', {bUserLogin: false} );
});

module.exports = router;
