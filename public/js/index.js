var infowindow;	//구글맵에서 마우스 클릭했을 때 뜨는 창에 대한 내용을 담음.
var map;
var spots;

window.onload = function() {
	$("#floating-div2").hide();
	$("#signup-background").hide();
	$("#i_navbar").hide();
	resize();
	window.addEventListener('resize', resize);
	
	//이게 뭔진 잘 모르겠음.
	infowindow = new google.maps.InfoWindow({
		content: '', size: new google.maps.Size(50,50), position: { lat: 0, lng: 0}
	});  
	
	// 처음 구글맵을 열었을때 설정.
	var mapOptions = {
        center: { lat: 40, lng: 0},
        zoom: 2,/*
		zoomControl : false,
		rotateControl : false,
		panControl : false,
		scaleControl : false*/
		disableDefaultUI:true,
		draggableCursor : "default"
    };
	
	// mapOptions 라는 설정을 갖고, map-canvas 라는 id 의 div 에 적용되는 구글맵 객체를 가져옴.
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	
	// 구글맵의 사이즈가 변할때 발생할 콜백함수 resize 를 등록. (아마 ㅇㅇ)
	google.maps.event.addDomListener(window, "resize", function() {
		var center = map.getCenter();
		google.maps.event.trigger(map, "resize");
		map.setCenter(center); 
	});
	
	//구글맵이 클릭 되었을때, infowindow 객체의 내용을 설정함.
	//자세한 내용은 setContent 내부의 html 태그 참조.
	// event.latLng.H = 위도, L = 경도.
	// addSpot 은 spot.js 내부에 있음.
	google.maps.event.addListener(map, 'click', function(event) {
		console.log(event.latLng);
		infowindow.setContent("<a href='javascript:addSpot("+event.latLng.H+","+event.latLng.L+")'>여행지 추가</a><br><a href='javascript:openNav("+event.latLng.H+","+event.latLng.L+")'>인근 여행지 추천</a>"); // 인포윈도우 안에 클릭한 곳위 좌표값을 넣는다.
		infowindow.setPosition(event.latLng);             // 인포윈도우의 위치를 클릭한 곳으로 변경한다.
		infowindow.open(map);
	});
	
	socketConnect();
	//서버에 현재 저장되어있는 모든 spot 들에 대한 정보를 요청함.
	socket.emit('GetSpots');
}
function callback_GetSpots(data){
	//data = 모든 spot 들에 대한 정보가 들어있음. id, 위도, 경도
	spots = data;
	//사용자 정의 함수. 밑에 정의되어 있음. 마커를 찍는 함수
	setMarkers(spots);
	socketDisconnect();
}

//화면의 사이즈가 변할때 작동.
function resize() {
	$('#main-content').css('height', window.innerHeight + 'px');
	$('#i_navbar').css('height', window.innerHeight + 'px');
	$('#i_tag').css('height', window.innerHeight - 150 + 'px');
	
	if( window.innerWidth > 1000 ){
		$('#spot-page > div').css('width', '1000px');
		$('#spot-review-frame').css('width', '1000px');
	}else{
		$('#spot-page > div').css('width', window.innerWidth+'px');
		$('#spot-review-frame').css('width', window.innerWidth+'px');
	}
	
	var temp = parseInt(  $('#spot-page > div').css('width').replace('/[^-\d\.]/g', '')  );
	var spot_review_frame_width = parseInt(  $('#spot-review-frame').css('width').replace('/[^-\d\.]/g', '')  );
	//spot 을 눌렀을때 뜨는 창의 사이즈를 조절함. 핸드폰에서도 볼 수 있도록 ㅇㅇ;
	$('#spot-page > div > div').css('width', temp - 40 + 'px');
	$('#spot-page > div > a:last-child > div').css('width', temp - 40 + 'px');
	
	$('#spot-review-list').css('width', spot_review_frame_width + 50 + 'px');
	$('#spot-review-list').css('height', window.innerHeight - 100 - 4 + 'px'); // -4 는 테두리 두깨 고려한거
	
	$('#spot-review-list > div').css('width', spot_review_frame_width - 40  -2 + 'px'); // -2 테두리
	
	$('#spot-review-frame > div:last-child').css('height', '100px');
	
	$('#spot-review-frame > div:last-child > textarea').css('width',spot_review_frame_width - 40  -2 -160 + 'px');
	
	$('#spot-page > div').css('left', window.innerWidth/2 - parseInt(  $('#spot-page > div').css('width').replace('/[^-\d\.]/g', '')  )/2 + 'px');
	$('#spot-review-frame').css('left', window.innerWidth/2 - spot_review_frame_width/2 + 'px');
}

//무슨 함수인지 모르겠음. 쓰이지도 않음.
function placeMarker(location) { 
	var clickedLocation = new google.maps.LatLng(location);
	var marker = new google.maps.Marker({       position: location,        map: map   });
	map.setCenter(location);
}

//spot 들에대한 정보를 받아오면 각각의 spot 이 위치한 곳에 marker 를 찍는 함수.
function setMarkers(spots){
	//마커의 모양. index.css 에도 marker 의 모양을 지정하는 style 이 지정되있음.
    var shape = {
      coords: [0, 0, 		// 왼쪽 위
      0, 75, 						// 왼쪽 아래
      75, 75, 					// 오른쪽 아래
      75 , 0],					// 오른쪽 위	// 틀릴 수 있음.
        type: 'poly'
    };
    
	// spots 안에 있는 모든 spot 들에 대해 실행.
    for (var i = 0; i < spots.length; i++) {
        var spot = spots[i];
        
        var image = {
            url: '/spot/profile/'+spot.id,//spot 들의 프로필 사진은 /public/spot/profile/ 스팟의 id 꼴로 저장됨. 그것을 불러옴.
            // This marker is 20 pixels wide by 32 pixels tall.	// 이 설명은 복붙때문에 생긴것. 무시.
            size: new google.maps.Size(75, 75),
            // The origin for this image is 0,0.
            origin: new google.maps.Point(0,0),
            // The anchor for this image is the base of the flagpole at 0,32.
            anchor: new google.maps.Point(0, 75),
            scaledSize: new google.maps.Size(75, 75)
        };
        
        //스팟의 위도 경도를 알려줌.
        var myLatLng = new google.maps.LatLng(spot.latitude, spot.longitude);
        var marker = new google.maps.Marker({
            position: myLatLng,
            map: map,
            icon: image,
            shape: shape,
            title: spot.spotname,
            zIndex: 4,
            optimized:false
        });
        var infowindow = new google.maps.InfoWindow({
            content: ''
        });
        //각 스팟의 마커가 눌렸을때 실행될 콜백함수를 지정함.
        google.maps.event.addListener(marker,'click', (function(id){ 
            // 이곳에서 함수 객체를 동적으로 만들어서 반환. openSpot(스팟 아이디) 를 반환한다.
			// openSpot 은 spot.js 에 정의되어있음.
			return function(event) {
                //openSpot(id);
				
				infowindow.setContent("<a href='javascript:openSpot("+id+")'>여행지 설명</a><br><a href='javascript:openSpotReview("+id+")'>여행지 댓글</a><br><a href='javascript:openNav("+event.latLng.H+","+event.latLng.L+")'>인근 여행지 추천</a>"); // 인포윈도우 안에 클릭한 곳위 좌표값을 넣는다.
				infowindow.setPosition(event.latLng);             // 인포윈도우의 위치를 클릭한 곳으로 변경한다.
				infowindow.open(map);
            };
        })(spot.id)); 
    }

}