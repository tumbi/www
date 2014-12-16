angular.module('AppToDate.Controllers')
.controller('createEventCtrl', function($scope, $filter, $location, imageService, eventService, googleMapService) {
	$scope.setNavTitle("Create Event");
	$scope.minDate = new Date();
	$scope.mapLoaded = false;
	$scope.tab = 'details';
	$scope.event = {
		remindBefore: "5"
	};
	$scope.timeSpans = ['5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '60'];
	$scope.showModal = false;
	$scope.contacts = [];
	$scope.groups = [];
	
	$scope.loadGoogleMap = function(){
		if(!$scope.mapLoaded){
			googleMapService.showMapInDiv('map', function(){
				googleMapService.setLocationSearchbox('enterlocation');
				$scope.mapLoaded = true;
			}, null, function(){
				$scope.showResponseMessage("Location services not available. Please search location in the text box.", false);	
				googleMapService.setLocationSearchbox('enterlocation');
				$scope.mapLoaded = true;
				$scope.$apply();
			});
		}
	}
});