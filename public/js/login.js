function login(){
	var login_id = $("#login-id").val();
	var login_password = $("#login-password").val();
	socketConnect();
	socket.emit('login',{id:login_id, password:login_password});
}

function callback_login(data){
	if(data.success){
		user_id = data.user_id;
		user_key = data.user_key;
		$("#logincover").toggle( "slide", 600);
	}else{
		alert("아이디 혹은 비밀번호를 잘못 입력하셨습니다.");
		$("#login-id").val("");
		$("#login-password").val("");
	}
};
