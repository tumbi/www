angular
.module('AppToDate.Controllers')
.controller(
		'calendarCtrl',
function($scope, $filter, $location, eventService, userService) {
	$scope.setNavTitle("Calendar");
			
	$scope.view = 'month';

	$scope.createEvent = function() {
		$scope.setShowLoader(true);
		console.log("Calling user service");
		userService.processUninvitedContacts($scope.userDetails.user_id).then(function(){
			console.log("User service call completed");
			$location.path("/event/new");
			$scope.setShowLoader(false);
		}, function(error){
			console.log("Error occured: " + JSON.stringify(error));
			$scope.setShowLoader(false);
		});
	}

	$scope.events = [];
	$scope.allEvents = [];
	$scope.bottonsRendered = false;

	$scope.changeView = function(view) {
		$scope.view = view;
		angular.element('#calendar').fullCalendar('changeView',
				view);
	}
	
	// angular.element(document.querySelector('#calendar'))
	var calendar = angular.element(document
			.querySelector('#calendar'));
	
	$scope.filterEvents = function(searchKey){
		console.log("Filtering events");
		$scope.events = $filter('filter')($scope.allEvents, {title: searchKey});
		calendar.fullCalendar('removeEvents');
        $('#calendar').fullCalendar('addEventSource', $scope.events);
		calendar.fullCalendar('rerenderEvents');
	};

	var loadEvents = function(someFunction){
		if ($scope.userDetails && $scope.userDetails.user_id) {
			eventService
					.getEvents($scope.userDetails.user_id)
					.then(
							function(data) {
								console.log("Events fetched : "
										+ JSON.stringify(data));
								$scope.events = data;
								$scope.allEvents = $scope.events;
								$scope.events.map(function(event){
									event.start = new Date(event.start);
									event.url = "#/event/" + event.id;
								});
								someFunction();
							},
							function(data) {
								console
										.log("Error at controller while fetching events");
							});
		} else {
			var date = new Date();
			var d = date.getDate();
			var m = date.getMonth();
			var y = date.getFullYear();
			$scope.events = [ {
				title : 'All Day Event',
				start : new Date(y, m, 1)
			}, {
				title : 'Long Event',
				start : new Date(y, m, d - 5),
				end : new Date(y, m, d - 2)
			}, {
				id : 999,
				title : 'Repeating Event',
				start : new Date(y, m, d - 3, 16, 0),
				allDay : false
			}, {
				id : 999,
				title : 'Repeating Event',
				start : new Date(y, m, d + 4, 16, 0),
				allDay : false
			}, {
				title : 'Meeting',
				start : new Date(y, m, d, 10, 30),
				allDay : false
			}, {
				title : 'Lunch',
				start : new Date(y, m, d, 12, 0),
				end : new Date(y, m, d, 14, 0),
				allDay : false
			}, {
				title : 'Birthday Party',
				start : new Date(y, m, d + 1, 19, 0),
				end : new Date(y, m, d + 1, 22, 30),
				allDay : false
			}, {
				title : 'Click for Google',
				start : new Date(y, m, 28),
				end : new Date(y, m, 29),
				url : 'http://google.com/'
			} ];

			someFunction();

			$scope.allEvents = $scope.events;
		}
	}
	
	loadEvents(function(){
		calendar.fullCalendar({
		    theme: true,
		    header: {
		        left: "prev, title, next",
		        center: false,
		        right: 'agendaDay,agendaWeek,month'
		    },
		    buttonText: {
		    	prev: "Prev",
		    	next: "Next"
		    },
		    viewRender: function(view){
		    	if(!$scope.bottonsRendered){
			    	var left = $('.fc-header-right');
			    	var headerBody = $('.fc-header').find('tbody');
			    	var tr = $('<tr/>');
			    	tr.prepend(left.clone(true));
			    	headerBody.append(tr);
			    	left.remove();
			    	$scope.bottonsRendered = true;
		    	}
		    },
			defaultDate : new Date(),
			editable : true,
			events : $scope.events
		});
	});
	
	$scope.$on('events_refreshed', function(listenerEvent){
		console.log("Events refreshed. Loading new event list");
		loadEvents(function(){
			calendar.fullCalendar('removeEvents');
            $('#calendar').fullCalendar('addEventSource', $scope.events);
			calendar.fullCalendar('rerenderEvents');
		});
	});
})