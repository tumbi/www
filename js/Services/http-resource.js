angular.module('AppToDate.Services')
.factory('httpResource', function($q, $http){
	return {
		loadUrl : function(url, method, data){
			if (navigator && navigator.connection && navigator.connection.type === Connection.NONE) {
	            return {
	            	then: function(sf, ef){
	            		ef({Message: "Network connection error."});
	            	},
	            	success: function(){
	            		return{
	            			error : function(callback){
	            				callback({Message: "Network connection error."});
	            			}
	            		}
	            	}
	            }
	        }
			if(method == "DELETE"){
				console.log("Deleting with url : " + appConfig.apiUrl + url)
				return $http.delete(appConfig.apiUrl + url);
			} else if(method == "GET"){
				console.log("API URL: " + appConfig.apiUrl + url);
				return $http.get(appConfig.apiUrl + url, data);
			} else {
				console.log("API URL CALLED: " + appConfig.apiUrl + url);
				return $http.post(appConfig.apiUrl + url, data);
			}
		}
	}
});