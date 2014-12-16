angular.module('AppToDate.Services')
.factory('oauthLoginService', function($q, httpResource){
	var provider = "oauth";
	var email = "test@test.com";
	var loginData = {
			user_id: 1,
			email: email,
			auth_provider: provider,
			access_token: "1_test@test.com_oauth_token",
			login_time: new Date().getTime(),
			expired_in: new Date(new Date().getTime() + 1*24*60*60*1000),
			refresh_token: "1_test@test.com_oauth_refresh_token",
			
	};
	
	return {
		login: function(user){
			var deferred = $q.defer();
            console.log('Authenticating user');
            user.accessToken = appConfig.accessToken;
            $.when(DB.selectDeviceId()).then(
	            function(deviceId) {
	            	if(deviceId){
	            		console.log("DeviceId found: " + JSON.stringify(deviceId) + " : Setting to login info");
	            		user.deviceId = deviceId;
	            		user.deviceType = 1; //1 for android
	            		user.person = {
	            			timeZoneInfo: appConfig.timezone
	            		}
	            		console.log("User to login: " + JSON.stringify(user));
	            		httpResource.loadUrl("authentication/login", "POST", user).success(function(data){
	        				console.log("User authenticated")
	        				httpResource.loadUrl("person/UpdatePersonDeviceAssociation?clientId="+data.Person.ClientId+"&deviceId="+user.deviceId+"&deviceType=1", "POST", null).success(function(data1){
	        					console.log("device Id updated");
	        					var userData = {};
		        				userData.username = user.username;
		        				userData.id = data.Person.Id;
		        				userData.user_id = data.Person.ClientId;
		        				userData.first_name = data.Person.FirstName;
		        				userData.last_name = data.Person.LastName;
		        				userData.access_token = appConfig.accessToken;
		        				userData.expired_in = data.TokenExpiryTime;
		        				userData.refresh_token = data.RefreshToken;
		        				userData.phone = data.Person.PhoneNo || 0;
		        				appConfig.authorizationToken = data.AuthorizationToken;
		        				
		        				$.when(DB.insertLoginDetail(userData)).then(
		        	              function(savedData) {
		        	                console.log("Saved login information in db : " + JSON.stringify(userData));
		        					if(data.Person.IsPaidUser){
		        						console.log("User is paid user");
		        						DB.insertUserUpgraded(userData.user_id).then(function(response){
		        							console.log("User upgrade information inserted");
		        							deferred.resolve(userData);
		        						}, function(error){
		        							console.log("Error while inserting user upgrade information: "+ JSON.stringify(error));
		        							deferred.resolve(userData);
		        						});
		        					} else{
		        						console.log("User is not paid user");
		        						deferred.resolve(userData);
		        					}
		        	              },
		        	              function(errorMsg) {
		        	                console.log("Error while saving login information");
		        					deferred.reject(errorMsg);
		        	            });	
	        					
	        				}).error(function(data1, status) {
		        				console.log("Device Id Updated failed: " + JSON.stringify(data1));
		        				deferred.reject(data);
		        			});
	        				
	        			}).error(function(data, status) {
	        				console.log("Login failed: " + JSON.stringify(user));
	        				deferred.reject(data);
	        			});
	             	} else {
	             		console.log("DeviceId not found cannot login");
	             		deferred.reject({deviceId: deviceId, Message: "Device id not found. Could not login."});
	             	}
	            },
	            function(errorMsg) {
	              console.log("Error while fetching deviceId: " + JSON.stringify(errorMsg));
	              deferred.reject(errorMsg);
	          });
			
			return deferred.promise;			
		}
	}
});