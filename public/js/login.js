function login(){
	var login_nickname = $("#login-nickname").val();
	
	socketConnect();
	
	socket.emit('login', {nickname:login_nickname});
}

function callback_login(data){
	if(data.success){
		user_nickname = data.user_nickname;
		
		$("#login-nickname").val("");

		$("#header-div1").toggle("blind");
		$("#header-div2").toggle("blind");
		
		$("#header-div2").html(data.html);
	} else{
		alert("닉네임을 입력해주세요.");
		
		$("#login-nickname").val("");
	}
	
	socketDisconnect();
}

function logout(){
	user_nickname = "";
	
	$("#login-nickname").val("");
	
	$("#header-div2").toggle("blind");
	$("#header-div1").toggle("blind");
}