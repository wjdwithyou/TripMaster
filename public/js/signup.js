function signup() {
	$("#signup-background").toggle("blind");
}

function signup_cancel(){
	$("#signup-id").val("");
	$("#signup-passwd").val("");
	$("#signup-passwd2").val("")
	$("#signup-name").val("");
	$("#signup-birth").val("");
	$("div.signup_interesting_frame").detach();
	var button = document.getElementById('signup-man');
	button.style.color = "rgb(169,169,169)";
	button.style.border = "1px solid lightgray";
	button = document.getElementById('signup-woman');
	button.style.color = "rgb(169,169,169)";
	button.style.border = "1px solid lightgray";
	$("#signup-background").toggle("blind");
}

var gender = "none";
var temp_id = "";

function isValidLength(str, l, r){ return (str.length >= l && str.length <= r); }
function isNum(charCode){ return (charCode >= 48 && charCode <= 57); }
function isEng(charCode){ return (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122); }
function isSpe(charCode){
	return (charCode >= 33 && charCode <= 47) || (charCode >= 58 && charCode <= 64) ||
		(charCode >= 91 && charCode <= 96) || (charCode >= 123 && charCode <= 126);
}
function isStrNumEngSpe(str){
	var len = str.length;
	var ch;
	for (var i = 0; i < len; i++){
		ch = str.charCodeAt(i);
		if (!isNum(ch) && !isEng(ch) && !isSpe(ch))
			return false;
	}
	return true;
}
function isStrNumEng(str){
	var len = str.length;
	var ch;
	for (var i = 0; i < len; i++){
		ch = str.charCodeAt(i);
		if (!isNum(ch) && !isEng(ch))
			return false;
	}
	return true;
}
function isStrNum(str){
	var len = str.length;
	var ch;
	for (var i = 0; i < len; i++){
		ch = str.charCodeAt(i);
		if (!isNum(ch))
			return false;
	}
	return true;
}

$(function(){
	$("#signup-isValid").click(function(){
		console.log("눌림");
		temp_id = $("#signup-id").val();
		if(temp_id == ""){
			alert("아이디를 꼭 입력하세요");
			$("#signup-id").focus();
			return;
		}
		if (!isStrNumEng($("#signup-id").val()) || !isValidLength($("#signup-id").val(), 7,15)){
			alert("형식에 맞지 않는 아이디입니다.");
			$("#signup-id").val("");
			$("#signup-id").focus();
			return;
		}
		validIdCheck();
	});

	$("#signup-man").click(function(){
		gender = "man";
		var button = document.getElementById('signup-man');
		button.style.color = "#0099dd";
		button.style.border = "1px solid #0099dd";
		button = document.getElementById('signup-woman');
		button.style.color = "rgb(169,169,169)";
		button.style.border = "1px solid lightgray";
	});
	
	$("#signup-woman").click(function(){
		gender = "woman";
		var button = document.getElementById('signup-man');
		button.style.color = "rgb(169,169,169)";
		button.style.border = "1px solid lightgray";
		button = document.getElementById('signup-woman');
		button.style.color = "#0099dd";
		button.style.border = "1px solid #0099dd";
	});

	$("#signup-addtag").click(function(){
		$("#signup-tag").append("<div class='signup_interesting_frame'><input type='checkbox' name='chkDelTag' class = 'signup_interesting'/><input type='text' maxlength='30' name = 'taglist' placeholder = '당신의 관심분야는?'/></div>");
		updateTagList();
	});
	
	$("#signup-deltag").click(function(){
		var i = $("input[name=chkDelTag]:checked").each(function(){
			$(this).parent().remove();
		});
	});
	
	$("#signupButton").click(function(){
		console.log("ssss");
		signup_submit();
	});
});

