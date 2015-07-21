$(window).load(function() {
	//draggable 클래스가 붙은 div 태그는 마우스로 끌 수 있다.
	$( "div.draggable" ).draggable();
	//$( "div.draggable" ).hide();
	
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
	//setMarkers(map, spots);
});

var markers = [];
var infos =[];
var spots = [
  ['마리나 베이 샌즈',                          //장소명
  1.283568, 103.859545,                         //위도 경도
  4,                                            //좌표 (핀들이 겹쳤을때 숫자가 높을 수록 위에 있다)
  '/public/image/image/thumb/1.jpg',            //썸네일 이미지
  '상세설명<br/>조금더 긴 글을 입력해봅시다.',  //상세설명
  2]                                            //코드 올려줄것. (필시 확인)
];

function setMarkers(map, locations){
    var shape = {
      coords: [0, 0, 
      0, 75, 
      75, 75, 
      75 , 0],
        type: 'poly'
    };
    
    for (var i = 0; i < locations.length; i++) {
        var spot = locations[i];
        
        var image = {
            url: spot[4],
            // This marker is 20 pixels wide by 32 pixels tall.
            size: new google.maps.Size(75, 75),
            // The origin for this image is 0,0.
            origin: new google.maps.Point(0,0),
            // The anchor for this image is the base of the flagpole at 0,32.
            anchor: new google.maps.Point(0, 75),
            scaledSize: new google.maps.Size(75, 75)
        };
        
        
        var myLatLng = new google.maps.LatLng(spot[1], spot[2]);
        var marker = new google.maps.Marker({
            position: myLatLng,
            map: map,
            icon: image,
            shape: shape,
            title: spot[0],
            zIndex: spot[3],
            optimized:false
        });
        var infowindow = new google.maps.InfoWindow({
            content: ''
        });
        
        google.maps.event.addListener(marker,'click', (function(marker,spot,i){ 
            return function() {
                
            };
        })(marker,spot,i)); 
    }

}

var post_list_toggled = false;
function main_post(){
	$('#navbar').collapse('toggle');
	if(!post_list_toggled){
		$( "#post_list" ).toggle( "blind" );
		post_list_toggled = true;
	}
}
function main_post_exit(){
	$( "#post_list" ).toggle( "blind" );
	post_list_toggled = false;
}

var chatting_list_toggled = false;
function main_chatting(){
	$('#navbar').collapse('toggle');
	if(!chatting_list_toggled){
		$( "#chatting_list" ).toggle( "blind" );
		chatting_list_toggled = true;
	}
}
function main_chatting_exit(){
	$( "#chatting_list" ).toggle( "blind" );
	chatting_list_toggled = false;
}

var scheduler_toggled = false; //scheduler : 여행지 추천 팝업
function main_schedule(){
	$('#navbar').collapse('toggle');
	if(!scheduler_toggled){
		//화면에 표시
		scheduler_toggled = true;
	}
}

var user_info_toggled = false;
function main_user_info(){
	if(!user_info_toggled){
		//화면에 표시
		user_info_toggled = true;
	}
}

function main_logout(){
}