var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

//new
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var fs2 = require('fs');
//사진 업로드
//var multer = require('multer');

var index = require('./routes/index');
var main = require('./routes/main');

var app = express();

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
//app.use(multer({dest: './uploads'}));

app.get('/*', function(req, res, next){
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	next();	
});

app.use('/', index);
app.use('/main', main);

//////////////////////////////
// file upload

// public/spot/profile 폴더가 있어야 동작함
// public/spot/default.jpg 가 있어야 동작함.
// 상기 폴더에 각자의 아이디로 이미지가 저장됨(확장자 없이)

// 150903
// 확장자는 jpg, jpeg, png, bmp, gif로 제한
// 파일 크기는 4MB로 제한

// TODO
// 파일 올리고 다시 원래 화면으로 돌아오는거.. 몰라서 일단은 /main으로 redirect해놨음..
// main 에서 오는 post 메시지에 대한 콜백. profile 사진을 받아서 저장. profile 사진이 지정되어있지 않으면 default.jpg 로 대체함.
app.post('/main', multipartMiddleware, function(req, res){
	var fileName = req.files.file.name;
	var path = __dirname + "/public/spot/";
	var src = (fileName)? req.files.file.path: path+"default.jpg";
	
	path += "profile/" + req.body.openedSpotId;
	
	fs2.readFile(src, function(err, data){
		fs2.writeFile(path, data, function(err){
			res.redirect('/main');
		});
	});
});

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
