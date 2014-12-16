angular.module('AppToDate.Services')
.factory('userService', function($q, httpResource, $filter){
	return {
		getFriends: function(userId){
			var deferred = $q.defer();
            console.log('Fetching friends');
            $.when(DB.getFriendsByUserId(userId)).then(
	            function(data) {
	            	deferred.resolve(data);
	            },
	            function(errorMsg) {
	              console.log("Error while fetching friends: " + JSON.stringify(errorMsg));
	              deferred.reject(errorMsg);
	          });
			
			return deferred.promise;			
		},
		
		createGroup: function(group){
			var deferred = $q.defer();
            console.log('saving group');
            angular.forEach(group.groupPersonAssociations, function(item){
            	item.Person = {};
            	item.Person.ClientId = item.user_id;
            	item.Person.FirstName = item.first_name;
            	item.Person.LastName = item.last_name;            	
            });
        	httpResource.loadUrl("Group/Post", "POST", group).success(function(response){
        		group.server_id = response.Id;
        		DB.insertGroup(group).then(function(data){
        			deferred.resolve(group);
        		}, function(error){
        			console.log("errror in createGroup: "+ JSON.stringify(error));
        		});
        		
        	}).error(function(error){
        		console.log("Error occured while calling group save api: " + JSON.stringify(error));
        		deferred.reject(error);
        	});
    		return deferred.promise;
		},
		
		addInvitedAttendees: function(users, user_id){
			var deferred = $q.defer();
			if(users && users.length > 0){
				httpResource.loadUrl("Authentication/GenerateDummyClientIds?count=" + users.length, "POST", null).success(function(response){
					users.map(function(user, index){
						user.user_id = response[index];
						$.when(DB.insertLoginDetail(user)).then(
		        	              function(savedData) {
		        	            	  console.log("Saved information information in db : " + JSON.stringify(savedData));
		        	            	  DB.insertFriend(user_id, user.user_id);
		        	              },
		        	              function(errorMsg) {
		        	                console.log("Error while saving login information");
		        	            });	
					});
					deferred.resolve(null);
				}).error(function(error){
	        		console.log("Error occured while generate dummy api: " + JSON.stringify(error));
	        		deferred.resolve(null);
	        	});
			}
    		return deferred.promise;
		},
		getGroups: function(userId){
			var deferred = $q.defer();
            console.log('Fetching groups');
            $.when(DB.getGroupsForOwner(userId)).then(
	            function(data) {
	            	deferred.resolve(data);
	            },
	            function(errorMsg) {
	              console.log("Error while fetching groups: " + JSON.stringify(errorMsg));
	              deferred.reject(errorMsg);
	          });
			
			return deferred.promise;			
		},
		getLoggedInUser: function(){
			var deferred = $q.defer();
            console.log('Fetching logged in user');
            $.when(DB.getCurrentLoggedInUser()).then(
	            function(data) {
	            	deferred.resolve(data);
	            },
	            function(errorMsg) {
	              console.log("Error while fetching logged in user: " + JSON.stringify(errorMsg));
	              deferred.reject(errorMsg);
	          });
			
			return deferred.promise;	
		},
		insertLoggedInUser: function(user){
			var deferred = $q.defer();
            console.log('inserting logged in user');
            $.when(DB.insertCurrentLoggedInUser(user)).then(
	            function(data) {
	            	deferred.resolve(data);
	            },
	            function(errorMsg) {
	              console.log("Error while inserting logged in user: " + JSON.stringify(errorMsg));
	              deferred.reject(errorMsg);
	          });
			
			return deferred.promise;	
		},
		
		getUninvitedFriends: function(userId, searchKey){
			var deferred = $q.defer();
			this.getFriends(userId).then(function(invitedFriends){
				console.log("Already invited friends: "+ JSON.stringify(invitedFriends));
				
				//Calling plugin to get friends
				var options = {};
				options.filter = searchKey;
				var fields = ["displayName",
						"phoneNumbers", "emails" ];
				if(navigator.contacts){
					navigator.contacts.find(fields, function(contacts) {
						console.log("All friends from plugin length: " + JSON.stringify(contacts.length));
						var filteredContacts = [];
						angular.forEach(contacts, function(contact){
							var isInvited = false;
							if(contact.emails && contact.emails.length > 0){
								angular.forEach(invitedFriends, function(friend){
									if(friend.username && friend.username != "null" && friend.username != "undefined"){
										var filteredEmail = $filter('filter')(contact.emails, {value:  friend.username});
										if(filteredEmail.length > 0){
											isInvited = true;
										}
									}
								});
							}
							if(contact.phoneNumbers && contact.phoneNumbers.length > 0 && !isInvited){
								angular.forEach(invitedFriends, function(friend){
									if(friend.phone && friend.phone != 0){
										var filteredPhone = $filter('filter')(contact.phoneNumbers, {value:  friend.phone});
										if(filteredPhone.length > 0){
											isInvited = true;
										}
									}
								});
							}
							if(!isInvited){
								filteredContacts.push(contact);
							} else {
								console.log("Filtered friend: " + JSON.stringify(contact));
							}
						});
						console.log("Filtered contacts :"+ JSON.stringify(filteredContacts.length));
						deferred.resolve(filteredContacts);
					}, function(error){
						console.log("Error while fetching contacts from plugin: " + JSON.stringify(error));
					}, options);
				} else {
					console.log("navigator.contacts cannot be resolved");
				}
			}, function(error){
				console.log("Error while getting friends of user: "+ JSON.stringify(error));
			});
			return deferred.promise;
		},
		
		sendInvites: function(invites){
			if(invites && invites.length > 0){
				console.log("Inviting people: " + JSON.stringify(invites));
				httpResource.loadUrl("Person/InvitePeople", "POST", invites)
					.success(function(response){
						console.log("Success invite API: " + JSON.stringify(response));
					}).error(function(error){
						console.log("Error while calling the invite API: " + JSON.stringify(error));
					});
			}			
		},
		
		saveUserProfile: function(user){
			var deferred = $q.defer();
            console.log('Saving user: ' + JSON.stringify(user));
            var serverUser = {
        		FirstName: user.first_name,
        		LastName: "test",
        		ClientId: user.user_id,
        		PhoneNo: user.phone,
        		Email: user.username, 
        		TimeZoneInfo: appConfig.timezone
            }
            DB.isUserUpgraded(user.user_id).then(function(response){
            	if(response){
            		serverUser.IsPaidUser = true;
            	}
	            httpResource.loadUrl("Person/Edit", "POST", serverUser).success(function(person){
	            	httpResource.loadUrl("Person/ChangePassword?clientId=" + user.user_id + "&password=" + user.password, 
	            			"POST", serverUser).success(function(nperson){
			            $.when(DB.insertLoginDetail(user)).then(
				            function(data) {
				            	userService.insertLoggedInUser(user).then(function(response){
					            	console.log("Information saved successfully");
					            	deferred.resolve(user);
				            	}, function(error){
				            		console.log("Error while saving groups: " + JSON.stringify(error));
						            deferred.reject(error);
				            	});
				            },
				            function(errorMsg) {
				              console.log("Error while saving groups: " + JSON.stringify(errorMsg));
				              deferred.reject(errorMsg);
				          });
	    			}).error(function(error){
	    				console.log("Error occured while calling the change password API: " + JSON.stringify(error));
	    				deferred.reject(error);
	    			});
	            }).error(function(error){
					console.log("Error occured while calling the edit person API: " + JSON.stringify(error));
					deferred.reject(error);
				});
            }, function(error){
            	console.log("Error while selecting upgrade information");
            });
			return deferred.promise;	
		},
		
		insertPersonDetailsFromNotification: function(clientId, userId){
			var deferred = $q.defer();
			httpResource.loadUrl("Person/GetPerson?clientId=" + clientId, "GET", null).success(function(person){
				var userData = {
					user_id: person.ClientId,
					username: person.Email,
					access_token: "",
					login_time: "",
					expired_in: "",
					auth_provider: "",
					refresh_token: "",
					first_name: person.FirstName,
					last_name: person.LastName,
					phone: person.PhoneNo
				}
				
				$.when(DB.insertFriend(userId, clientId)).then(
			            function(data) {
			            	console.log("user Friend added successfully");
			            	$.when(DB.insertLoginDetail(userData)).then(
						            function(data) {
						            	console.log("friend saved successfully");
						            	deferred.resolve(userData.first_name);
						            },
						            function(errorMsg) {
						              console.log("Error while saving friend: " + JSON.stringify(errorMsg));
						              deferred.reject(errorMsg);
						          });
			            },
			            function(errorMsg) {
			              console.log("Error while saving user friend: " + JSON.stringify(errorMsg));
			              deferred.reject(errorMsg);
			          });
				
			}).error(function(error){
				console.log("Error occured while calling the get person API: " + JSON.stringify(error));
			});
			return deferred.promise;	
		},
		
		processUninvitedContacts: function(userId){
			var deferred = $q.defer();
			var emailListDone = false;
			var phoneListDone = false;
			userService = this;
						
			userService.getUninvitedFriends(userId, "").then(function(contacts){
				if(contacts && contacts.length > 0){
					var emails = [];
					var phones = [];
					contacts.map(function(contact){
						if(contact.emails && contact.emails.length > 0){
							contact.emails.map(function(email){
								emails.push(email.value);
							});
						}
						if(contact.phoneNumbers && contact.phoneNumbers.length > 0){
							contact.phoneNumbers.map(function(phone){
								phones.push(phone.value);
							});
						}
					});
					httpResource.loadUrl("Person/GetFriendsByEmailList", "POST", emails).success(function(clientIds){
						console.log("Email client ids: " + JSON.stringify(clientIds));
						if(clientIds && clientIds.length > 0){
							clientIds.map(function(clientId, index){
								if(clientId != userId){
									userService.insertPersonDetailsFromNotification(clientId, userId).then(function(){
										if(index == clientIds.length-1){
		
											emailListDone = true;
											if(emailListDone && phoneListDone){
												deferred.resolve(true);
											}
										}
									}, function(error){
										
									});
								} else {
									if(index == clientIds.length-1){
										emailListDone = true;
										if(emailListDone && phoneListDone){
											deferred.resolve(true);
										}
									}
								}
							});
						} else {
							emailListDone = true;
							if(emailListDone && phoneListDone){
								deferred.resolve(true);
							}
						}
					}).error(function(error){
						console.log("Error while calling emails api call: " + JSON.stringify(error));
						deferred.reject(error);
					});
					httpResource.loadUrl("Person/GetFriendsByPhoneList", "POST", phones).success(function(clientIds){
						console.log("Email client ids: " + JSON.stringify(clientIds));
						if(clientIds && clientIds.length > 0){
							clientIds.map(function(clientId, index){
								if(clientId != userId){
									userService.insertPersonDetailsFromNotification(clientId, userId).then(function(){
										if(index == clientIds.length-1){
											phoneListDone = true;
											if(emailListDone && phoneListDone){
												deferred.resolve(true);
											}
										}
									}, function(error){
										
									});
								} else {
									if(index == clientIds.length-1){
										emailListDone = true;
										if(emailListDone && phoneListDone){
											deferred.resolve(true);
										}
									}
								}
							});
						} else {
							phoneListDone = true;
							if(emailListDone && phoneListDone){
								deferred.resolve(true);
							}
						}
					}).error(function(error){
						console.log("Error while calling emails api call: " + JSON.stringify(error));
						deferred.reject(error);
					});
				} else {
					console.log("No uninvited friends found")
					deferred.resolve(false);
				}
			}, function(error){
				console.log("Error getting uninvited frieds from contacts");
				deferred.reject(error);
			});
			return deferred.promise;
		},
		
		updateUserImage: function(userId){
			var deferred = $q.defer();
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
				var dowloadLink = encodeURI(appConfig.apiUrl + "Image/Get?clientId=" + userId);
				var fileName = userId + ".jpg";
				var directoryEntry = fileSystem.root;
				directoryEntry.getDirectory(appConfig.userImagesFolder, { create: true, exclusive: false }, 
						function(){
					console.log("Directory created successfully");
					var rootdir = fileSystem.root;
					//var fp = rootdir.toUrl();
					var fp = fileSystem.root.toURL() + "/" + appConfig.userImagesFolder + "/" + fileName;
					console.log("The full path of the file to update is : " + fp);
					var fileTransfer = new FileTransfer();
					// File download function with URL and local path
					fileTransfer.download(dowloadLink, fp,
					                    function (entry) {
					                        deferred.resolve(fp);
					                    },
					                 function (error) {
					                     //Download abort errors or download failed errors
					    				 console.log("Error while downloading file: " + JSON.stringify(error));
					                     //alert("download error target " + error.target);
					                     //alert("upload error code" + error.code);
					                     deferred.reject(error);
					                 }
					            );
				}, function(error){
					console.log("Error while creating/opening directory: " + JSON.stringify(error));
	                deferred.reject(error);
				});
			}, function(error){
				console.log("Error while requesting file system: " + JSON.stringify(error));
                deferred.reject(error);
			});
			return deferred.promise;
		},
		
		getUserImage: function(userId){
			var deferred = $q.defer();
			var userService = this;
			
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
				var fileName = userId + ".jpg";
				var fp = fileSystem.root.toURL() + "/" + appConfig.userImagesFolder + "/" + fileName;
				console.log("The path of file to get is : " + fp)
				window.resolveLocalFileSystemURI(fp, function(fileSystem){
					console.log("File found :" + fp);
					deferred.resolve(fp);
				}, function(error){
					console.log("Error while getting the file from file system: " + JSON.stringify(error));
					console.log("Downloading from server.");
					userService.updateUserImage(userId).then(function(filePath){
						console.log("File found" + filePath);
						deferred.resolve(filePath);						
					}, function(error){
						console.log("Error while updating user image: " + JSON.stringify(error));
						deferred.reject(error);	
					});
				});
			}, function(error){
				console.log("Error while requesting file system: " + JSON.stringify(error));
                deferred.reject(error);
			});
			return deferred.promise;
		},
		
		logout: function(){
			var deferred = $q.defer();
			$.when(DB.deleteCurrentLoggedInUser()).then(
	            function(data) {
	            	console.log("Logged in user delete successfully");
	            	deferred.resolve(true);
	            },
	            function(errorMsg) {
	              console.log("Error while deleting logged in user: " + JSON.stringify(errorMsg));
	              deferred.reject(errorMsg);
	          });
			return deferred.promise;
		}
	}
});