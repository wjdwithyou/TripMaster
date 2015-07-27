function SpotSearch(){
	console.log('aa');
}

function setMarkers(map, spots){
    var shape = {
      coords: [0, 0, 		// 왼쪽 위
      0, 75, 						// 왼쪽 아래
      75, 75, 					// 오른쪽 아래
      75 , 0],					// 오른쪽 위	// 틀릴 수 있음.
        type: 'poly'
    };
    
    for (var i = 0; i < spots.length; i++) {
        var spot = spots[i];
        
        var image = {
            url: spot[4],
            // This marker is 20 pixels wide by 32 pixels tall.	// 이 설명은 복붙때문에 생긴것. 무시.
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