angular
.module('AppToDate.Controllers')
.controller(
		'viewEventCtrl',
function($scope, $filter, $location, imageService,
		eventService, googleMapService, $stateParams, userService) {
    $scope.setNavTitle("View Event");
	$scope.mapLoaded = false;
	$scope.tab = 'details';
	$scope.eventId = $stateParams.id
	$scope.statusMessages = {"0": "Wating for response", "1": "Attending", "2": "May Be", "3": "No"};
	$scope.eventImageSource = appConfig.apiUrl + "Image/GetEventImage?eventId=";
	$scope.eventStatus = eventStatus;
	$scope.attendeeImageUrl = "";
	$scope.userImages = {};

	var loadEvent = function(){
		if ($scope.userDetails && $scope.userDetails.user_id) {
			eventService
					.getEvent($scope.eventId, $scope.userDetails.user_id)
					.then(
							function(data) {
								$scope.event = data
								$scope.event.start = new Date($scope.event.start);
								if($scope.event.user_Id === $scope.userDetails.user_id){
									$scope.showEditButton();	
									$scope.showDeleteButton();
								}
							},
							function(error) {
								console
										.log("Error occured while fetching the event data")
							});
		} else {
			$scope.event = {
					  "server_id": 48,
					  "id": 1,
					  "user_Id": "d464afc9-020b-4c48-9927-ea75d3cca2cf",
					  "title": "test new event",
					  "notes": "test notes",
					  "start": "Thu Jul 31 2014 15:43:00 GMT-0400 (EDT)",
					  "end": "Thu Jul 31 2014 16:43:00 GMT-0400 (EDT)",
					  "image_url": "undefined",
					  "location_title": "sector 61",
					  "lat": 28.37999999999999,
					  "lng": 77.12,
					  "remind_before": "25",
					  "attendees": [
					    {
					      "person": {},
					      "username": "undefined",
					      "first_name": "Contact1",
					      "last_name": "test",
					      "access_token": "testAccessToken",
					      "user_id": "af079bd7-af59-4e76-b33e-5d369c69b054",
					      "login_time": "undefined",
					      "expires_in": "undefined",
					      "refresh_token": "undefined",
					      "status": "0"
					    },
					    {
					      "person": {},
					      "username": "undefined",
					      "first_name": "Sumit",
					      "last_name": "test",
					      "access_token": "testAccessToken",
					      "user_id": "2c3d480e-62d5-4aeb-9240-ce001222b593",
					      "login_time": "undefined",
					      "expires_in": "undefined",
					      "refresh_token": "undefined",
					      "status": "1"
					    },
					    {
					      "person": {},
					      "username": "undefined",
					      "first_name": "Sumit",
					      "last_name": "test",
					      "access_token": "testAccessToken",
					      "user_id": "2c3d480e-62d5-4aeb-9240-ce001222b593",
					      "login_time": "undefined",
					      "expires_in": "undefined",
					      "refresh_token": "undefined",
					      "status": "2"
					    },
					    {
					      "person": {},
					      "username": "undefined",
					      "first_name": "Sumit",
					      "last_name": "test",
					      "access_token": "testAccessToken",
					      "user_id": "2c3d480e-62d5-4aeb-9240-ce001222b593",
					      "login_time": "undefined",
					      "expires_in": "undefined",
					      "refresh_token": "undefined",
					      "status": "3"
					    }
					  ],
					  "comments": [
					               {
					                 "commentedByClientId": "435e357c-aad1-4b5a-b914-5a9e39e92184",
					                 "text": "New commdhjvcf",
					                 "commentedByName": "ssh"
					               }
					             ]
					}
	
			$scope.event.start = new Date($scope.event.start);
		}
	}
	
	if ($scope.userDetails && $scope.userDetails.user_id) {
		eventService.updateEventFromClientId($scope.eventId).then(function(){
			loadEvent();
		}, function(error){
			console.log("Error while updating event");
		});
	} else {
		loadEvent();
	}
	
	$scope.loadEventDetails = function() {
		$scope.tab = 'details';
	}

	$scope.loadAttendees = function() {
		$scope.tab = 'attendees';
	}
	$scope.loadGoogleMap = function() {
		$scope.tab = 'location';
		if (!$scope.mapLoaded) {
			googleMapService.showMapInDiv('map', function() {
				$scope.mapLoaded = true;
			}, $scope.event);
		}
	}
	$scope.loadNotesTab = function () {
	    $scope.tab = 'notes';
	}
	$scope.attendeeClicked = function(attendee){
		$scope.selectedAttendee = attendee;
		userService.getUserImage(attendee.user_id).then(function(fullPath){
			$scope.attendeeImageUrl = fullPath;
		}, function(error){
			console.log("Error while getting the image: " + JSON.stringify(error));
		});
		$scope.showModal = true;
	}
	$scope.loadUserImage = function(userId){
		console.log("Fetching image for: " + userId)
		userService.getUserImage(userId).then(function(fullPath){
			$scope.userImages[userId] = fullPath;
			console.log(JSON.stringify($scope.userImages));
			
		}, function(error){
			console.log("Error while getting the image: " + JSON.stringify(error));
		});
	}
	$scope.closeModal = function(){
		$scope.showModal = false;
	}

	$scope.$on('edit_clicked', function(){
		console.log("Editing event");
		$location.path('/event/edit/' + $scope.eventId);
	});

	$scope.$on('delete_clicked', function(){
		navigator.notification.confirm('Are you sure you want to delete this event?', function(message){
			if(message == 2){
				$scope.setShowLoader(true);
				console.log("Delete event");
				eventService.deleteEvent(parseInt($scope.event.server_id))
					.then(function(data){
						navigator.notification.alert('Event deleted successfully!', function(){
							$scope.setShowLoader(false);
							$location.path('/calendar');
							$scope.$apply();
						}, 'Alert', 'OK');  
					}, function(data){
						console.log("Error occured while deleting event: "+ JSON.stringify(data));
						$scope.showResponseMessage(data.Message||"An error occured!", false);	
						$scope.setShowLoader(false);
					});
			}
		}, 'Delete Event', 'No, Yes');
		
	});
	
	$scope.postComment = function(text){
		var comment = {
			commentedByClientId: $scope.userDetails ? $scope.userDetails.user_id : "435e357c-aad1-4b5a-b914-5a9e39e92184",
			text: text,
			commentedByName: $scope.userDetails ? $scope.userDetails.first_name : "test name"
		}
		$scope.setShowLoader(true);
		if(!$scope.userDetails){
			console.log("Comment added successfully");
			$scope.showResponseMessage('Comment added successfully!', true);
			$scope.event.comments.push(comment);			
			$scope.event.commentText = '';
			$scope.setShowLoader(false);
			return;
		}
		eventService.postComment($scope.event, comment).then(function(response){
			console.log("Comment added successfully");
			$scope.showResponseMessage('Comment added successfully!', true);
			$scope.event.comments.push(comment);			
			$scope.event.commentText = '';
			$scope.setShowLoader(false);
		}, function(error){
			$scope.showResponseMessage(error.Message||"An error occured!", false);	
			$scope.setShowLoader(false);		
		});
	}
	
	$scope.postEventStatus = function(status){	
		$scope.setShowLoader(true);
		eventService.postEventStatus($scope.event, $scope.userDetails.user_id, status).then(function(response){
			console.log("Response saved successfully");
			var msg = 'Response saved successfully!';
			if(status === $scope.eventStatus.attending){
				msg = 'You accepted the invitation!';
			} else if(status === $scope.eventStatus.notAttending){
				msg = 'You declined the invitation!';
			}
			$scope.showResponseMessage(msg, true);
			$scope.event.status = status;
			$scope.setShowLoader(false);
		}, function(error){
			$scope.showResponseMessage(error.Message||"An error occured!", false);	
			$scope.setShowLoader(false);
		})
	}
	
	$scope.$on('event_refreshed', function(listenerEvent, eventServerId){
		console.log("refreshing event event: " + JSON.stringify(eventServerId));
		if($scope.event.server_id == eventServerId){
			loadEvent();
		}
	});
});