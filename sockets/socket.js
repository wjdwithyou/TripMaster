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
		
		// 새로 추가할 여행지의 위도 경도를 받아오고, 여행지에 대한 내용들을 default 값들로 설정. 이후 여행지의 id 를 리턴.
		socket.on('GetNewSpotId', function(data){
			pool.getConnection(function(err, conn){
				if(err){
					console.log('err : ', err);
					conn.release();
					throw err;
				}
				// 위도 경도 스팟의 이름 스팟의 종류 (디폴트 값은 '')
				conn.query('insert into spot (latitude, longitude, spotname, spotkind) values(?,?,?,?)',[data.g, data.k, '', '']);
				conn.query("select id from spot order by id desc limit 1" , [], function(err, rows){
					// public/spot 폴더 안에 있는 description , tip , profile 폴더에 각각 디폴트 파일을 만듬.
					// 아무런 내용없는 txt 와 profile 사진(default.jpg) 가 여행지의 id.txt 혹은 id 라는 이름으로 형성됨.
					fs.writeFile(__dirname + '/../public/spot/description/'+rows[0].id+'.txt','','utf8',function(err){
					});
					fs.writeFile(__dirname + '/../public/spot/tip/'+rows[0].id+'.txt','','utf8',function(err){
					});
					fs.readFile(__dirname + '/../public/spot/default.jpg', function(err, img_data){
						fs.writeFile(__dirname + '/../public/spot/profile/'+rows[0].id, img_data, function(err){
						});
					});
					socket.emit('GetNewSpotId',rows[0].id);
				});
				conn.release();
			});
		});
		
		// 여행지 내용에 저장버튼이 눌렸을때, spot.js 에서 보내는 메시지에 대한 콜백함수.
		socket.on('Save', function(data){
			// 어떤 내용을 저장하려는 건지 분류.
			switch(data.kind){
				case 'basic' :
					pool.getConnection(function(err, conn){
						if(err){
							console.log('err : ', err);
							conn.release();
							throw err;
						}
						conn.query('update spot set spotname = ?, spotkind = ? where id = ?',[data.content.name, data.content.kind, data.spotId]);
						console.log('스팟 제목 쓰기 완료');
						conn.release();
					});
					break;
				case 'description' :
					fs.writeFile(__dirname + '/../public/spot/description/'+data.spotId+'.txt',data.content,'utf8',function(err){
						console.log('스팟 설명 쓰기 완료');
					});
					break;
				case 'tip' :
					fs.writeFile(__dirname + '/../public/spot/tip/'+data.spotId+'.txt',data.content,'utf8',function(err){
						console.log('스팟 팁 쓰기 완료');
					});
					break;
				case 'tag' :
					fs.writeFile(__dirname + '/../public/spot/tag/'+data.spotId+'.txt',data.content,'utf8',function(err){
						console.log(data.content);
						console.log('스팟 태그 쓰기 완료');
					});
					break;
			}
			socket.emit('Save');
		});
		
		// 사이트의 마커들을 찍을때, 어떤 여행지들이 있는지 요청하며 보내는 메시지에 대한 콜백함수.
		socket.on('GetSpots', function(){
			pool.getConnection(function(err, conn){
				if(err){
					console.log('err : ', err);
					conn.release();
					throw err;
				}
				// 현재 분류기능은 안만들었기에 spot 테이블 안의 모든 요소를 불러옴.
				conn.query("select * from spot" , [], function(err, rows){
					socket.emit('GetSpots', rows);//id 위도 경도 이름 분류
				});
				conn.release();
			});
		});
		
		// 특정 스팟의 내용을 불러올때 발생하는 메시지. data 로 내용을 보내주어야하는 여행지의 id 를 받음.
		socket.on('GetSpotContent', function(data){
			pool.getConnection(function(err, conn){
				if(err){
					console.log('err : ', err);
					conn.release();
					throw err;
				}
				conn.query("select * from spot where id = ?" , [data], function(err, rows){
					fs.readFile(__dirname + '/../public/spot/description/'+data+'.txt', 'utf8', function (err, desc){
						fs.readFile(__dirname + '/../public/spot/tip/'+data+'.txt', 'utf8', function (err, tip){
							fs.readFile(__dirname + '/../public/spot/tag/'+data+'.txt', 'utf8', function (err, tag){
								console.log(rows[0].spotkind);
								console.log(tag);
								socket.emit('GetSpotContent',{name:rows[0].spotname, kind:rows[0].spotkind, desc:desc, tip:tip, tag:tag});
							});
						});
					});
				});
				conn.release();
			});
		});
	});
	
	return io;
};

module.exports = socket;
