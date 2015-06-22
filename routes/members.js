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
	if (req.session.user_id)
		res.render('main', {title:'Trip Master'});
	else
		res.redirect('/');
});

router.get('/join', function(req, res, next){//members/join이 요청될때 처리
	res.render('join', {title:'회원가입'});
});

router.get('/login', function(req, res, next){
	res.render('login', {title:'로그인'});
});

router.get('/logout', function(req, res){
	delete req.session.user_id;
	res.render('processing', {title:'로그아웃 처리중입니다', content:'로그아웃이 처리되었습니다.', hr:'/'});
});

router.get('/write',function(req, res){
	if (req.session.user_id)
		res.render('write',{title:'글쓰기'})
	else
		res.redirect('/');
});

router.get('/list',function(req, res){
	if (req.session.user_id)
		res.redirect('list/1');
	else
		res.redirect('/');
});

router.get('/list/:page',function(req, res){
	if (!(req.session.user_id)){
		res.redirect('/');
		return;
	}
	var page = req.params.page;
	page = parseInt(page, 10);
	var size = 10;
	var begin = (page - 1) * size;
	pool.getConnection(function(err,conn){
		if(err) console.log('err',err);
		conn.query('select count(*) cnt from board',[],function(err, rows){
			if(err){
				console.log('err',err);
				conn.release();
				throw err;
			}
			var cnt = rows[0].cnt;
			var totalPage = Math.ceil(cnt / size);
			var pageSize = 10;
			var startPage = Math.floor((page - 1)/pageSize) * pageSize + 1;
			var endPage = startPage + (pageSize - 1);
			if(endPage > totalPage){
				endPage = totalPage;
			}
			var max = cnt - ((page - 1)*size);
			conn.query("select num, name, title, DATE_FORMAT(regdate, '%y-%m-%d %H:%i:%s') regdate, hit from board order by num desc limit ?,?",
			[begin,size],function(err, rows){
					if(err){
						console.log('err',err);
						conn.release();
						throw err;
					}
					var datas = {
						title : '게시판',
						data : rows,
						page : page,
						pageSize : pageSize,
						startPage : startPage,
						endPage : endPage,
						totalPage : totalPage,
						max : max,
						cnt : cnt
					};
					res.render('list',datas);
					conn.release();
				});
		});
	});
});

//수정된 부분!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
router.get('/post/:page',function(req, res){
	if (!(req.session.user_id)){
		res.redirect('/');
		return;
	}
	var page = req.params.page;
	page = parseInt(page, 10);
	pool.getConnection(function(err, conn){
		if(err){
			console.log('err',err);
			conn.release();
			throw err;
		}
		conn.query("select name, title, content from board where num = ?",[page],function(err, rows){
			if(err){
				console.log('err',err);
				conn.release();
				throw err;
			}
			res.render('post', {
				name : rows[0].name,
				title : rows[0].title,
				content : rows[0].content
			});
			conn.release();
		});
	});
});

router.post('/join', function(req, res, next){
	console.log('req.body', req.body);
	var id = req.body.id;
	var passwd = req.body.passwd;
	var name = req.body.name;
	var gender = req.body.gender;
	//var country = req.body.country;
	var birth = req.body.birth;

	if (!isStrNumEng(id) || !isStrNumEngSpe(passwd) || !isStrNum(birth) || !isValidLength(id, 7, 15) || !isValidLength(passwd, 7, 15) || !isValidLength(birth, 8, 8)){
		res.render('processing', {title:'회원가입 처리중입니다.', content:'잘못된 입력값입니다.', hr:'/'});
		return;
	}

	pool.getConnection(function(err,conn){
		if(err){
			console.log('err',err);
			res.render('processing', {title:'회원가입 처리중입니다', content:'회원가입 처리중 에러가 발생했습니다.', hr:'/'});
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
				res.render('processing_err', {title:'회원가입 처리중입니다', content:'이미 존재하는 id입니다.', hr:'/'});
				//res.render('index', {title:'홈페이지'});
				//res.send('회원가입 처리 중 에러 발생');
			});
			query.on('result', function(row){
				console.log('row', row);
				//res.send('회원가입이 완료되었습니다.');
				res.render('processing', {title:'회원가입 처리중입니다', content:'회원가입이 완료되었습니다.', hr:'/'});
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
			res.render('processing', {title:'로그인 처리중입니다', content:'로그인 처리중 에러 발생.', hr:'/'});
		});
		query.on('result', function(rows){
			console.log('rows', rows);
			if (rows['count(*)'] == 1){
				//res.send('로그인 성공');
				req.session.user_id = req.body.id;
				res.render("index", {title:"Trip Master"}); // modified
				//res.redirect('/members'); // origin
			}else{
				res.render('processing', {title:'로그인 처리중입니다', content:'회원정보가 없습니다.', hr:'/'}); // origin
				//res.send('회원정보가 없습니다.');
				//res.json({"result":"fail"});//모바일 서버 실패시
			}
			
			//var rsuid = (req.session.user_id)? true: false; // modified
			//req.render("index", {rsuid: rsuid}); // modified
		});
		conn.release();
	});
});


router.post('/write',function(req, res){
	console.log('req.body = ', req.body);
	var name = req.body.name;
	var pw = req.body.pw;
	var title = req.body.title;
	var content = req.body.content;
	if(name == undefined){
		router.redirect('/members');
	}
	pool.getConnection(function(err, conn){
		if(err) console.error('err',err);
		var sql = 'insert into board(pw, name, title, content, regdate, hit, good) values(?,?,?,?,now(),0,0)';
		conn.query(sql, [pw, name, title, content], function(err, row){
			if(err){
				console.error('err',err);
				conn.release();
				throw err;
			}
			console.log('row',row);
			if(row.affectedRows === 1){
				res.render('processing', {title:'게시글을 작성하는 중입니다.', content:'게시글이 작성되었습니다.', hr:'/members'});
			}
			else{
				res.render('processing', {title:'게시글을 작성하는 중입니다.', content:'게시글이 작성이 실패하였습니다.', hr:'/members'});
			}
			conn.release();
		});
	});
});

module.exports = router;
