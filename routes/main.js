var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('main/main', { title: 'Trip Master', bUserLogin:((req.session.user_id) ? true : false)});
});

router.get('/top', function(req, res, next){
	if (req.session.user_id)
		res.render('main/top', {bUserLogin: true} );
	else
		res.render('main/top', {bUserLogin: false} );
//	res.render('main/top');
});

router.get('/body', function(req, res, next){
	if (req.session.user_id)
		res.render('main/body', {bUserLogin: true} );
	else
		res.render('main/body', {bUserLogin: false} );
	//res.render('main/body');
});

router.get('/left', function(req, res, next){
	if (req.session.user_id)
		res.render('main/left', {bUserLogin: true} );
	else
		res.render('main/left', {bUserLogin: false} );
});
router.get('/right', function(req, res, next){
	if (req.session.user_id)
		res.render('main/right', {bUserLogin: true} );
	else
		res.render('main/right', {bUserLogin: false} );
});
router.get('/bottom', function(req, res, next){
	if (req.session.user_id)
		res.render('main/bottom', {bUserLogin: true} );
	else
		res.render('main/bottom', {bUserLogin: false} );
});

module.exports = router;
