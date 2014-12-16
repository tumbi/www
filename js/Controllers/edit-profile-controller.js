angular.module('AppToDate.Controllers')

.controller('editProfileCtrl', function($scope, $location, userService) {
    $scope.setNavTitle("View Profile");
	$scope.user = angular.copy($scope.userDetails);
	$scope.user.phone = isNaN($scope.user.phone) ? 0 : parseInt($scope.user.phone);
	
	console.log("User details: " + JSON.stringify($scope.user));
	$scope.saveProfile = function(user){
		console.log("Updated user details: " + JSON.stringify(user));
		$scope.setShowLoader(true);
		userService.saveUserProfile(user).then(function(response){
			$scope.setUserDetails(response);
			$scope.showResponseMessage('Profile saved successfully', true);
			$scope.setShowLoader(false);
		}, function(error){
			$scope.showResponseMessage(error.Message||'An error occured', false);
			$scope.setShowLoader(false);
		});
	}
});