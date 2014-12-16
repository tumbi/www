angular.module('AppToDate.Services')
.factory('Authentication',function($http,$q,$filter, $location, $window, oauthLoginService){

  
  var facebookConnect={};
  var GoogleConnect={};
  var YahooConnect={};
  var WindowsLiveConnect={};

  facebookConnect.authorize=function (options) {
        //var deferred = $q.defer();
        var deferred = $.Deferred();    

        //Build the OAuth consent page URL
        var authUrl = 'https://www.facebook.com/dialog/oauth?' + $.param({
            client_id: options.client_id,
            redirect_uri: options.redirect_uri,
            scope:'email,read_friendlists',
            response_type:'code'
        });

        console.log('about to open InAppBrowser with URL: ' + authUrl);

        //Open the OAuth consent page in the InAppBrowser
        //var authWindow = window.open(authUrl, '_blank', 'location=no,toolbar=no');

        //$(authWindow).on('loadstart', function (e) {
		$location.url(authUrl);

		var myWindow = angular.element($window);
        myWindow.on('loadstart', function (e) {
            var url = e.originalEvent.url;

            console.log('InAppBrowser: loadstart event has fired with url: ' + url);

            var code = /\?code=(.+)$/.exec(url);
            var error = /\?error=(.+)$/.exec(url);

            if (code || error) {
                //Always close the browser when match is found
                authWindow.close();
            }

            if (code) {
                //Exchange the authorization code for an access token
                $.post('https://graph.facebook.com/oauth/access_token', {
                    code: code[1],
                    client_id: options.client_id,
                    client_secret: options.client_secret,
                    redirect_uri: options.redirect_uri
                }).done(function (data) {
                    console.log("Access Token: " +data);
                    deferred.resolve(data);
                }).fail(function (response) {
                    deferred.reject(response.responseJSON);
                });
            } else if (error) {
                //The user denied access to the app
                deferred.reject({
                    error: error[1]
                });
            }
        });

        return deferred.promise();
    };
    facebookConnect.profile= function (access_token) {
        var deferred = $.Deferred();

        //Build the OAuth consent page URL
        var profile_uri = 'https://graph.facebook.com/me?fields=name,email&' + access_token;

        console.log('about to fetch facebook profile: ' + profile_uri);

        $.getJSON(profile_uri)
        .done(function (data) {
            deferred.resolve(data);
        }).fail(function (response) {
            deferred.reject(response.responseJSON);
        });

        return deferred.promise();
    };
    facebookConnect.friendlist= function (access_token) {
        var deferred = $.Deferred();

        //Build the OAuth consent page URL
        var profile_uri = 'https://graph.facebook.com/me/friends?' + access_token;

        console.log('about to fetch facebook friendlist: ' + profile_uri);

        $.getJSON(profile_uri)
        .done(function (data) {
            deferred.resolve(data);
        }).fail(function (response) {
            deferred.reject(response.responseJSON);
        });

        return deferred.promise();
    };

    GoogleConnect.authorize=function(options){
         var deferred = $.Deferred();

        //Build the OAuth consent page URL
        var authUrl = 'https://accounts.google.com/o/oauth2/auth?' + $.param({
            client_id: options.client_id,
            redirect_uri: options.redirect_uri,
            response_type: 'code',
            scope: "https://www.google.com/m8/feeds profile email"
        });

         var authWindow = window.open(authUrl, '_blank', 'location=no,toolbar=no');

         $(authWindow).on('loadstart', function(e) {
            console.log("Load start event");
            var url = e.originalEvent.url;
            var code = /\?code=(.+)$/.exec(url);
            var error = /\?error=(.+)$/.exec(url);

            if (code || error) {
                //Always close the browser when match is found
                authWindow.close();
            }

            if (code) {
                console.log('code : '+code[1]);
                //Exchange the authorization code for an access token
                $.post('https://accounts.google.com/o/oauth2/token', {
                    code: code[1],
                    client_id: options.client_id,
                    client_secret: options.client_secret,
                    redirect_uri: options.redirect_uri,
                    grant_type: 'authorization_code'
                }).done(function(data) {
                    deferred.resolve(data);
                }).fail(function(response) {
                    console.log("error22: "+response.responseJSON);
                    deferred.reject(response.responseJSON);
                });
            } else if (error) {
                console.log('error:'+ error);
                //The user denied access to the app
                deferred.reject({
                    error: error[1]
                });
            }
        });

        return deferred.promise();
    };

    GoogleConnect.getRefreshToken=function(refreshtoken,options)
    {
        console.log("refresh_token : "+refreshtoken);
        console.log("client_id : "+options.client_id);
        console.log("client_secret : "+options.client_secret);
       
        var deferred = $.Deferred();
        $.post('https://accounts.google.com/o/oauth2/token', {
                    refresh_token: refreshtoken,
                    client_id: options.client_id,
                    client_secret: options.client_secret,
                    grant_type: 'refresh_token'
                }).done(function(data) {
                    console.log("In success");
                    deferred.resolve(data);
                }).fail(function(response) {
                     console.log(JSON.stringify(response,null,4));
                    console.log("In error");
                    deferred.reject(response.responseJSON);
        });
        return deferred.promise();

    };

    GoogleConnect.getUserProfile=function(access_token)
    {
        var deferred = $.Deferred();
        $.get('https://www.googleapis.com/plus/v1/people/me?access_token='+access_token)
        .done(function(data) {
                    console.log("In success");
                    deferred.resolve(data);
                }).fail(function(response) {
                     //console.log(JSON.stringify(response,null,4));
                    console.log("In error");
                    deferred.reject(response);
        });
        return deferred.promise();

    };

    GoogleConnect.getContacts=function(access_token)
    {  
        var deferred = $.Deferred();
        $.get('https://www.google.com/m8/feeds/contacts/default/full?max-results=9999&access_token='+access_token)
        .done(function(data) {
                    console.log("In success");
                    deferred.resolve(data);
                }).fail(function(response) {
                     //console.log(JSON.stringify(response,null,4));
                    console.log("In error");
                    deferred.reject(response);
        });
        return deferred.promise();

    };

    WindowsLiveConnect.authorize=function (options) {
        var deferred = $.Deferred();
        var authUrl = 'https://login.live.com/oauth20_authorize.srf?' + $.param({
            client_id: options.client_id,
            //redirect_uri: options.redirect_uri,
            scope:'wl.signin wl.basic wl.emails',
            response_type:'token'
        });

        var authWindow = window.open(authUrl, '_blank', 'location=no,toolbar=no');

        $(authWindow).on('loadstart', function (e) {

            
            var url = e.originalEvent.url;
            console.log("Load start event with url : "+url);
            if (url.indexOf("access_token")!=-1) {
                //Always close the browser when match is found
                //console.log("windows live data returned : "+url);
                var access_token = /\#access_token=(.+)$/.exec(url);
                //console.log(access_token);
                authWindow.close();
                //deferred.resolve(access_token[1]);
                deferred.resolve(url);
            }
        });
         return deferred.promise();
        
    }

    WindowsLiveConnect.getContacts=function(access_token)
    {  
        var deferred = $.Deferred();
        /*$.getJSON('https://www.google.com/m8/feeds/contacts/default/full?max-results=9999&access_token='+access_token)
        .done(function (data) {
            deferred.resolve(data);
        }).fail(function (response) {
            deferred.reject(response.responseJSON);
        });*/



        $.get('https://apis.live.net/v5.0/me/contacts?access_token='+access_token)
        .done(function(data) {
                    console.log("In success");
                    deferred.resolve(data);
                }).fail(function(response) {
                     //console.log(JSON.stringify(response,null,4));
                    console.log("In error");
                    deferred.reject(response);
        });
        return deferred.promise();
    };

    WindowsLiveConnect.getUserDetail=function(access_token)
    {  
        var deferred = $.Deferred();
        /*$.getJSON('https://www.google.com/m8/feeds/contacts/default/full?max-results=9999&access_token='+access_token)
        .done(function (data) {
            deferred.resolve(data);
        }).fail(function (response) {
            deferred.reject(response.responseJSON);
        });*/



        $.get('https://apis.live.net/v5.0/me?access_token='+access_token)
        .done(function(data) {
                    console.log("In Success User Profile : "+ data);
                    deferred.resolve(data);
                }).fail(function(response) {
                     //console.log(JSON.stringify(response,null,4));
                    console.log("In error");
                    deferred.reject(response);
        });
        return deferred.promise();
    };

   var oauth={
    "fb":facebookConnect,
    "ga":GoogleConnect,
    "wl":WindowsLiveConnect,
    "oa": oauthLoginService
   };
   return oauth;
})