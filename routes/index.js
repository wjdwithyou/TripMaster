var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.redirect('/main');
});

router.get('/googlemap', function(req, res, next){
	res.render('googlemap', {title:'hello googlemap'});
});

router.get('/upload', function(req, res, next){
	res.render('upload', {title:"upload file example"});
});

module.exports = router;
