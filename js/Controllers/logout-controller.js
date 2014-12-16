angular
.module('AppToDate.Controllers')
.controller(
		'logoutCtrl',
function($scope, $filter, $location, userService) {
	$scope.setNavTitle("Calendar");
	
	$scope.setShowLoader(true);
	userService.logout().then(function(){
		$scope.showResponseMessage('You have been logged out', true);
		$scope.setShowLoader(false);
		$scope.setUserDetails(undefined);
		$location.path("/login");
		console.log("Location.Path set to Login");
	}, function(error){
		console.log("Error while logout the user");
		$scope.setShowLoader(false);
		$scope.showResponseMessage(error.Message||'An error occured', false);
	})
});