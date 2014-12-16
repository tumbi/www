angular.module('AppToDate.Controllers')
.controller('homeCtrl', function($scope, $location) {
 $scope.setNavTitle("Home");
 
 $scope.NavigateToCalendar = function()
 {
	$location.path('/calendar');
 };
 
 $scope.ChangeProfilePic = function(){
	 $location.path('/profile');
 };
 
 $scope.invitePeopleClicked = function(){
	 $location.path('/invite');
 };
	
	$scope.shareOnFacebook = function(){
		
		window.plugins.socialsharing.shareVia('com.facebook.orca', appConfig.inviteMessage /* message */, null/*subject*/, null /* img */, null /* url */, 
			function() {
				$scope.showResponseMessage('Successfully posted on facebook!', true);
				if (!$scope.$$phase) $scope.$apply();
			}, function(errormsg){
				console.log(JSON.stringify(errormsg));
				$scope.showResponseMessage('Please install Facebook Messenger App to use this feature.', false);
				if (!$scope.$$phase) $scope.$apply();
		});
		
//		facebookConnectPlugin.showDialog({
//			method: "feed",
//		    link: "http://google.com",
//		    caption: "AppToDate Invitation"
//		}, function(){
//			$scope.showResponseMessage('Successfully posted on facebook!', true);
//		}, function(){
//			$scope.showResponseMessage('Error occured while posting to facebook', false);
//		});
	};
});