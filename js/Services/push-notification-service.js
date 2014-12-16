var showNotificationInTray = function(title, message){
//	var options = {
//		type: "basic",
//		iconUrl: "images/profile-icon.png",
//		title: title,
//		message: message,
//		priority: 1
//	};
//	chrome.notifications.create("id1", options, function(notificationId){
//		console.log("Notification created successfully with id: " + notificationId)
//	});
	window.plugin.notification.local.add({
	    title:   title,
	    message: message,
	    smallIcon:'logo',
	    icon:'logo'
	});
}
var currentEvent = "";
function onNotificationGCM(e) {	
	setTimeout(function(){
		console.log("onNotificationGCM" + JSON.stringify(e.event));
	    switch (e.event) {
	        case 'registered':
	            if (e.regid.length > 0) {
	                console.log("Device Registered Event Received" + JSON.stringify(e.regid));
	                $.when(DB.selectDeviceId()).then(
	                    function(deviceId) {
	                    	if(deviceId){
	                    		console.log("DeviceId already present no need to insert again: " + JSON.stringify(deviceId));
	                     	} else {
	                     		DB.insertDeviceId(e.regid);
	                     	}
	                    },
	                    function(errorMsg) {
	                        console.log("Error while fetching deviceId : " + JSON.stringify(errorMsg));
	                    });
	            }
	            break;

	        case 'message':
	            if (e.foreground) {
	            	console.log("Notification message incoming: " + JSON.stringify(e.payload));
	            	var eventService = injector.get('eventService');
	            	var userService = injector.get('userService');
	               // var my_media = new Media("beep.wav");
	               // my_media.play();
	            	var payload = e.payload;
	            	if(payload != null){
	            		switch(payload.NotificationType){
		            		case 'EventCreate':
		            			var scope = angular.element('#appBody').scope();
		            			if(currentEvent != payload.InformationId){
		            				currentEvent = payload.InformationId;
			            			eventService.insertEventFromNotification(payload.InformationId).then(function(title){
				            			showNotificationInTray("Event Created", "A new event '" + title + "' has been created.");	
				            			console.log("A new event '" + title + "' has been created.")
				            			scope.$broadcast('events_refreshed');
			            				currentEvent = "";
			            			});
		            			}
		            			break;
		            		case 'EventEdit':
		            			var scope = angular.element('#appBody').scope();
		            			if(currentEvent != payload.InformationId){
		            				currentEvent = payload.InformationId;
			            			eventService.updateEventFromNotification(payload.InformationId).then(function(title){
				            			showNotificationInTray("Event Updated", "'" + title + "' has been updated.");
				            			console.log("'" + title + "' has been updated.");
				            			scope.$broadcast('event_refreshed', payload.InformationId);
				            			currentEvent = "";
			            			});
		            			}
		            			break;
		            		case 'EventDelete':
		            			var scope = angular.element('#appBody').scope();
		            			eventService.getEvent(payload.InformationId, 0).then(function(event){
			            			eventService.deleteEventFromNotification(payload.InformationId);
			            			showNotificationInTray("Event Deleted", "'" + event.title + "' has been deleted.");	
			            			console.log("'" + event.title + "' has been deleted.");
			            			scope.$broadcast('events_refreshed');
			            			currentEvent = "";
		            			});
		        				break;
		            		case 'EventAccepeted':
		            			var scope = angular.element('#appBody').scope();
		            			if(currentEvent != payload.InformationId){
		            				currentEvent = payload.InformationId;
			            			eventService.updateEventFromNotification(payload.InformationId).then(function(title){
				            			showNotificationInTray("Attendee Accepted", "'" + title + "' has been accepted by an attendee.");		
				            			console.log("'" + title + "' has been accepted by an attendee.");   
				            			scope.$broadcast('event_refreshed', payload.InformationId);         	
				            			currentEvent = "";			
			            			});
		            			}
		        				break;
		            		case 'EventRejected':
		            			var scope = angular.element('#appBody').scope();
		            			if(currentEvent != payload.InformationId){
		            				currentEvent = payload.InformationId;
			            			eventService.updateEventFromNotification(payload.InformationId).then(function(title){
				            			showNotificationInTray("Attendee Accepted", "'" + title + "' has been rejected by an attendee.");
				            			console.log("'" + title + "' has been rejected by an attendee.");				
				            			scope.$broadcast('event_refreshed', payload.InformationId);
				            			currentEvent = "";
			            			});
		            			}
		        				break;
		            		case 'EventMayBe':
		            			var scope = angular.element('#appBody').scope();
		            			if(currentEvent != payload.InformationId){
		            				currentEvent = payload.InformationId;
			            			eventService.updateEventFromNotification(payload.InformationId).then(function(title){
				            			showNotificationInTray("Attendee Accepted", "An attendee may or may not join the event '" + title + "'");
				            			scope.$broadcast('event_refreshed', payload.InformationId);
				            			currentEvent = "";
			            			});
		            			}
		        				break;
		            		case 'PersonJoined':
		            			var scope = angular.element('ion-nav-view').scope();
		            			var userId = scope.userDetails.user_id;
		            			console.log("User Id: "+ userId);
		            			userService.insertPersonDetailsFromNotification(payload.InformationId, userId).then(function(name){
		            				showNotificationInTray("Invitation accepted", name +" has accepted your invitation");
		            			});
		        				break;
		            		case 'CommentAdded':
		            			var scope = angular.element('#appBody').scope();
		            			if(currentEvent != payload.InformationId){
		            				currentEvent = payload.InformationId;
			            			eventService.updateEventFromNotification(payload.InformationId).then(function(title){
				            			showNotificationInTray("Comment added", "A new comment added to event "+ title);
				            			scope.$broadcast('event_refreshed', payload.InformationId);
				            			currentEvent = "";
			            			});
		            			}
		        				break;
		            		case 'ProfilePicUpdated':
		            			userService.updateUserImage(payload.InformationId).then(function(name){
		            				console.log("The picture has been updated");
		            			});
		        				break;
	        			
	            		}
	            	}
	            	console.log("Revieved notification event: " + JSON.stringify(e));
	            }
	            else {  
	              // otherwise we were launched because the user touched a notification in the notification tray.
	            }

	            break;

	       case 'error':
	           break;
	       default:
	          break;
	    }
	}, 2000);
}