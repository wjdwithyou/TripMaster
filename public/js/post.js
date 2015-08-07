function PostRoomSearch(data){
	var nickname = "";
	switch(data){
		case "mine":
			nickname = user_id;
			break;
		case "basic":
			nickname = postroom_nickname;
			break;
		case "search":
			nickname = $("#postroom-searchbar").val();
			break;
	}
	console.log("aaa");
	socketConnect();
	socket.emit('InitSlideCommunity', {nickname:nickname, user_id:user_id});
}
function callback_InitSlideCommunity(data){
	postroom_nickname = data.nickname;
	$('#slide1').html(data.slide1);
	$('#slide2').html(data.slide2);
	$("#postroom-searchbar").val(data.nickname);
	socketDisconnect();
	resize();
}

function WritePost(){
	ToggleSlide("#slide2");
	opened_slide_num++;
	setTimeout(function() {
		post_editor_config.editor_selector = "post-editor";
		opened_editor_class = "post-editor";
		tinymce.init(post_editor_config);
	}, slide_speed + 10);
}

function PostSubmit(){
	var postroom_owner = $("#postroom-owner").val();
	var post = tinyMCE.activeEditor.getContent({format : 'raw'});
	socketConnect();
	socket.emit('PostSubmit', {writer:user_id, postroom_owner:postroom_owner, content:post});
}
function callback_PostSubmit(data){
	socketDisconnect();
	ToggleSlide("#slide2");
	opened_slide_num--;
	PostRoomSearch('basic');
}