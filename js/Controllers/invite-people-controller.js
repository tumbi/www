angular
.module('AppToDate.Controllers')
.controller(
		'invitePeopleCtrl',
		function($scope, $timeout, $filter, userService) {
			$scope.setNavTitle("Invite");
			$scope.contacts = [];
			$scope.searchKey = "";
			$scope.limit = 40;

			$scope.searchKeyChanged = function(searchKey) {
				$scope.limit = 40;
			}
			
			$scope.loadMore = function(){
				$scope.limit += 20;
			}

			$scope.isAnySelected = false;
			$scope.checkboxClicked = function(){
				$scope.isAnySelected = false;
				$filter('filter')($scope.contacts, $scope.searchKey).map(function(contact) {
					var selectedPhoneNumbers = $filter('filter')(contact.phoneNumbers, {isSelected: true});
					var selectedEmails = $filter('filter')(contact.emails, {isSelected: true});
					
					if((selectedPhoneNumbers && selectedPhoneNumbers.length > 0) 
						|| selectedEmails && selectedEmails.length > 0){
						$scope.isAnySelected = true;
					}
				});
			}
			
			var fetchContacts = function (searchKey) {
			    if ($scope.userDetails && $scope.userDetails.user_id) {
			        userService.getUninvitedFriends($scope.userDetails.user_id).then(function (response) {
			            $scope.contacts = response;
			        }, function (error) {
			            console.log("Error: " + JSON.stringify(error));
			        });
			    } else {
			        $scope.contacts = invitePeopleData;
			    }
//				console.log("Fetching friend facebook");
//				facebookConnectPlugin.api("/me/friends",["user_friends"], function(response){
//					console.log("Friend api response : " + JSON.stringify(response));
//				}, function(response){
//					console.log("Error friend api response: " + JSON.stringify(response));
//				});
			}

			var onError = function(contactError) {
				console.log("Error while fetching phone contacts");
			}

			fetchContacts($scope.searchKey);

			$scope.sendInvites = function(contacts) {
				var phones = [];
				var emails = [];
				var users = [];
				var invites = [];
				var inviteTemplate = {
						Invitee: {
							'ClientId': $scope.userDetails.user_id,
							'FirstName': $scope.userDetails.first_name,
							'LastName': $scope.userDetails.last_name							
						}	
				};
				if(contacts){
					$filter('filter')(contacts, $scope.searchKey).map(function(contact) {
						var userEmailSelected = undefined;
						var userPhoneSelected = undefined;						
        				
						var selectedPhoneNumbers = $filter('filter')(contact.phoneNumbers, {isSelected: true});
						var selectedEmails = $filter('filter')(contact.emails, {isSelected: true});
						if(selectedPhoneNumbers){
							selectedPhoneNumbers.map(function(phoneNumber){
								phones.push(phoneNumber.value);
								userPhoneSelected = phoneNumber.value;
								var invite = angular.copy(inviteTemplate);
								invite.InvitedPhone = phoneNumber.value;
								invites.push(invite);
							});
						}
						if(selectedEmails){
							selectedEmails.map(function(email){
								emails.push(email.value);
								userEmailSelected = email.value;
								var invite = angular.copy(inviteTemplate);
								invite.InvitedEmail = email.value;
								invites.push(invite);
							});
						}
						if(userEmailSelected || userPhoneSelected){
							var userData = {};
	        				//userData.username = user.username;
	        				//userData.id = data.Person.Id;
	        				//userData.user_id = data.Person.ClientId;
	        				userData.first_name = contact.displayName;
	        				userData.last_name = 'test';
	        				userData.access_token = appConfig.accessToken;
	        				userData.username = userEmailSelected || '';
	        				userData.phone = userPhoneSelected || 0;
	        				//userData.expired_in = data.TokenExpiryTime;
	        				//userData.refresh_token = data.RefreshToken;
	        				//appConfig.authorizationToken = data.AuthorizationToken;
							users.push(userData);
						}
					});
					sendPhoneInvites(phones);
					sendEmailInvites(emails);
					//saveUsers(users);
					sendInvites(invites);
				} else {
					console.log("Empty contacts");
				}
			}
			
			var sendPhoneInvites = function(phones){
				if(phones && phones.length > 0){
					console.log("Seding sms to : " + JSON.stringify(phones));
					phones.map(function(phone){
						SmsPlugin.prototype
						.send(
							phone,
							appConfig.inviteMessage,
							'',
							function() {	
								$scope.showResponseMessage('Message(s) sent successfully!', true);					
							},
							function(e) {
								console.log('Message Failed:'
										+ e);
							});
					});
				}
			}
			
			var sendEmailInvites = function(emails){
				if(emails && emails.length >0){
					console.log("Seding sms to : " + JSON.stringify(emails));
					window.plugin.email.open({
					    to:      emails,
					    subject: 'AppToDate Invitation',
					    body:    appConfig.inviteMessage,
					    isHtml:  true
					});
				}
			}
			
			var saveUsers = function(users){
				$scope.setShowLoader(true);
				console.log("Users to save: " + JSON.stringify(users));
				userService.addInvitedAttendees(users, $scope.userDetails.user_id).then(function(data){
					$scope.setShowLoader(false);
				}, function(error){
					$scope.setShowLoader(false);
				});
			}
			
			//No need of loader, will be called asynchronously
			var sendInvites = function(invites){
				userService.sendInvites(invites);
				$scope.searchKey = '';
				fetchContacts('');
				$scope.limit = 40;
			}
		})