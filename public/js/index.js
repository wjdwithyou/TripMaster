﻿window.onload = function() {
	$("#header-div2").hide();
	$("#signup-background").hide();
	$("#profile-background").hide();
	$( "#slide1" ).hide();
	$( "#slide2" ).hide();
	/* 추가적인 slide 가 필요해진다면 #slide3 를 넣어준다. */
	
	
	resize();
	window.addEventListener('resize', resize);
	
	
	
	var mapOptions = {
        center: { lat: 40, lng: 0},
        zoom: 2
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);
	google.maps.event.addDomListener(window, "resize", function() {
		var center = map.getCenter();
		google.maps.event.trigger(map, "resize");
		map.setCenter(center); 
	});
	setMarkers(map, spots);
}

function resize() {
	$('section.main-frame').css('height', window.innerHeight - header_width + 'px');
	
	$('#slide1').css('height', $('section.main-frame').css('height'));
	$('#slide1').css('top', header_width + 'px');
	$('#slide1').css('left', nav_width + 'px');
	
	$('#slide2').css('height', $('section.main-frame').css('height'));
	$('#slide2').css('top', header_width + 'px');
	$('#slide2').css('left', nav_width + 250 + 'px');
	
	/* 추가적인 slide 가 필요해진다면 #slide3 를 넣어준다. */
	
	$('#postroom-content').css('height', parseInt($('#slide1').css('height').replace('/[^-\d\.]/g', '')) - postroom_header_width - postroom_write_width + 'px');
	$('textarea.post-editor').css('height', parseInt($('#slide2').css('height').replace('/[^-\d\.]/g', '')) - post_submit_width - 75 + 'px');		// 75 : 에디터 바의 두께
	//$('main-canvas').css('width', window.innerWidth - nav_width + 'px');필요없는듯하다.
	
	$('#logincover').css('height', $('section.main-frame').css('height'));
	$('#logincover').css('top', header_width + 'px');
}

function ChangeTab(data){
	ChangeTabColor(data);
	if(opened_slide != data){
		if(opened_editor_class != "none"){
			tinyMCE.execCommand('mceRemoveEditor', false, $("textarea."+opened_editor_class).attr('id'));
			opened_editor_class = "none";
			post_editor_config.editor_selector = opened_editor_class;
		}
	}
	
	var isTabChanged = (data != opened_slide);
	if(data == opened_slide){
		for(var i = opened_slide_num; i >= 1; i--){
			ToggleSlide("#slide"+i);
		}
		opened_slide_num = 0;
		opened_slide = "none";
	}else{
		for(var i = opened_slide_num; i >= 1; i--){
			ToggleSlide("#slide"+i);
		}
		ToggleSlide("#slide1");
		opened_slide = data;
		opened_slide_num = 1;
	}
	ChangeSlide(data);
}



function ChangeTabColor(data){
	if(opened_slide == 'none'){				//안열려있는 경우에는 열린다.
		$("#"+data+"-button").css('backgroundColor','#0099dd');
		$("#"+data+"-button").css('color','#fff');
	}else	if(opened_slide == data){			//열려있는데 한번 더 누른경우에는 닫힌다.
		$("#"+data+"-button").css('backgroundColor','transparent');
		$("#"+data+"-button").css('color','#727272');
	}else{												//열려있는데 다른 거 열려고 하는 경우
		$("#"+opened_slide+"-button").css('backgroundColor','transparent');
		$("#"+opened_slide+"-button").css('color','#727272');
		$("#"+data+"-button").css('backgroundColor','#0099dd');
		$("#"+data+"-button").css('color','#fff');
	}
}

function NavNavOver(id){
	$("#"+id).css('color', '#FFFFFF');
}

function NavNavOut(id){
	if (id == opened_slide + "-button")
		$("#"+id).css('color', '#FFFFFF');
	else
		$("#"+id).css('color', '#727272');
}

// 슬라이드를 토글하는 함수이다. data 에는 토글하는 슬라이드의 종류, num 에는 토글할 슬라이드의 번호가 온다.
// 자동으로 에디터가 켜져있을 경우, 에디터를 지운다.
function ToggleSlide(data){
	$(data).toggle( "slide", slide_speed );
}

/* 에디터 생성
setTimeout(function() {
	post_editor_config.editor_selector = "열기를 원하는 class 명";
	opened_editor_class = "열기를 원하는 class 명";
	tinymce.init(post_editor_config);
}, slide_speed + 10);
*/

function ChangeSlide(data){
	switch(data){
		case 'spotsearch':
			SpotSearchInit();
			break;
		case 'community':
			//현재 개발 중인 부분.
			PostRoomSearch('basic');
			//유저 코드를 보내줘야된다. 이곳에서 로그인한 유저의 유저 코드를 보내줘야된다.
			break;
		case 'recommendation':
			break;
	}
}