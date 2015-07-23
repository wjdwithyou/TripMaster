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