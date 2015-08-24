function OpenProfile(){
	$("#profile-background").toggle("blind");

	$("#profile-hidden-user-id").val(user_id);
}

function CloseProfile(){
	// impl.
	$("#profile-background").toggle("blind");
}

function CheckFileSize(objFile){
	var max = 4 * 1024 * 1024; // 4MB
	var cur = objFile.files[0].size;
	
	if (cur > max){
		alert("이미지 파일의 용량은 4MB를 초과할 수 없습니다.");
		
		objFile.outerHTML = objFile.outerHTML;
	}
}

function CheckFileExt(objFile){
	var fname = objFile.value;
	var ext = fname.split('.').pop().toLowerCase();
	
	if ($.inArray(ext, ["jpg", "jpeg", "png", "bmp", "gif"]) == -1){
		// gif 넣으면 프로필에 움짤 넣을 수 있다!
		alert("jpg, jpeg, png, bmp, gif 형식의 파일만 업로드 가능합니다.");
		
		objFile.outerHTML = objFile.outerHTML;
	}
}