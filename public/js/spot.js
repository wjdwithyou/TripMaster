// 현재 작성중인 부분이 어디어디인지 알려주는 객체.
// basic : 프로필사진, 여행지 이름, 여행지 종류등
// description : 여행지 설명
// tip : 여행지 팁 등.
var isEdited = {basic:false, description:false, tip:false, tag:false};
// 현재 화면에 열려있는 Spot 의 Id 를 저장.
var openedSpotId = -1;
var latLngToRecommend = {};

// 내용을 작성했는지 확인. 아니면 alert. 맞으면 서버에 내용 전송.
function save(e) {
	var content;
	var isSavable = false;
	
	// e : 어떤 내용에 대한 버튼인지 정보를 저장.
	// 어떤 내용에 대한 저장 버튼이 눌렸는지 확인하고 각각에 대해 동작을 정의함.
	switch(e){
		case 'basic' :
			// 여행지 이름, 종류의 내용을 불러옴.
			var temp1 = $("#spotname").val();
			var temp2 = $("#spotkind").val();
			console.log(temp2);
			
			// 둘 중 하나라도 공백란이 있다면 저장 못하게함. 없다면 저장.
			if(temp1.trim() == "" || temp2.trim() == "")
				isSavable = false;
			else{
				// html 을 동적으로 바꿈. 여행지 이름을 받았던 input 태그는 readonly 로 바꾸어서 수정을 못하게함.
				// 여행지 종류를 받았던 select 태그는 지우고 여행지의 종류를 p 태그 안에 넣어서 표시.
				$("#basic-name-frame").html("<input type = 'text' name='spotname' id='spotname' maxlength='15' placeholder = '여행지명 입력란' value='"+$("#spotname").val()+"' readonly/>");
				$("#basic-kind-frame").html("<p>"+$("#spotkind").val()+"</p>");
				
				// 내용을 받아서 서버로 보냄. 현재 저장버튼이 눌린 여행지의 아이디, 저장할 내용, 어떤 내용이 저장되는지.
				content = {name:$("#spotname").val(), kind:$("#basic-kind-frame > p").text()};
				socketConnect();
				socket.emit('Save',{kind:e, content:content, spotId:openedSpotId});
				
				//저장 버튼의 기능을 edit 으로 바꾸고 [저장] 을 [편집] 으로 바꿈.
				$("#basic-button").attr("href", "javascript:edit('basic')");
				$("#basic-button").html("[편집]");
				isEdited['basic'] = false;
				isSavable = true;
			}
			break;
		case 'description' :
			//여행지 설명란의 내용을 불러옴. tinymce 종료. textarea 태그를 삭제하고 tinymce 로 입력했던 내용을 넣음.
			content = tinyMCE.get("spot-desc").getContent();
			tinyMCE.execCommand('mceRemoveEditor', false, "spot-desc");
			$("#description-frame").html(content);
			
			// 서버에 현재 저장버튼이 눌린 여행지의 아이디, 내용, 어떤 종류의 내용이 저장되는 지 보냄.
			socketConnect();
			socket.emit('Save',{kind:e, content:content, spotId:openedSpotId});
			$("#description-button").attr("href", "javascript:edit('description')");
			$("#description-button").html("[편집]");
			isEdited['description'] = false;
			isSavable = true;
			break;
		case 'tip' :
			// 위와 비슷.
			content = tinyMCE.get("spot-tip").getContent();
			tinyMCE.execCommand('mceRemoveEditor', false, "spot-tip");
			$("#tip-frame").html(content);
			
			socketConnect();
			socket.emit('Save',{kind:e, content:content, spotId:openedSpotId});
			$("#tip-button").attr("href", "javascript:edit('tip')");
			$("#tip-button").html("[편집]");
			isEdited['tip'] = false;
			isSavable = true;
			break;
		case 'tag' :
			// 위와 비슷.
			content = $("#spot-tag").val();
			
			socketConnect();
			socket.emit('Save',{kind:e, content:content, spotId:openedSpotId});
			$("#tag-button").attr("href", "javascript:edit('tag')");
			$("#tag-button").html("[편집]");
			$("#spot-tag").attr("readonly", "readonly");
			isEdited['tag'] = false;
			isSavable = true;
			break;
	}
	
	// 저장을 할 수 없는 경우 입력해야될 공간이 있음을 의미.
	if(!isSavable){
		alert('반드시 입력해야하는 공간입니다.');
	}
}

