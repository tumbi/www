angular.module('AppToDate.Services')
.factory('eventService',function(httpResource,$q,$filter, $location, $window){
	var convertServerToClientEvent = function(eventData){		
		var event = {
				user_id: eventData.Organizer.ClientId,
				title: eventData.Title,
				notes: eventData.Notes,
				start: new Date(eventData.Start),
				end: new Date(eventData.End),
				imageUrl: eventData.ImageUrl,
				location: {
					displayName: eventData.Location.DisplayName,
					latitude: eventData.Location.Latitude,
					longitude: eventData.Location.Longitude
				},
				remindBefore: eventData.RemindBefore,
				server_id: eventData.Id,
				EventAttendeeAssociations: eventData.EventAttendeeAssociations,
				GroupAssociations: eventData.GroupAssociations,
				CommentAssociations: eventData.CommentAssociations
			};
		return event;
	}
	
	var insertEventInDevice = function(title, location, notes, start, end, remindBefore){
		console.log("Inserting event in device");
		//prepare calendar options
		var calOptions = window.plugins.calendar.getCalendarOptions();
		calOptions.firstReminderMinutes = remindBefore;		
		
		window.plugins.calendar.createEventWithOptions(title,location.displayName,notes,
				start,end,calOptions,function(response){
			console.log("Plugin create event success: " + JSON.stringify(response));
		},function(error){
			console.log("Plugin create event error: " + JSON.stringify(error));				
		});
	}
	
	var deleteEventInDevice = function(eventServerId){
		var deferred = $q.defer();
		console.log("finding event with server id: " + eventServerId);
		if(!eventServerId){
			deferred.resolve(false);
			return deferred.promise;
		}
		$.when(DB.getEventByServerId(eventServerId)).then(
              function(event) {
        	  window.plugins.calendar.deleteEvent(event.title,event.location_title,event.notes,
      				new Date(event.start), new Date(event.end),function(response){	            		    
      				console.log("Plugin delete event success: " + JSON.stringify(response));
      				deferred.resolve(true);
          		},function(error){
          			console.log("Plugin delete event error: " + JSON.stringify(error));
          			deferred.reject(error);
          		});
          },
            function(errorMsg) {
              console.log("Error while fetching event: " + JSON.stringify(errorMsg));
              deferred.reject(errorMsg);
          });
		return deferred.promise;
	}
	
	return {
		createEvent : function(event){
			var deferred = $q.defer();
			var url = "Calendar/Create";
			if(event.client_id){
				url = "Calendar/Edit";
			}
			deleteEventInDevice(event.server_id).then(function(response){
				httpResource.loadUrl(url, "POST", event).success(function(eventData){
					event.server_id = eventData.Id;
		            $.when(DB.insertEvent(event)).then(
		              function(data) {
		                console.log("event saved successfully : " + JSON.stringify(event));
		            	insertEventInDevice(event.title,event.location,event.notes,
	        					event.start,event.end, event.remindBefore);
		                deferred.resolve(event);
		              },
		              function(errorMsg) {
		                console.log("Error while saving event");
		                deferred.reject(errorMsg);
		            });
				}).error(function(data){
					console.log("Error occured while saving the event : "+ JSON.stringify(data));
	                deferred.reject(data);
				});
			}, function(error){
				console.log("Error while deleting event from device: "+ JSON.stringify(error));
			});
            return deferred.promise;
		},
		
		getEvents : function(userId){
			var deferred = $q.defer();
			var currentMonth = new Date().getMonth()+1;
			
			var returnEvents = function(){
	            $.when(DB.getUserEvents(userId)).then(
	              function(data) {
	                console.log("events found successfully : " + JSON.stringify(data));
	                deferred.resolve(data);
	              },
	              function(errorMsg) {
	                console.log("Error while fetching event");
	                deferred.reject(errorMsg);
	            });
			}
			
			httpResource.loadUrl("Calendar/GetUserEventsForMonth?clientId="+ userId + "&month=" + currentMonth, "GET", null).success(function(events){
				console.log("found events: " + JSON.stringify(events));
				
				if(events.length > 0){
					events.map(function(event, eventIndex){
						$.when(DB.getEventClientIdFromServerId(event.Id)).then(
			              function(clientId) {
			            	  console.log("Client id for event found: "+ clientId)
			            	  if(!clientId){
			            		  var clientEvent = convertServerToClientEvent(event);
			            		  $.when(DB.insertEvent(clientEvent)).then(
			              	              function(data) {
			              	                console.log("event saved successfully : " + JSON.stringify(clientEvent));
			    	    	            	insertEventInDevice(clientEvent.title,clientEvent.location,clientEvent.notes,
			    	    	            			clientEvent.start,clientEvent.end, clientEvent.remindBefore);
			    	    	            	if(eventIndex === events.length -1){
			    	    						returnEvents();
			    	    	            	}
			              	              },
			              	              function(errorMsg) {
			              	                console.log("Error while saving event");
			              	            });
			            	  }else {
			            		  console.log("Event already created, no need to create again");
			            		  if(eventIndex === events.length -1){
    	    						  returnEvents();
    	    	            	  }
			            	  }
			              },
			              function(errorMsg) {
			                console.log("Error while saving event");
			            });
					});
				} else {
					returnEvents();
				}
			}).error(function(error){
                console.log("Error while fetching month event");
                returnEvents();			
			});

            return deferred.promise;
		},
		
		getEvent : function(eventId, userId){
			var deferred = $q.defer();

            $.when(DB.getEventById(eventId, userId)).then(
              function(event) {
                console.log("event found successfully : " + JSON.stringify(event));
                console.log("Fetching attendees");
                $.when(DB.getAttendeesByEvent(eventId)).then(
    	            function(data) {
    	            	event.attendees = data;
    	            	console.log("Event with attendees: " + JSON.stringify(event))
    	            	console.log("Fetching attendees");
		                $.when(DB.getGroupsByEvent(eventId)).then(
		    	            function(groupsData) {
		    	            	event.groups = groupsData;
		    	            	console.log("Event with groups: " + JSON.stringify(event));
		    	            	console.log("Fetching comments");
		    	            	$.when(DB.getEventComments(eventId)).then(
		    		    	            function(comments) {
		    		    	            	event.comments = comments;
		    		    	            	console.log("Event with comments: " + JSON.stringify(event));
		    		    	            	deferred.resolve(event);
		    		    	            },
		    		    	            function(errorMsg) {
		    			    	              console.log("Error while fetching comments: " + JSON.stringify(errorMsg));
		    			    	              deferred.reject(errorMsg);
		    			    	          });
		    	            },
		    	            function(errorMsg) {
		    	              console.log("Error while fetching attendees: " + JSON.stringify(errorMsg));
		    	              deferred.reject(errorMsg);
		    	          });
    	            },
    	            function(errorMsg) {
    	              console.log("Error while fetching attendees: " + JSON.stringify(errorMsg));
    	              deferred.reject(errorMsg);
    	          });
              },
              function(errorMsg) {
                console.log("Error while fetching event");
                deferred.reject(errorMsg);
            });

            return deferred.promise;
		},
		
		deleteEvent: function(eventId){
			var deferred = $q.defer();
			deleteEventInDevice(eventId).then(function(response){
				httpResource.loadUrl("Calendar/RemoveEvent/"+eventId, "POST", null).success(function(response){
					$.when(DB.deleteEvent(eventId)).then(
		              function(data) {
		                console.log("event deleted successfully : " + JSON.stringify(response));
		                deferred.resolve(true);
		              },
		              function(errorMsg) {
		                console.log("Error while deleting event");
		                deferred.reject(errorMsg);
		            });
				}).error(function(data){
					console.log("Error occured while deleting the event : "+ JSON.stringify(data));
	                deferred.reject(data);
				});
			}, function(error){
				console.log("Error while deleting event from device: "+ JSON.stringify(error));
			});
            return deferred.promise;
		},
		
		insertEventFromNotification: function(eventId){
			var deferred = $q.defer();
			$.when(DB.getEventClientIdFromServerId(eventId)).then(
              function(clientId) {
            	  console.log("Client id for event found: "+ clientId)
            	  if(!clientId){
          			console.log("insertEventFromNotification: fetching event from api");
            		  httpResource.loadUrl("Calendar/Get?appEventId="+eventId, "GET", event).success(function(eventData){
          				console.log("Fetched event :" + JSON.stringify(eventData));
          				//event.server_id = eventData.Id;
          				var event = convertServerToClientEvent(eventData);
          	            $.when(DB.insertEvent(event)).then(
          	              function(data) {
          	                console.log("event saved successfully : " + JSON.stringify(event));
	    	            	insertEventInDevice(event.title,event.location,event.notes,
	            					event.start,event.end, event.remindBefore);
	    	            	deferred.resolve(event.title);
          	              },
          	              function(errorMsg) {
          	                console.log("Error while saving event");
          	            });
          			}).error(function(data){
          				console.log("Error occured while saving the event : "+ JSON.stringify(data));
          			});
            	  } else {
            		  console.log("Event already created, no need to create again");
            	  }
              },
              function(errorMsg) {
                console.log("Error while saving event");
            });
            return deferred.promise;			
		},
		
		updateEventFromClientId: function(eventClientId){
			var deferred = $q.defer();
			var eventService = this;
			$.when(DB.getEventServerIdFromClientId(eventClientId)).then(
		              function(serverId) {
		            	  eventService.updateEventFromNotification(serverId).then(function(title){
		            		  deferred.resolve(title);
		            	  }, function(error){
			            	 deferred.reject(error); 
		            	  });
		              }, function(error){
		            	  console.log("Error: " + JSON.stringify(error));
		            	 deferred.reject(error); 
		              });
            return deferred.promise;	
		},
		
		updateEventFromNotification: function(eventId){
			var deferred = $q.defer();
			deleteEventInDevice(eventId).then(function(response){
				console.log("insertEventFromNotification: fetching event from api")
				httpResource.loadUrl("Calendar/Get?appEventId="+eventId, "GET", event).success(function(eventData){
					console.log("Fetched event :" + JSON.stringify(eventData));
		            $.when(DB.getEventClientIdFromServerId(eventId)).then(
		              function(clientId) {
		            	  if(clientId){
		      				  var event = convertServerToClientEvent(eventData);
		      				  event.client_id = clientId;
		            		  $.when(DB.insertEvent(event)).then(
		        	              function(data) {
		        	                console.log("event updated successfully : " + JSON.stringify(event));
			    	            	insertEventInDevice(event.title,event.location,event.notes,
			            					event.start,event.end, event.remindBefore);
			    	            	deferred.resolve(event.title);
		        	              },
		        	              function(errorMsg) {
		        	                console.log("Error while saving event");
		        	            });
		            	  } else {
		            		  console.log("Event in client db not found");
		            	  }
		              },
		              function(errorMsg) {
		                console.log("Error while saving event");
		            });
				}).error(function(data){
					console.log("Error occured while saving the event : "+ JSON.stringify(data));
				});
			}, function(error){
				console.log("Error while deleting event from device: "+ JSON.stringify(error));
			});
            return deferred.promise;	
		},
		
		deleteEventFromNotification: function(eventId){
			deleteEventInDevice(eventId).then(function(response){
				if(response){
					$.when(DB.deleteEvent(eventId)).then(
		              function(data) {
		                console.log("event deleted successfully : " + JSON.stringify(data.rowsAffected));
		              },
		              function(errorMsg) {
		                console.log("Error while deleting event");
		                deferred.reject(errorMsg);
		            });
				} else {
					console.log("Unexpected response: " + JSON.stringify(response));
				}
			}, function(error){
				console.log("Error while deleting event from device: "+ JSON.stringify(error));
			});
		},
		
		postComment: function(event, comment){
			var deferred = $q.defer();
			httpResource.loadUrl("Calendar/PostComment?appEventId="+event.server_id, "POST", comment).success(function(response){
				$.when(DB.postEventComment(event.id, comment)).then(
						function(commentId) {
							console.log("comment added successfully: " + commentId);
							deferred.resolve(commentId);
			              },
			              function(errorMsg) {
			                console.log("Error while adding comment to event");
			                deferred.reject(errorMsg);
			            });
			}).error(function(error){
				console.log("Error while calling post comment API API ")
				deferred.reject(errorMsg);
			});
            return deferred.promise;
		},
		
		postEventStatus: function(event, userId, status){
			var deferred = $q.defer();
			httpResource.loadUrl("Calendar/PostAttendeeStatus?appEventId="+event.server_id+"&clientId="+userId+"&status="+status,
					"POST", null).success(function(response){
				$.when(DB.saveStatusForEvent(event.id, userId, status))
					.then(function(response){
						console.log("Saved the status");
						insertEventInDevice(event.title, { displayName: event.location_title},event.notes,
		    					event.start,event.end, event.remindBefore);
						deferred.resolve(response);
					}, function(errorMsg){
						console.log("Error while posting status of the attendee");
					});
			}).error(function(error){
				console.log("Error while calling post status API ")
				deferred.reject(error);
			});
            return deferred.promise;
		}
	}
});