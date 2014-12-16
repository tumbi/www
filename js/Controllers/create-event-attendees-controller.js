angular.module('AppToDate.Controllers')
.controller('createEvent.attendeesCtrl', function($scope, $filter, $location, imageService, eventService, googleMapService, userService) {
	$scope.attendeeTab = 'contacts';
	$scope.searchAttendees = {
		group: '',
		contact: ''
	}
	
	if ($scope.userDetails && $scope.userDetails.user_id) {
	    userService.getFriends($scope.userDetails.user_id).then(function (data) {
	        angular.forEach(data, function (item) {
	            $scope.contacts.push(item);
	        });
	        console.log("Got friends : " + JSON.stringify($scope.contacts));
	        if ($scope.setSelected) {
	            $scope.setSelected($scope.contacts, $scope.selectedContacts);
	        }
	    }, function (error) {
	        console.log("Error occured while getFriends: " + JSON.stringify(error));
	    })

	    userService.getGroups($scope.userDetails.user_id).then(function (data) {
	        console.log("Got groups : " + JSON.stringify(data));
	        angular.forEach(data, function (item) {
	            console.log("Pushing to groups : " + JSON.stringify(item));
	            $scope.groups.push(item);
	        });
	        if ($scope.setSelected) {
	            $scope.setSelected($scope.groups, $scope.selectedGroups);
	        }
	    }, function (error) {
	        console.log("Error occured while getGroups: " + JSON.stringify(error));
	    })
	} else {
	    $scope.contacts = [{ first_name: "Attendee 1" }, { first_name: "Attendee 2" }, { first_name: "Attendee 3" }, { first_name: "Attendee 4" }];
	    $scope.groups = [{ group_name: "Group 1" }, { group_name: "Group 2" }, { group_name: "Group 3" }, { group_name: "Group 4" }];
	}
	
	$scope.selectAllContacts = function(list, searchValue, flag){
		var filtered = flag ? $filter('filter')(list, {'first_name' : searchValue}) : list; 
		if(filtered && filtered.length > 0){
			filtered.map(function(item){
				item.isSelected = flag;
			});
		}
	}
	
	$scope.selectAllGroups = function(list, searchValue, flag){
		var filtered = flag ? $filter('filter')(list, {'group_name' : searchValue}) : list; 
		if(filtered && filtered.length > 0){
			filtered.map(function(item){
				item.isSelected = flag;
			});
		}
	}
});