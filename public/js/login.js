function login(){
	var login_id = $("#login-id").val();
	var login_password = $("#login-password").val();
	
	socketConnect();
	
	socket.emit('login',{id:login_id, password:login_password});
}

function callback_login(data){
	if(data.success){
		console.log(data.html);
		user_id = data.user_id;
		
		$("#login-id").val('');
		$("#login-password").val('');

		$("#floating-div1").toggle('clip');
		$("#floating-div2").toggle('clip');
		
		$("#floating-div2").html(data.html);
	} else{
		alert("아이디 혹은 비밀번호를 잘못 입력하셨습니다.");
		
		$("#login-id").val('');
		$("#login-password").val('');
	}
	
	socketDisconnect();
}

function logout(){
	user_id = '';
	user_key = '';
	
	$("#login-id").val('');
	$("#login-password").val('');
	
	$("#floating-div2").toggle('clip');
	$("#floating-div1").toggle('clip');
}