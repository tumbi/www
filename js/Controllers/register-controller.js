angular.module('AppToDate.Controllers')

.controller('registerCtrl', function($scope, $location, registerService, userService) {
  	$scope.navTitle = "Register";
	
	$scope.Register = function(user)
	{
		if(user.password == user.confirm_password){
		    $scope.setShowLoader(true);
			registerService.registerUser(user).then(function(response){
				if(response){
					userService.insertLoggedInUser({username: user.username, password: user.password, 
						type: 2}).then(function(flag){
							$scope.setUserDetails(response);
							$location.path('/home');
						}, function(error){
							console.log("Error while inserting data in logged in user: " + JSON.stringify(error));
						});
				} else {
					$scope.showResponseMessage('An error occured', false);
				}
				$scope.setShowLoader(false);
			},
			function(errorData){
				$scope.showResponseMessage(errorData.Message||'An error occured', false);
				console.log("Registering request failed : " + JSON.stringify(errorData));
				$scope.setShowLoader(false);
			});
		} else {
			$scope.showErrorMessage('Passwords do not match');
		}
	}
});


