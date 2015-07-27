function PostRoomSearch(data){
	var nickname = "";
	switch(data){
		case "mine":
			nickname = user_id;
			break;
		case "search":
			nickname = $("#postroom-searchbar").val();
			break;
	}
	console.log("aaa");
	socketConnect();
	socket.emit('InitSlideCommunity', nickname);
}
function callback_InitSlideCommunity(data){
	$('#slide1').html(data.slide1);
	$('#slide2').html(data.slide2);
	socketDisconnect();
	resize();
}