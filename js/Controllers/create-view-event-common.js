angular.module('AppToDate.Controllers')
.controller('createViewEventCtrl', function($scope, $filter, $location, imageService, eventService, googleMapService) {
	$scope.timeSpans = ['5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '60'];
	$scope.showModal = false;
	
	$scope.uploadImage = function(){
		imageService.getPicture(true, function(imageURI){
			console.log("Setting image for event: "+ imageURI);
			$scope.$apply(function(){
				$scope.event.file = imageURI;
			});
			
		}, function(e){
			console.log("Error occured while uploading the image");
		});
	}
	
	$scope.loadEventDetails = function(){
		$scope.tab = 'details';
	}
	
	$scope.loadAttendees = function(){
		$scope.tab = 'attendees';
	}
	
	$scope.loadGoogleMap = function(){
		$scope.tab = 'location';
		$scope.$parent.loadGoogleMap()
	}
	
	$scope.showReminderModal = function(){
		$scope.showModal = true;
	}
	
	$scope.createEvent = function(event){
		$scope.setShowLoader(true);
		event.start = new Date($filter('date')(event.date, 'MM-dd-yyyy'));
		event.end = new Date($filter('date')(event.date, 'MM-dd-yyyy'))
		console.log("Event to create : " +JSON.stringify(event));
		event.location = "Home";
		//Prepare the start date
		event.startTime = document.getElementById("startTime").value;
		event.endTime = document.getElementById("endTime").value;
		var time = event.startTime.split(":");
		event.start.setHours(time[0], time[1]);
		console.log("setting hours to start date" + JSON.stringify(time));
		
		//Prepare the end date
		time = event.endTime.split(":");
		event.end.setHours(time[0], time[1]);
		console.log("Event start date: " + JSON.stringify(event.start));
		console.log("Event end date: " + JSON.stringify(event.end));
		var currentDate = new Date();
		console.log("Current date is: " + JSON.stringify(currentDate));
		if(event.start <currentDate){
			console.log("Start time is less than current time");
			$scope.setShowLoader(false);
			$scope.showResponseMessage("Start time should be greater than current time.", false);
			return;
		} else if(event.start > event.end){
			console.log("Start time is less that end time");
			$scope.setShowLoader(false);
			$scope.showResponseMessage("Start time cannot be greater than end time.", false);
			return;
		}
		//Extract the utc string from the date time
		//event.start = new Date( event.start.getTime() - (event.start.getTimezoneOffset() * 60000));
		//event.end = new Date( event.end.getTime() - (event.end.getTimezoneOffset() * 60000));
		
		console.log("setting hours to end date" + JSON.stringify(time));
		
		console.log("Event to create : " +JSON.stringify(event));
		event.duration = (event.end - event.start) != 0 ? (event.end - event.start)/60000 : 0; 
		var mapPosition = googleMapService.getCurrentMapLocation();
		event.imageUrl = event.file;
		event.user_id = $scope.userDetails.user_id;
		event.location = {
			displayName: angular.element("#enterlocation").val(),
			latitude: mapPosition.lat,
			longitude: mapPosition.lng
		};
		event.Organizer = {
			"TimeZoneInfo": "UTC",
			"Id": $scope.userDetails.id,
			"ClientId": $scope.userDetails.user_id
		};
		
		//Fetching attendees
		event.EventAttendeeAssociations =[];
		if($scope.contacts && $scope.contacts.length > 0){
			var filtered = $filter('filter')($scope.contacts, {'isSelected': true});
			if(filtered && filtered.length > 0){
				angular.forEach(filtered,function(item){
					var attendee = {
							Person: {
								'ClientId': item.user_id,
								'FirstName': item.first_name,
								'LastName': item.last_name
							},
							Status: item.status || eventStatus.unknown
						}
					event.EventAttendeeAssociations.push(attendee);
				});
			}
		}
		
		//Fetching groups
		event.GroupAssociations =[];
		if($scope.groups && $scope.groups.length > 0){
			var filtered = $filter('filter')($scope.groups, {'isSelected': true});
			if(filtered && filtered.length > 0){
				angular.forEach(filtered,function(item){
					var groupAssociation = {
						GroupId: parseInt(item.server_id),
						GroupClientId: item.id
//						Group :{
//							'Id': item.server_id.substring(0, item.server_id.indexOf(".")),
//							'Title': item.group_name
//						},
//						CreatedDate: new Date(),
//						UpdatedDate: new Date()
					}
					event.GroupAssociations.push(groupAssociation);
				});
			}
		}
		
		console.log("Creating Event : " +JSON.stringify(event) )
		eventService.createEvent(event).then(function(response){
			console.log('Event created successfully : ' + JSON.stringify(event));
			if(response.imageUrl && response.imageUrl != ""){
				 var serverUrl = appConfig.apiUrl + "Image/UploadEventPicture?eventId=" + response.server_id;
				 imageService.uploadImageToServer(response.imageUrl, serverUrl, 
				    		function(response){
					    console.log("Image uploaded successfully");
						$scope.setShowLoader(false);
						$location.path('/calendar');
						$scope.$apply();
				 }, function(error){
					 console.log("Error in event image upload: " + JSON.stringify(error));
					 $scope.setShowLoader(false);
				 });
			} else {
				$scope.setShowLoader(false);
				$location.path('/calendar');
			}
			
		}, 
		function(data){
			console.log('Error occured while creating event');
			$scope.setShowLoader(false);
		});
	}
	
	$scope.createGroup = function(){
		$location.path('/group/new');
	}
});