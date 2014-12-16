angular.module('AppToDate.Controllers')

.controller('createGroupCtrl', 
  function($scope, userService, $filter) {
	$scope.setNavTitle("Create Group");
	 $scope.success = false;
	 $scope.group = {
		 'title' : ''
	 }
	 $scope.selectAll = false;
	 
	 if ($scope.userDetails && $scope.userDetails.user_id) {
	     userService.getFriends($scope.userDetails.user_id).then(function (data) {
	         console.log("Got friends : " + JSON.stringify(data));
	         $scope.friends = data;
	     }, function (error) {
	         console.log("Error occured while getFriends: " + JSON.stringify(error));
	     })
	 } else {
	     $scope.friends = [{ first_name: "Attendee 1" }, { first_name: "Attendee 2" }, { first_name: "Attendee 3" }, { first_name: "Attendee 4" }];
	 }
	
	$scope.selectAllFriends = function(list, searchKey, flag){
		if(list){
			var filtered = flag ? $filter('filter')(list, {'first_name': searchKey}) : list;
			if(filtered && filtered.length > 0){
				angular.forEach(filtered, function(item){
					item.isSelected = flag;
				});
			}
		}
	}
	
	$scope.createGroup = function(title){
		if(!title || title.length == 0){
			$scope.showResponseMessage('Please enter the title!', false);
			return
		}
		if($scope.friends && $scope.friends.length > 0){
			var selectedFriends = $filter('filter')($scope.friends, {'isSelected': true});
			if(selectedFriends && selectedFriends.length > 0){
				$scope.setShowLoader(true);
				var group = {};
				group.title = title;
				group.groupPersonAssociations = selectedFriends;
				group.Owner = {
						'ClientId': $scope.userDetails.user_id,
						'FirstName' : $scope.userDetails.first_name,
						'LastName': $scope.userDetails.last_name
				}
				userService.createGroup(group).then(function(response){
					console.log("Group Inserted : " + JSON.stringify(response));
					$scope.setShowLoader(false);
					$scope.goBack();
				}, function(error){error
					console.log("Error occured userService.createGroup : " + JSON.stringify(error));
					$scope.showResponseMessage(error.Message||'An error occurred', false);
					$scope.setShowLoader(false);
				});
				return
			}
		} 
		$scope.showResponseMessage('No attendees selected!', false);
		return
	}
});