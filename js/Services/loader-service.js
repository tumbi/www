angular.module('AppToDate.Services')
.factory('LoaderService', function($rootScope, $ionicLoading) {

  // Trigger the loading indicator
  return {
        show : function() { //code from the ionic framework doc

            // Show the loading overlay and text
            $rootScope.loading = $ionicLoading.show({

              // The text to display in the loading indicator
              content: 'Loading',

              // The animation to use
              animation: 'fade-in',

              // Will a dark overlay or backdrop cover the entire view
              showBackdrop: true,

              // The maximum width of the loading indicator
              // Text will be wrapped if longer than maxWidth
              maxWidth: 200,

              // The delay in showing the indicator
              showDelay: 500
            });
        },
        hide : function(){
            $rootScope.loading.hide();
        }
    }
})

.factory('sessionService', function($q) {

  // Trigger the loading indicator
  return {
        isSessionExists : function(auth_provider) {

            var deferred = $q.defer();

            var data={};
            data.provider=auth_provider;
            data.login_Time=new Date().getTime();
            console.log(JSON.stringify(data));
            $.when(DB.isAppSessionExists(data)).then(
              function(data) {
                console.log("login data fetched successfully");
                deferred.resolve(data);
              },
              function(errorMsg) {
                console.log("Error while fetching login data");
                deferred.reject(errorMsg);
            });

            return deferred.promise;
        }
  }
    
});