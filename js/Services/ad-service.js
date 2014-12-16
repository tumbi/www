angular.module('AppToDate.Services')
.factory('adService',function(httpResource,$q){
	var showAdsPluginCall = function(){
		
		if(!GlobalProperties.IsAdsShown){
		//Admob show banner
	    admob.createBannerView(
	  	     {
	  	       'publisherId': appConfig.adMobPublisherId,
	  	       'adSize': admob.AD_SIZE.SMART_BANNER,
	  	       'positionAtTop' : true
	  	     },
	  	     function(response){
	  	    	 console.log("Success calling admob.createBannerView : " + JSON.stringify(response));
	  	    	 admob.requestAd(
	  	    		     {
	  	    		       'isTesting': true,
	  	    		     },
	  	    		     function(requestAdResponse){
	  	    		    	 console.log("Success calling admob.requestAd : " + JSON.stringify(requestAdResponse));
	  	    		     },
	  	    		     function(error){
	  	    		    	 console.log("Error occurred while calling admob.requestAd : " + JSON.stringify(error));
	  	    		     }
	  	    		 );
	  	    	GlobalProperties.IsAdsShown = true;
	  	     },
	  	     function(error){
	  	    	 console.log("Error occurred while calling admob.createBannerView : " + JSON.stringify(error));
	  	     }
	  	 );
		}
	}
	
	return {
		showAds: function(userId){
			var deferred = $q.defer();
			DB.isUserUpgraded(userId).then(function(response){
				if(!response){
					showAdsPluginCall();
				}
				deferred.resolve(response);
			}, function(error){
				console.log("Error getting upgraded info: " + JSON.stringify(error));
				deferred.reject(error);
			});
			return deferred.promise;
		},
		
		upgradeUser: function(userId){
			var deferred = $q.defer();
			httpResource.loadUrl("Person/ConvertToPaidUser?clientId="+userId, "POST", null).success(function(eventData){
				DB.insertUserUpgraded(userId).then(function(response){
					admob.killAd(function(){
						console.log("Ads removed successfully");
						deferred.resolve();
					},function(){
						console.log("Error while removing ads using plugin");
						deferred.reject();
					});
				}, function(error){
					console.log("Error inserting upgraded info: " + JSON.stringify(error));
					deferred.reject();
				});
			}).error(function(error){
				console.log("Error occured while calling paid user API: " + JSON.stringify(error));
				deferred.reject(error);
			});
			return deferred.promise;
		}
	}
});