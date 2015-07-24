function socketConnect(){
	socketCnt++;
	//alert('connect => ' + socketCnt);
	if (socketCnt == 1){
		if (socket){
			socket.connect();
		}
		else{
			socket = io();
			socketInit();
		}
	}
}

function socketDisconnect(){
	socketCnt--;
	//alert('disconnect => ' + socketCnt);
	if (!socketCnt)
		socket.disconnect();
}

function socketInit(){
	socket.on('isValidId', function( data ){
		callback_isValidId( data );
	});
	socket.on('updateTagList', function( data ){
		callback_updateTagList( data );
	});
	socket.on('SignupRequest', function (){
		callback_SignupRequest();
	});
	socket.on('login', function(data){
		callback_login( data );
	});
}
