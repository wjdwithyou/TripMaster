var fs = require('fs');
var ejs = require('ejs');
var mysql = require('mysql');
var underscore = require('underscore');
/*var exec = require('child_process').execFile;
var fun =function(){
   console.log("fun() start");
   exec('HelloJithin.exe', function(err, data) {  
        console.log(err)
        console.log(data.toString());                       
    });  
}
fun();*/

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
		console.log(socket.request.connection.remoteAddress + ' connected');
		
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
				conn.query('insert into spot (latitude, longitude, spotname, spotkind, score, scorednum) values(?,?,?,?,?,?)',[data.g, data.k, '', '',0,0]);
				conn.query("select id from spot order by id desc limit 1" , [], function(err, rows){
					// public/spot 폴더 안에 있는 description , tip , profile 폴더에 각각 디폴트 파일을 만듬.
					// 아무런 내용없는 txt 와 profile 사진(default.jpg) 가 여행지의 id.txt 혹은 id 라는 이름으로 형성됨.
					fs.writeFile(__dirname + '/../public/spot/description/'+rows[0].id+'.txt','','utf8',function(err){
					});
					fs.writeFile(__dirname + '/../public/spot/tip/'+rows[0].id+'.txt','','utf8',function(err){
					});
					fs.writeFile(__dirname + '/../public/spot/tag/'+rows[0].id+'.txt','','utf8',function(err){
					});
					fs.readFile(__dirname + '/../public/spot/default.jpg', function(err, img_data){
						fs.writeFile(__dirname + '/../public/spot/profile/'+rows[0].id, img_data, function(err){
						});
					});
					conn.query("insert into tag_spot (tag, spotId) values(?,?)",['',rows[0].id]);
					socket.emit('GetNewSpotId',rows[0].id);
				});
				conn.release();
			});
		});
		
		// 여행지 내용에 저장버튼이 눌렸을때, spot.js 에서 보내는 메시지에 대한 콜백함수.
		socket.on('Save', function(data){
			// 어떤 내용을 저장하려는 건지 분류.
			pool.getConnection(function(err, conn){
				if(err){
					console.log('err : ', err);
					conn.release();
					throw err;
				}
				
				conn.query('update spot set lastModifier = ? where id = ?',[socket.request.connection.remoteAddress, data.spotId]);
				console.log(data.spotId + '스팟의 마지막 수정자 : ' + socket.request.connection.remoteAddress);
				conn.release();
			});
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

					var tagWithoutSpace = data.content.split(' ');
					var tagParser;
					var parsedTag;

					pool.getConnection(function(err, conn){
						if(err){
							console.log('err : ', err);
							conn.release();
							throw err;
						}
						for (var i = 0; i < tagWithoutSpace.length; i++){
							tagParser = tagWithoutSpace[i].split('#');
							for (var j = 0; j < tagParser.length; j++){
								if (tagParser[j] != ''){
									dupChk = false;
									parsedTag = tagParser[j];
									console.log(parsedTag);
									conn.query('insert ignore into tag_spot (tag, spotId) values(?,?)',[parsedTag, data.spotId]);
										/*conn.query('select count(*) as dupCnt from tag_spot where (tag=? and spotId=?)', [parsedTag, data.spotId], function(err, rows){
											console.log(parsedTag + '등록 도전');
											if (rows[0].dupCnt == 0){
												console.log(parsedTag + '등록 완료');
												conn.query('insert into tag_spot (tag, spotId) values(?,?)',[parsedTag, data.spotId]);
											}
										});*/
								}
							}
						}
						conn.release();
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
		
		socket.on('GetSpotReviewContent', function(data){
			pool.getConnection(function(err, conn){
				if(err){
					console.log('err : ', err);
					conn.release();
					throw err;
				}
				conn.query("select * from spotreview where id = ?", [data], function(err, rows){
					socket.emit('GetSpotReviewContent',rows);
				});
				conn.release();
			});
		});
		
		socket.on('SaveSpotReview', function(data){
			pool.getConnection(function(err, conn){
				if(err){
					console.log('err : ', err);
					conn.release();
					throw err;
				}
				conn.query("insert into spotreview (id, ip, score, content) values(?,?,?,?)", [data.id,  socket.request.connection.remoteAddress, data.score, data.content]);
				conn.query("select * from spot where id = ?", [data.id], function(err, rows){
					conn.query("update spot set score = ? ,scorednum = ? where id = ?", [rows[0].score+parseInt(data.score),rows[0].scorednum+1,data.id]);
					socket.emit('SaveSpotReview');
					conn.release();
				});
				
			});
		});
		
		socket.on('RecommendSpot', function(data){
			
			
			var tagWithoutSpace = data.tags.split(' ');
			var tagParser;
			var parsedTag;
			
			var wishtags = [];
			
			for (var i = 0; i < tagWithoutSpace.length; i++){
				tagParser = tagWithoutSpace[i].split('#');
				for (var j = 0; j < tagParser.length; j++){
					if (tagParser[j] != ''){
						dupChk = false;
						parsedTag = tagParser[j];
						console.log(parsedTag);
						wishtags.push(parsedTag);
					}
				}
			}
			
			var degree = parseInt(data.degree);
			
			wishtags.sort();
			var tagsNames;
			var tagscorewithid = {};
			pool.getConnection(function(err, conn){
				if(err){
					console.log('err : ', err);
					conn.release();
					throw err;
				}
				conn.query("select * from spot where (latitude between ? and ?) and (longitude between ? and ?)",[data.g - 0.007, data.g + 0.007, data.k - 0.007, data.k + 0.007],function(err, rows){
					var callbackCount = rows.length;
					if(callbackCount == 0){
						socket.emit('RecommendSpot');
					}
					for(var i in rows){
						rows[i].tagscore = 0;
						// 밑의 함수는 콜백함수를 실행하는 함수여서, 콜백함수가 실행되지 않아도 nodejs 는 블록 내부의 함수를 전부 실행한것으로 여기고 다음 루프문으로 넘어간다.
						conn.query("select * from tag_spot where spotId = ?",[rows[i].id],function(err, trows){
							callbackCount--;
							tagsNames = new Array();
							
							
							for(var j in trows){
								tagsNames.push(trows[j].tag);	//배열을 만들어서 그곳에 태그들을 막 넣는다,
							}
							tagsNames.sort();						 //배열안에 문자열들을 정렬한다.
							var sametagsnum = 0;					// 몇개의 태그가 같은가?
							for(var h in wishtags){					// 사용자가 원하는 태그와 비교해서 그 개수를 구한다.
								for(var m = 1; tagsNames[m] < wishtags[h] && m < tagsNames.length; m++){;}
								if( tagsNames[m] == wishtags[h]){sametagsnum++;}
							}
							
							var tagscore = 0;							// 여행지가 태그로인해 얻은 가산점
							if(wishtags.length > 0){
								tagscore = sametagsnum / wishtags.length;
							}
							tagscorewithid[trows[0].spotId] = tagscore;
								
							var mostbig_score = 0;
							if(callbackCount == 0){
								for(var a in rows){
									if(rows[a].scorednum > 0)
										rows[a].tagscore = rows[a].score/rows[a].scorednum + tagscorewithid[rows[a].id] * rows[a].score/rows[a].scorednum * degree / 5; // 여기에 이것저것 점수넣는다.
									else
										rows[a].tagscore = 0;
								}
								rows = underscore.sortBy(rows, 'tagscore');
								console.log(rows);
								conn.release();
								socket.emit('RecommendSpot', rows);
							}
						});
					}
				});
			});
		});
		
		socket.on('login', function(data){
			pool.getConnection(function(err, conn){
				var query = conn.query('select count(*) from user_info where id=? and passwd=?', [data.id, data.password]);
				
				query.on('error', function(err){
					console.log('err', err);
					socket.emit('socketError');
				});
				
				query.on('result', function(rows){
					console.log('rows', rows);
					
					if (rows['count(*)'] == 0)
						socket.emit('login', {success:false, user_id:'', user_key:''});
					else{
						var html = "";
						
						fs.readFile(__dirname + '/floating/floating-div2.ejs', 'utf-8', function(err, ejsdata){
							html = html + ejs.render(ejsdata, {user_id:data.id});
							
							var user_key = "";
							
							for(var i = 0; i < 6; ++i)
								user_key = user_key + (Math.floor(Math.random() * 10000) + 1);
							
							conn.query('update user_info set temp_key=? where id=?', [user_key, data.id]);

							socket.emit('login', {success:true, user_id:data.id, user_key:user_key, html:html});
						});
					}
						
				});
			});
		});
		
		socket.on('SignupRequest',function(data){
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
			pool.getConnection(function(err, conn){
				var query = conn.query('select count(*) from user_info where id=?', [id]);
				query.on('error', function(err){
					console.log('err', err);
					socket.emit('socketError');
				});
				query.on('result', function(rows){
					console.log('rows', rows);
					if (rows['count(*)'] == 0)
						socket.emit('isValidId', {valid : true});
					else
						socket.emit('isValidId', {valid: false});
				});
				conn.release();
			});
		});	

		socket.on('updateTagList', function(){
			pool.getConnection(function(err, conn){
				var query = conn.query('select tag from tag_spot', function(err, rows, field){
					if (err){
						console.log('err', err);
						socket.emit('socketError');
					}
					var reslist = [];

					console.log(rows);

					for (var i in rows)
						reslist.push(rows[i].tag);

					socket.emit('updateTagList', {list : reslist});
				});
				conn.release();
			});
		});
	});
	
	return io;
};

module.exports = socket;
