// Ionic Starter App, v0.9.20

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var injector;
angular.module('AppToDate', [
                            'ionic',
                            'AppToDate.Controllers',
                            'AppToDate.Services',
                            'AppToDate.Directives',
                            'AppToDate.Filters',
                            'ui.bootstrap.modal'])

.run(function($ionicPlatform, $injector) {
	injector = $injector;
  $ionicPlatform.ready(function() {
    StatusBar.styleDefault();
    
//    setTimeout(function(){
//        var notification = {
//            	event: "message",
//            	foreground: "test",
//            	payload: {
//            		NotificationType: "PersonJoined",
//            		InformationId: 'b4326482-2f50-43f6-a7e1-5f35229a4cc0'
//            	}
//            };
//            onNotificationGCM(notification);
//    }, 5000);
    
    //Check if device already already present
	console.log("Registering device for push notifications");
	var pushNotification = window.plugins.pushNotification;
    
    pushNotification.register(
    	    function(success){
    	    	console.log("Successfully registered the device : " + JSON.stringify(success));
    	    	//DB.insertDeviceId(success);
    	    },
    	    function(error){
    	    	console.log("Error occured while registering the device : " + JSON.stringify(error));
    	    },
    	    {
    	        "senderID": appConfig.googleSenderId,
    	        "ecb":"onNotificationGCM"
    	    });
            
    appConfig.timezone = jstz.determine().name();
  });
})

.config(function($stateProvider, $urlRouterProvider, $compileProvider) {

	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|content):/);
	$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|content|file|cdvfile):/);
	
  $stateProvider
  	
 
      .state('login', {
        url: '/login',
        templateUrl: 'js/Templates/login.html',
        controller:'loginCtrl'
      })

      .state('register', {
        url: '/register',
        templateUrl: 'js/Templates/register.html',
        controller:'registerCtrl'
      })

      .state('profile', {
        url: '/profile',
        templateUrl: 'js/Templates/profilePicUpload.html',
        controller:'profilePicCtrl'
      })

      .state('tabs', {
      url: "/tab",
      abstract: true,
      templateUrl: "js/Templates/tabs.html"
      })

      .state('home', {
        url: "/home",
		templateUrl: 'js/Templates/home.html',
        controller:'homeCtrl'
      })

      .state('calendar', {
        url: "/calendar",
		templateUrl: "js/Templates/calendar.html",
        controller: 'calendarCtrl'
      })

      .state('tabs.navstack', {
        url: "/navstack",
        views: {
          'about-tab': {
            templateUrl: "js/Templates/nav-stack.html"
          }
        }
      })

      .state('tabs.groups', {
        url: "/groups",
        views: {
          'groups-tab': {
            templateUrl: "js/Templates/groups.html",
            controller: 'groupCtrl'
          }
        }
      })

      .state('tabs.contact', {
        url: "/contact",
        views: {
          'contact-tab': {
            templateUrl: "js/Templates/contact.html"
          }
        }
      })
      
      .state('invite', {
        url: "/invite",
		templateUrl: "js/Templates/invite.html",
        controller: 'invitePeopleCtrl'
      })
      .state('newEvent', {
        url: "/event/new",
		templateUrl: "js/Templates/event.html",
        controller: 'createEventCtrl'
      })
      .state('viewEvent', {
          url: "/event/:id",
  		templateUrl: "js/Templates/viewEvent.html",
          controller: 'viewEventCtrl'
        })
      .state('upgrade', {
        url: "/upgrade",
		templateUrl: "js/Templates/upgrade.html",
        controller: 'upgradeCtrl'
       })
      .state('group', {
          url: "/group/new",
  		templateUrl: "js/Templates/create-group.html",
          controller: 'createGroupCtrl'
        })
        .state('editEvent', {
            url: "/event/edit/:id",
    		templateUrl: "js/Templates/event.html",
            controller: 'editEventCtrl'
          })
          .state('splashScreen', {
              url: "/splashScreen",
      		templateUrl: "js/Templates/splashScreen.html",
              controller: 'splashScreenCtrl'
            })
            .state('editProfile', {
                url: "/editProfile",
        		templateUrl: "js/Templates/editProfile.html",
                controller: 'editProfileCtrl'
              })
              .state('logout', {
                  url: "/logout",
                  template: "<h1></h1>",
                  controller: 'logoutCtrl'
                });


  $urlRouterProvider.otherwise('/splashScreen');

});
//handle GCM notifications for Android

var GlobalProperties = {
		
		IsAdsShown : false
};


