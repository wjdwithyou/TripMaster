var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var multipart = require('connect-multiparty');

var fs2 = require('fs');

var index = require('./routes/index');
var main = require('./routes/main');

var app = express();
var multipartMiddleware = multipart();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
	secret:"random secret value",
	cookie:{ maxAge:10*60*1000, httpOnly:true},//Cookie Expires 10 minutes.
	//cookie:{ path:'/', expires:false, secure:true, httpOnly:true },
	resave: false,
	rolling: true,
	saveUninitialized: true
}));

app.get('/*', function(req, res, next){
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	next();	
});

app.use('/', index);
app.use('/main', main);

//////////////////////////////
// file upload

// public/image/profile 폴더가 있어야 동작함
// 상기 폴더에 각자의 아이디로 이미지가 저장됨(확장자 없이)

// 150824
// 확장자는 jpg, jpeg, png, bmp, gif로 제한
// 파일 크기는 4MB로 제한

// TODO
// 파일 올리고 다시 원래 화면으로 돌아오는거.. 몰라서 일단은 /main으로 redirect해놨음..

app.post('/upload', multipartMiddleware, function(req, res){
	//console.log(req);
	fs2.readFile(req.files.file.path, function(err, data){
		var fileName = req.files.file.name;
		
		if (!fileName){
			res.end();
		} else{
			var Path = __dirname + "/public/image/profile/" + req.body.user;
			
			fs2.writeFile(Path, data, function(err){
				res.redirect('/main');
			});
		}
	});
});
//////////////////////////////

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
