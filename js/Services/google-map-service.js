angular.module('AppToDate.Services')
.factory('googleMapService', function($q) {
	var map;
	var markers = [];
	
	var loadMap = function(divId, latlng){
		console.log("Showing map in div: "+ divId);
		var mapcanvas = document.createElement('div');
	    mapcanvas.id = 'mapcanvas';
	    mapcanvas.style.height = '100%';
	    mapcanvas.style.width = '100%';
	    
	    var div = document.getElementById(divId);
	    div.innerHTML = "";
	    div.appendChild(mapcanvas);
	    var myOptions = {
		    zoom: 15,
		    center: latlng,
		    mapTypeControl: false,
		    navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
		    mapTypeId: google.maps.MapTypeId.ROADMAP
		  };
		  map = new google.maps.Map(document.getElementById("mapcanvas"), myOptions);
		  
		  console.log("placing marker for lnglng: " + JSON.stringify(latlng));
		  
		  var marker = new google.maps.Marker({
		      position: latlng, 
		      map: map, 					      
		      title:"You are here!"
		  });
	      markers.push(marker);
	}
	
	return {
		showMapInDiv: function(divId, onSuccess, event, onError){
			if (navigator.geolocation) {
				  console.log("Shown map in div: "+ divId);
				  if(!event){
					  var service = this;
					  console.log("Event null, fetching current position");
					  var latlng = new google.maps.LatLng(28.38, 77.12);
					  loadMap(divId, latlng);
					  navigator.geolocation.getCurrentPosition(function(position){
						  console.log("Current position found");
						  var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

						  loadMap(divId, latlng);
						  onSuccess();
					  }, function(error){
						  onError();
					  });  
					  console.log("End of line");
				  }	else {
					  var latlng = new google.maps.LatLng(event.lat, event.lng);
					  loadMap(divId, latlng);
					  onSuccess();
				  }	  
			} else {
			    var latlng = new google.maps.LatLng(28.38, 77.12);
			    loadMap(divId, latlng);
			    onSuccess();
			}
		},
		
		setLocationSearchbox: function(inputId, someFunction){
			var input = document.getElementById(inputId);
			
			var searchBox =  new google.maps.places.SearchBox(input);
			google.maps.event.addListener(searchBox, 'places_changed', function() {
			    var places = searchBox.getPlaces();

			    if (places.length == 0) {
			      return;
			    }
			    for (var i = 0, marker; marker = markers[i]; i++) {
			      marker.setMap(null);
			    }

			    // For each place, get the icon, place name, and location.
			    markers = [];
			    var bounds = new google.maps.LatLngBounds();
			    for (var i = 0, place; place = places[i]; i++) {
			      var image = {
			        url: place.icon,
			        size: new google.maps.Size(71, 71),
			        origin: new google.maps.Point(0, 0),
			        anchor: new google.maps.Point(17, 34),
			        scaledSize: new google.maps.Size(25, 25)
			      };

			      // Create a marker for each place.
			      var marker = new google.maps.Marker({
			        map: map,
			        icon: image,
			        title: place.name,
			        position: place.geometry.location
			      });

			      markers.push(marker);

			      bounds.extend(place.geometry.location);
			    }

			    map.fitBounds(bounds);
			  });
		  // Bias the SearchBox results towards places that are within the bounds of the
		  // current map's viewport.
		  google.maps.event.addListener(map, 'bounds_changed', function() {
		    var bounds = map.getBounds();
		    searchBox.setBounds(bounds);
		  });
		},
		
		getCurrentMapLocation: function(){
			if(!map || !map.getCenter()){
				return {
					lat: 0,
					lng: 0
				}
			}
			return {
				lat: map.getCenter().k,
				lng: map.getCenter().B
			}
		},
		
		setLatLng: function(lat, lng){
			for (var i = 0, marker; marker = markers[i]; i++) {
		      marker.setMap(null);
		    }

		    // For each place, get the icon, place name, and location.
		    markers = [];
			var bounds = new google.maps.LatLngBounds();
			var latlng = new google.maps.LatLng(lat, lng);
			bounds.extend(latlng);
			var marker = new google.maps.Marker({
		      position: latlng, 
		      map: map, 
		      title:"You are here!"
			});
			markers.push(marker);
			map.fitBounds(bounds);
		}
	}
});