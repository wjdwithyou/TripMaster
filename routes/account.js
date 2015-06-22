var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var pool = mysql.createPool({
	host	:'localhost',
	user	:'root',
	password:'5dnjfekf!',
	database:'tripmaster',
	connectionLimit:20
});

function isValidLength(str, l, r){ return (str.length >= l && str.length <= r); }
function isNum(charCode){ return (charCode >= 48 && charCode <= 57); }
function isEng(charCode){ return (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122); }
function isSpe(charCode){
	return (charCode >= 33 && charCode <= 47) || (charCode >= 58 && charCode <= 64) ||
		(charCode >= 91 && charCode <= 96) || (charCode >= 123 && charCode <= 126);
}
function isStrNumEng(str){
	var len = str.length;
	var ch;
	for (var i = 0; i < len; i++){
		ch = str.charCodeAt(i);
		if (!isNum(ch) && !isEng(ch))
			return false;
	}
	return true;
}

function isStrNum(str){
	var len = str.length;
	var ch;
	for (var i = 0; i < len; i++){
		ch = str.charCodeAt(i);
		if (!isNum(ch))
			return false;
	}
	return true;
}

function isStrNumEngSpe(str){
	var len = str.length;
	var ch;
	for (var i = 0; i < len; i++){
		ch = str.charCodeAt(i);
		if (!isNum(ch) && !isEng(ch) && !isSpe(ch))
			return false;
	}
	return true;
}

router.get('/',function(req, res){
	res.redirect('/main');
});

router.get('/signup', function(req, res, next){//members/join이 요청될때 처리
	res.render('account/signup', {title:'회원가입'});
});

router.get('/login', function(req, res, next){
	res.render('account/login', {title:'로그인'});
});

router.get('/logout', function(req, res){
	delete req.session.user_id;
	res.render('processing', {title:'로그아웃 처리중입니다', content:'로그아웃이 처리되었습니다.', hr:'/main'});
});

router.post('/signup', function(req, res, next){
	console.log('req.body', req.body);
	var id = req.body.id;
	var passwd = req.body.passwd;
	var name = req.body.name;
	var gender = req.body.gender;
	//var country = req.body.country;
	var birth = req.body.birth;

	if (!isStrNumEng(id) || !isStrNumEngSpe(passwd) || !isStrNum(birth) || !isValidLength(id, 7, 15) || !isValidLength(passwd, 7, 15) || !isValidLength(birth, 8, 8)){
		res.render('processing', {title:'회원가입 처리중입니다.', content:'잘못된 입력값입니다.', hr:'/main'});
		return;
	}

	pool.getConnection(function(err,conn){
		if(err){
			console.log('err',err);
			res.render('processing', {title:'회원가입 처리중입니다', content:'회원가입 처리중 에러가 발생했습니다.', hr:'/main'});
			conn.release();
		}
		else{
			console.log('conn',conn);
			var sql = "insert into user_info values(?,?,?,?,?)";
			var data = [id, passwd, name, gender, birth];
			var query = conn.query(sql, data);
			query.on('error', function(err){
				console.log('err', err);
				//res.json(err);
				res.render('processing', {title:'회원가입 처리중입니다', content:'이미 존재하는 id입니다.', hr:'/main'});
				//res.render('index', {title:'홈페이지'});
				//res.send('회원가입 처리 중 에러 발생');
			});
			query.on('result', function(row){
				console.log('row', row);
				//res.send('회원가입이 완료되었습니다.');
				res.render('processing', {title:'회원가입 처리중입니다', content:'회원가입이 완료되었습니다.', hr:'/main'});
				//res.render('index', {title:'홈페이지'});
			});
			query.on('end', function(result){
				console.log('OK');
				//res.json(req.body);
			});
			conn.release();
			//res.json(req.body);
			//res.send('회원가입이 완료되었습니다.');
		}
	});
});

router.post('/login', function(req, res, next){
	console.log('req.body', req.body);
	pool.getConnection(function(err, conn){
		var query=conn.query('select count(*) from user_info where id=? and passwd=?', [req.body.id,req.body.passwd]);
		query.on('error', function(err){
			console.log('err', err);
			//res.send('로그인 처리중 에러 발생');
			res.render('processing', {title:'로그인 처리중입니다', content:'로그인 처리중 에러 발생.', hr:'/main'});
		});
		query.on('result', function(rows){
			console.log('rows', rows);
			if (rows['count(*)'] == 1){
				//res.send('로그인 성공');
				req.session.user_id = req.body.id;
				res.redirect("/main"); // modified
				//res.render("main/main", {title:"Trip Master"}); // modified
				//res.redirect('/members'); // origin
			}else{
				res.render('processing', {title:'로그인 처리중입니다', content:'회원정보가 없습니다.', hr:'/main'}); // origin
				//res.send('회원정보가 없습니다.');
				//res.json({"result":"fail"});//모바일 서버 실패시
			}
			
			//var rsuid = (req.session.user_id)? true: false; // modified
			//req.render("index", {rsuid: rsuid}); // modified
		});
		conn.release();
	});
});

module.exports = router;