//내용을 수정하는경우. 페이지의 일부분만 변경. save 의 반대기능. 표시되어 있던 내용을 편집 가능으로 바꿈.
function edit(e) {
	switch(e){
		case 'basic' :
			$("#basic-name-frame").html("<input type = 'text' name='spotname' id='spotname' maxlength='15' placeholder = '여행지명 입력란' value='"+$("#spotname").val()+"'/>");
			
			var content = $("#basic-kind-frame > p").text();
			$("#basic-kind-frame").html("<select id='spotkind'>"
														+"<option value=''>여행지 종류 선택</option>"
														+"<option value='음식점'>음식점</option>"
														+"<option value='카페/커피전문점'>카페/커피전문점</option>"
														+"<option value='베이커리/디저트'>베이커리/디저트</option>"
														+"<option value='생활/편의'>생활/편의</option>"
														+"<option value='병원/약국'>병원/약국</option>"
														+"<option value='엔터테인먼트'>엔터테인먼트</option>"
														+"<option value='편의점/슈퍼마켓'>편의점/슈퍼마켓</option>"
														+"<option value='숙박'>숙박</option>"
													+"</select>");
			$('#spotkind').val(content);
			break;
		case 'description' :
			var content = $("#description-frame").html();
			$("#description-frame").html("<textarea id='spot-desc'></textarea>");
			initMCEexact("spot-desc");
			tinyMCE.get("spot-desc").setContent(content);
			break;
		case 'tip' :
			var content = $("#tip-frame").html();
			$("#tip-frame").html("<textarea id='spot-tip'></textarea>");
			initMCEexact("spot-tip");
			tinyMCE.get("spot-tip").setContent(content);
			break;
		case 'tag' :
			$("#spot-tag").removeAttr("readonly");
			break;
	}
	//성공시
	$("#"+e+"-button").attr("href", "javascript:save('"+e+"')");
	$("#"+e+"-button").html("[저장]");
	isEdited[e] = true;
	console.log(isEdited);
}

//spot 추가. g : 위도, k : 경도. 서버에 정보를 보내서 새로 만들어질 spot 의 id 를 받아옴.
//작성 도중 disconnect 됬을 때를 생각해야됨.
function addSpot(g, k){
	infowindow.close();
	console.log(g + " , " + k);
	//render('create');
	for (var i in isEdited){
		isEdited[i] = true;
		$("#"+i+"-button").attr("href", "javascript:save('"+i+"')");
		$("#"+i+"-button").html("[저장]");
	}
	$("#basic-name-frame").html("<input type = 'text' name='spotname' id='spotname' maxlength='15' placeholder = '여행지명 입력란'/>");
	$("#basic-kind-frame").html("<select id='spotkind'>"
												+"<option value='' selected='selected'>여행지 종류 선택</option>"
												+"<option value='음식점'>음식점</option>"
												+"<option value='카페/커피전문점'>카페/커피전문점</option>"
												+"<option value='베이커리/디저트'>베이커리/디저트</option>"
												+"<option value='생활/편의'>생활/편의</option>"
												+"<option value='병원/약국'>병원/약국</option>"
												+"<option value='엔터테인먼트'>엔터테인먼트</option>"
												+"<option value='편의점/슈퍼마켓'>편의점/슈퍼마켓</option>"
												+"<option value='숙박'>숙박</option>"
											+"</select>");
	//tinymce 를 킴.
	$("#description-frame").html("<textarea id='spot-desc'></textarea>");
	initMCEexact("spot-desc");
	$("#tip-frame").html("<textarea id='spot-tip'></textarea>");
	initMCEexact("spot-tip");
	$("#spot-tag").val('');
	
	socketConnect();
	//위도, 경도를 서버에 넘겨줌. 서버는 db 에 스팟을 추가하고, 위도 경도를 저장함. 그리고 새로 만든 스팟의 아이디를 리턴.
	socket.emit('GetNewSpotId',{g:g, k:k});
}
function callback_GetNewSpotId(data){
	openedSpotId = data;
	$("#spot-page").css('visibility','visible');
	$("#profile-hidden-spot-id").val(''+openedSpotId);
	socketDisconnect();
}

