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
	password:'ryghkseoj7!4',
	database:'tripmaster',
	connectionLimit:20
});

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

function load_postsearch(pool, socket, fs, ejs, pagenum){
	pool.getConnection(function(err, conn){
		if(err){
			console.log('err: ', err);
			conn.release();
			throw err;
		}
		
		conn.query('select * from post order by no desc', function(err, rows){
		//conn.query("select * from post limit ? , 10" , 10*(pagenum - 1), function(err, rows){
			if(err){
				console.log('err: ', err);
				conn.release();
				throw err;
			}
			
			var html = "";

			fs.readFile(__dirname + '/contents/community_title.ejs', 'utf8', function(err, ejsdata){
				html = html + ejs.render(ejsdata,
				{
					post_no: "No",
					post_subject: "Subject",
					post_name: "Name",
					post_date: "Date",
					post_hits: "Hits",
				});
			});
			
			fs.readFile(__dirname + '/contents/community_post.ejs', 'utf8', function(err, ejsdata){
				for(var i = 0; i < rows.length; ++i){
					html = html + ejs.render(ejsdata,
					{
						post_no: rows[i].no,
						post_subject: rows[i].title,
						post_name: rows[i].name,
						post_date: rows[i].regdate,
						post_hits: rows[i].hit
					});
				}
			});
			
			fs.readFile(__dirname + '/contents/community_index.ejs', 'utf8', function (err, ejsdata){		
				conn.query('select count(*) cnt from post', [], function(err, rows){
					if(err){
						console.log('err', err);
						conn.release();
						throw err;
					}
				
					var whole_pagenum = Math.ceil(rows[0].cnt / 10);
					
					html = html + ejs.render(ejsdata,
					{
						current_pagenum : pagenum,
						whole_pagenum : whole_pagenum
					});
					
					socket.emit('ReCommunitySearch',
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
		
		// contents
		// data
		//	.dir			ejs 파일 위치
		socket.on('Contents', function (data){
			console.log("Contents receive", data.dir);
			fs.readFile(__dirname + data.dir, 'utf8', function (err, ejsdata){
				var html = ejs.render(ejsdata);
				socket.emit('Contents', html);
			});
		});
		
		// sidebar
		// data
		//	.dir			ejs 파일 위치
		socket.on('Sidebar', function (data){
			console.log("Sidebar receive", data.dir);
			fs.readFile(__dirname + data.dir, 'utf8', function (err, ejsdata){
				var html = ejs.render(ejsdata);
				socket.emit('Sidebar', html);
			});
		});
		
		// popup
		// data
		//	.dir			ejs 파일 위치
		// .type		ejs 파일 종류
		// .param		ejs 파일 렌더링 시 필요한 정보들
		socket.on('Popup', function (data){
			if(data.type == 'signup')
				fs.readFile(__dirname + data.dir, 'utf8', function (err, ejsdata){
					var html = ejs.render(ejsdata);
					socket.emit('Popup', html);
				});

			if (data.type == 'open_post'){
				pool.getConnection(function(err, conn){
					if (err){
						console.log('err: ', err);
						conn.release();
						throw err;
					}
					
					fs.readFile(__dirname + data.dir, 'utf8', function(err, ejsdata){
						conn.query("select name, title, content from post where no = ?", [data.param.n], function(err, rows){
							if (err){
								console.log('err: ', err);
								conn.release();
								throw err;
							}
							
							var html = ejs.render(ejsdata,
							{
								name: rows[0].name,
								title: rows[0].title,
								content: rows[0].content
							});
							
							socket.emit('Popup', html);

							conn.release();
						});
					});
				});
			}
			//type 에 따른 분류를 여기서합니다.
		});
		
		// spotsearch
		socket.on('SpotsearchSearch', function(spot_name){
			load_spotsearch(pool, socket, fs, ejs, 1);
		});
		
		socket.on('SpotsearchPageChange', function(spot_list_page){
			load_spotsearch(pool, socket, fs, ejs, spot_list_page);
		});

		// community
		socket.on('CommunitySearch', function(T){
			load_postsearch(pool, socket, fs, ejs, 1);
		});
		
		//login 
		socket.on('Login',function(data){
			console.log('message : Login');
			pool.getConnection(function(err, conn){
				var query = conn.query('select count(*) from user_info where id=? and passwd=?',[data.id, data.password]);
				query.on('error', function(err){
					console.log('err', err);
					socket.emit('socketError');
				});
				query.on('result', function(rows){
					console.log('rows', rows);
					if (rows['count(*)'] == 0){
						socket.emit('Login', false);
					}
					else socket.emit('Login', true);
				});
				conn.release();
			});
		});
		
		// signup
		socket.on('SignupRequest',function(data){
			console.log("받기는 했니?");
			pool.getConnection(function(err, conn){
				var query = conn.query('insert into user_info values(?,?,?,?,?)',[data.id, data.password, data.name, data.gender, data.birth]);
				query.on('error', function(err){
					console.log('err', err);
					socket.emit('socketError');
				});
				socket.emit('SignupRequest');
				conn.release();
			});
		});
		
		socket.on('isValidId', function(id){
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
		
		socket.on('disconnect', function(){
			console.log('a user disconnected');
		});
	});
	
	return io;
};

module.exports = socket;
