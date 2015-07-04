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
	});
	
	return io;
};

module.exports = socket;