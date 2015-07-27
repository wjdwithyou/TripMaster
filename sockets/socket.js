// io.sockets 혹은 io <- '/' 네임스페이스
// io.of('네임스페이스') <- 다른 네임스페이스에서의 메시지 처리
// socket <- 디폴트로 '/' 에 속함. 클라이언트와 소통하기 위한 기본 클래스

// on 방법
// socket.on()

// emit 방법
// socket.emit() -> 가장 기본. 현재 서버와 소통하는 클라이언트에게 메이지를 보냄.
// io.sockets.emit() -> 모든 클라이언트에게 메시지를 보냄.
// socket.broadcast.emit() -> 현재 서버와 소통하는 클라이언트를 제외하고, 나머지 클라이언트들에게 보냄.
// io.sockets.sockets[num].emit() -> num 이라는 소켓id 를 지닌 클라이언트에게 메시지를 보냄.

// 방 생성
// socket.join(방의 이름[, function(err){}]) -> 현재 서버와 소통하는 클라이언트를 방에 집어 넣음.
// io.sockets.in(방의 이름) -> 현재 방에 있는 클라이언트들 추출.
// socket.leave(방의 이름[, function(err){}]) -> 클라이언트를 방에서 퇴출.
// 활용 ->  io.sockets.in(방의 이름).emit() -> 현재 방에 있는 클라이언트들에게 메시지를 보냄.

var fs = require('fs');
var ejs = require('ejs');
var mysql = require('mysql');

var pool = mysql.createPool({
	host	:'localhost',
	user	:'root',
	password:'2014005041',
	database:'tripmaster',
	connectionLimit:20
});

//참고용 함수@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
function load_spotsearch(pool, socket, fs, ejs, pagenum){
	pool.getConnection(function(err, conn){
		if(err){
			console.log('err : ', err);
			conn.release();
			throw err;
		}
		
		conn.query("select * from spot limit ? , 10" , 10*(pagenum - 1), function(err, rows){
			if(err){
				console.log('err : ', err);
				conn.release();
				throw err;
			}
			
			var html = "";
			
			fs.readFile(__dirname + '/contents/spotsearch_spot.ejs', 'utf8', function (err, ejsdata){
				
				var rating = new Array();
				for(var i = 0; i < rows.length; i++)
				{
					for(var j = 0; j < 5; j++)
					{
						if(j < rows[i].rating)
							rating[4 - j] = "/image/coloredstar.png";
						else
							rating[4 - j] = "/image/emptystar.png";
					}
				
					html = html + ejs.render(ejsdata,
					{
						spot_id : 0,
						spot_name : rows[i].name,
						spot_rating : rating,
						spot_description : rows[i].description
					});
				}
			});
			
			fs.readFile(__dirname + '/contents/spotsearch_index.ejs', 'utf8', function (err, ejsdata){		
				conn.query('select count(*) cnt from spot', [], function(err, rows){
					if(err){
						console.log('err',err);
						conn.release();
						throw err;
					}
				
					var whole_pagenum = Math.ceil(rows[0].cnt / 10);
					
					html = html + ejs.render(ejsdata,
					{
						current_pagenum : pagenum,
						whole_pagenum : whole_pagenum
					});
					
					socket.emit('ReSpotsearchSearch',
					{
						html : html,
						current_pagenum : pagenum,
						whole_pagenum : whole_pagenum
					});
					conn.release();
				});
			});
		});
	});
}

var socket = function (server){
	var io = require('socket.io')(server);
	
	io.sockets.on('error', function(err){
		throw err;
	});
	
	io.sockets.on('connection', function(socket){
		console.log('a user connected');
		
		socket.on('disconnect', function(){
			console.log('a user disconnected');
		});
		
		socket.on('login', function(data){
			pool.getConnection(function(err, conn){
				var query = conn.query('select count(*) from user_info where id=? and passwd=?',[data.id, data.password]);
				query.on('error', function(err){
					console.log('err', err);
					socket.emit('socketError');
				});
				query.on('result', function(rows){
					console.log('rows', rows);
					if (rows['count(*)'] == 0){
						socket.emit('login', {success:false, user_id:'', user_key:''});
					}else {
						var html = "";

						fs.readFile(__dirname + '/header/header-div2.ejs', 'utf8', function (err, ejsdata){
							html = html + ejs.render(ejsdata, {user_id: data.id});
							
							/* 유저 키를 형성한다. */
							var user_key = "";
							for(var i = 0; i < 6; i++){
								user_key = user_key + (Math.floor(Math.random() * 10000) + 1);
							}
							conn.query('update user_info set temp_key = ? where id = ?',[user_key,data.id]);
							
							socket.emit('login', {success:true, user_id:data.id, user_key:user_key, html:html});
						});
					}
				});
				
				conn.release();
			});
		});

		socket.on('SignupRequest',function(data){
			console.log("받기는 했니?");
			pool.getConnection(function(err, conn){
				var query = conn.query('insert into user_info values(?,?,?,?,?,?)',[data.id, data.password, data.name, data.gender, data.birth, "none"]);
				query.on('error', function(err){
					console.log('err', err);
					socket.emit('socketError');
				});
				socket.emit('SignupRequest');
				conn.release();
			});
		});
		
		socket.on('isValidId', function(id){
			console.log('message come in');
			pool.getConnection(function(err, conn){
				var query = conn.query('select count(*) from user_info where id=?', [id]);
				query.on('error', function(err){
					console.log('err', err);
					socket.emit('socketError');
				});
				query.on('result', function(rows){
					console.log('rows', rows);
					if (rows['count(*)'] == 0){
						socket.emit('isValidId', {valid : true});
					}
					else socket.emit('isValidId', {valid: false});
				});
				conn.release();
			});
		});	

		socket.on('updateTagList', function(){
			pool.getConnection(function(err, conn){
				var query = conn.query('select name from tag_info', function(err, rows, field){
					if (err){
						console.log('err', err);
						socket.emit('socketError');
					}
					var reslist = [];
					console.log(rows);
					for (var i in rows){
						reslist.push(rows[i].name);
					}
					socket.emit('updateTagList', {list : reslist});
				});
				conn.release();
			});
		});
		
		/* init-slide- 메시지 : 탭 변화 시 작동 */
		socket.on('init-slide-community', function(data){
			pool.getConnection(function(err, conn){
				if(err){
					console.log('err : ', err);
					conn.release();
					throw err;
				}
				
				fs.readFile(__dirname + '/community/community-slide1-header.ejs', 'utf8', function (err, ejsdata){
					html = html + ejs.render(ejsdata,{/*이곳에 유저코드를 넘겨 줘야된다.*/});
				});
				
				fs.readFile(__dirname + '/community/community-slide1-post.ejs', 'utf8', function (err, ejsdata){
					//conn.query("select * from spot limit ? , 10" , 10*(pagenum - 1), function(err, rows){
						html = html + ejs.render(ejsdata,{/**/});
					//});
				});
				
				fs.readFile(__dirname + '/community/community-slide1-writebutton.ejs', 'utf8', function (err, ejsdata){
					html = html + ejs.render(ejsdata,{/*이곳에 유저코드를 넘겨 줘야된다. 어디에 글이 작성되게 될지.*/});
				});
			});
		});
		
		
		
		
	});
	
	return io;
};

module.exports = socket;
