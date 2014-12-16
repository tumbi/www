angular.module('AppToDate.Controllers')

.controller('splashScreenCtrl', 
		function($scope,$state,$rootScope,LoaderService,sessionService,Authentication, $location, registerService, userService) {

	userService.getLoggedInUser().then(function(user){
		if(user){
			console.log("User already found: " + JSON.stringify(user));
			callLoginService(user, true);
		}
		else{
			$location.path("/login");
		}
	}, function(error){
		console.log("Error while fetching getLoggedInUser: " + JSON.stringify(error));
	});
	
	var callLoginService = function(data, alreadyLoggedIn)
	{
		$scope.setShowLoader(true);
		Authentication.oa.login(data).then(function(response){
			if(response){
				if(!alreadyLoggedIn){
					userService.insertLoggedInUser({username: data.username, password: data.password, 
						type: data.type}).then(function(flag){
							$scope.setUserDetails(response);
							$location.path('/home');
						}, function(error){
							console.log("Error while inserting data in logged in user: " + JSON.stringify(error));
						})
				} else {
					$scope.setUserDetails(response);
					$location.path('/home');
				}
			} else {
				$scope.showResponseMessage("Username/password combination does not exist.", false);
			}
			$scope.setShowLoader(false);
		}, function(data){
			console.log("Login failded due to : " + JSON.stringify(data));
			$scope.showResponseMessage("Username/password combination does not exist.", false);
			$scope.setShowLoader(false);
		});
	}

});