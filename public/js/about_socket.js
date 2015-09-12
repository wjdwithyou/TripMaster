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
	socket.on('GetNewSpotId',function(data){
		callback_GetNewSpotId(data);
	});
	socket.on('Save',function(){
		socketDisconnect();
	});
	socket.on('GetSpots',function(data){
		callback_GetSpots(data);
	});
	socket.on('GetSpotContent',function(data){
		callback_GetSpotContent(data);
	});
	socket.on('GetSpotReviewContent',function(data){
		callback_GetSpotReviewContent(data);
	});
	socket.on('SaveSpotReview',function(){
		callback_SaveSpotReview();
	});
}