// 여행지 마커를 클릭했을때를 위해 index.js 에서 콜백함수로써 등록되는 함수.
// 특정 id 를 지닌 마커가 클릭되었을때, id 를 받아온다. isEdited 배열의 값을 전부 false (편집중이 아님.) 으로 바꾼다. 또한 혹시 [저장] 이 있을때를 대비해 전부
// [편집] 으로 바꾸고 a태그의 기능을 edit() 으로 변경한다.
function openSpot(id){
	infowindow.close();
	for (var i in isEdited){
		isEdited[i] = false;
		$("#"+i+"-button").attr("href", "javascript:edit('"+i+"')");
		$("#"+i+"-button").html("[편집]");
	}
	//열려있는 spot 의 아이디를 함수의 인자로 받아온 id로 설정.
	openedSpotId = id;
	
	//프로필 사진을 post 할때 form 을 넘기면서 동시에 spot 의 id 를 넘기기 위해, 현재 열려있는 spot 의 id 를 설정한다.
	// profile-hidden-spot-id 아이디로 접근하는 태그는 input 태그이자 hidden 이다.
	$("#profile-hidden-spot-id").val(''+openedSpotId);
	socketConnect();
	socket.emit('GetSpotContent',id);
}
function callback_GetSpotContent(data){
	// spot 의 내용을 표시함.
	$("#basic-name-frame").html("<input type = 'text' name='spotname' id='spotname' maxlength='15' placeholder = '여행지명 입력란' value='"+data.name+"' readonly/>");
	$("#basic-kind-frame").html("<p>"+data.kind+"</p>");
	tinyMCE.execCommand('mceRemoveEditor', false, "spot-desc");
	$("#description-frame").html(data.desc);
	tinyMCE.execCommand('mceRemoveEditor', false, "spot-tip");
	$("#tip-frame").html(data.tip);
	$("#spot-tag").val(data.tag);
	resize();
	$("#spot-page").css('visibility','visible');
	socketDisconnect();
}

function openSpotReview(id){
	infowindow.close();
	openedSpotId = id;
	socketConnect();
	socket.emit('GetSpotReviewContent',id);
}
function callback_GetSpotReviewContent(data){
	$('#spot-review-list').html('');
	for(var i = 0; i < data.length; i++){
		var temp = '<div><p>'+data[i].userid+' : ';
		if(data[i].score != -1)
			temp = temp + data[i].score +'점 : ';
		temp = temp + data[i].content + '</p></div>';
		$('#spot-review-list').append(temp);
	}
	resize();
	$("#spot-review").css('visibility','visible');
	socketDisconnect();
}

function spotpage_close(){
	var isFinished=true;
	openedSpotId = -1;
	for (var i in isEdited){
		if(isEdited[i])
			isFinished=false;
	}
	if(isFinished)
		$("#spot-page").css('visibility','hidden');
	else
		alert("편집 중인 공간이 있습니다.");
}

function spotreview_close(){
	openedSpotId = -1;
	$("#spot-review").css('visibility','hidden');
}

function spotreview_write(){
	var content = $("#spot-review-content").val();
	var score = parseInt($("#spot-review-score").val());
	$("#spot-review-content").val('');
	var temp_userid;
	if(user_id == ''){
		temp_userid = "anonymous";
	}else{
		temp_userid = user_id;
	}
	
	socketConnect();
	socket.emit('SaveSpotReview',{id:openedSpotId, userid:temp_userid, score:score, content:content});
}
function callback_SaveSpotReview(){
	socketDisconnect();
	spotreview_close();
}

function openNav(g, k){
	latLngToRecommend.g = g;
	latLngToRecommend.k = k;
	
	$("#i_navbar").toggle('clip');
}

function RecommendSpot(){
	var tags = $("#i_tag").val();
	var spotkind = $("#i_spotkind").val();
	
	socketConnect();
	socket.emit('RecommendSpot',{g:latLngToRecommend.g, k:latLngToRecommend.k, tags:tags, spotkind:spotkind});
	closeNav();
}
var flightPath;
var Coordinates = [];
function callback_RecommendSpot(data){
	socketDisconnect();
	if(flightPath){
		flightPath.setMap(null);
	}
	Coordinates = [];
	for(var i = data.length - 1; i >= 0 && i >= data.length - 3; i-- ){
		Coordinates.push({lat:data[i].latitude,lng:data[i].longitude});
	}
	if(!flightPath){
		flightPath = new google.maps.Polyline({
			path: Coordinates,
			strokeColor: "#FF0000",
			strokeOpacity: 0.8,
			strokeWeight: 10
		});
	}else{
		flightPath.setPath(Coordinates);
	}
	flightPath.setMap(map);
}

function closeNav(){
	$("#i_navbar").toggle('clip');
	$("#i_spotkind").val('');
	$("#i_tag").val('');
}