function signup_submit(){
	if ($("#signup-id").val()==""){
		alert("아이디를 꼭 입력하세요");
		$("#signup-id").focus();
		return;
	}
	if ($("#signup-passwd").val()==""){
		alert("비밀번호를 꼭 입력하세요");
		$("#signup-passwd").focus();
		return;
	}
	if ($("#signup-passwd2").val()==""){
		alert("비밀번호확인란을 꼭 입력하세요");
		$("#signup-passwd2").focus();
		return;
	}
	if($("#signup-name").val()==""){
		alert("이름을 꼭 입력하세요");
		$("#signup-name").focus();
		return;
	}
	if (gender=="none"){
		alert("성별을 꼭 입력하세요");
		$("#signup-gender").focus();
		return;
	}
	if ($("#signup-birth").val()==""){
		alert("생년월일을 꼭 입력하세요");
		$("#signup-birth").focus();
		return;
	}
	if (isNaN($("#signup-birth").val())){
		alert("생년월일을 숫자로만 입력하세요");
		$("#signup-birth").val("");
		$("#signup-birth").focus();
		return;
	}
	if ($("#signup-passwd").val() !== $("#signup-passwd2").val()){
		alert("비밀번호가 일치하지 않습니다.");
		$("#signup-passwd").focus();
		return;
	}
	if (($("#signup-birth").val().charAt(0) != '1' && $("#signup-birth").val().charAt(0) != '2') ||
		($("#signup-birth").val().charAt(4) != '0' && $("#signup-birth").val().charAt(4) != '1') ||
		($("#signup-birth").val().charAt(6) < '0' || $("#signup-birth").val().charAt(6) > '3') || 
		!isStrNum($("#signup-birth").val()) || !isValidLength($("#signup-birth").val(), 8,8)){
		alert("형식에 맞지 않는 생년월일입니다.");
		$("#signup-birth").val("");
		$("#signup-birth").focus();
		return;
	}
	if (!isStrNumEngSpe($("#signup-passwd").val()) || !isValidLength($("#signup-passwd").val(), 7, 15)){
		alert("형식에 맞지 않는 비밀번호입니다.");
		$("#signup-passwd").val("");
		$("#signup-passwd").focus();
		return;
	}
	
	//중복 체크를 안했거나, 중복 체크 후 아이디를 바꿨을 경우
	if(temp_id == "" || temp_id != $("#signup-id").val()){
		alert("중복 확인을 해주세요.");
		$("#signup-id").focus();
		temp_id = "";
		return;
	}
	
	var id = $("#signup-id").val();
	var password = $("#signup-passwd").val();
	var name = $("#signup-name").val();
	var birth = $("#signup-birth").val();
	
	socketConnect();
	
	socket.emit('SignupRequest', {
		id : id,
		password : password,
		gender : gender,
		name : name,
		birth : birth
	});
}
function callback_SignupRequest() {
	$("#signup-id").val("");
	$("#signup-passwd").val("");
	$("#signup-passwd2").val("")
	$("#signup-name").val("");
	$("#signup-birth").val("");
	$("div.signup_interesting_frame").detach();
	var button = document.getElementById('signup-man');
	button.style.color = "rgb(169,169,169)";
	button.style.border = "1px solid lightgray";
	button = document.getElementById('signup-woman');
	button.style.color = "rgb(169,169,169)";
	button.style.border = "1px solid lightgray";
	socketDisconnect();
}

function updateTagList(){
	socketConnect();
	socket.emit('updateTagList');
}
function callback_updateTagList(result){
	$("input[name=taglist]").each(function(){
		$(this).autocomplete({
			source: result.list
		});
	});
	socketDisconnect();
}


function validIdCheck(){
	socketConnect();
	socket.emit('isValidId', $("#signup-id").val());
}
function callback_isValidId (result) {
	if (result.valid)
		alert("사용 가능한 아이디 입니다.");
	else{
		alert("중복된 아이디 입니다.");
		temp_id = "";
	}
	socketDisconnect();
	console.log('처리완료');
}