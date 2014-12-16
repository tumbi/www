/**
 * 
 */
  
   // This is called with the results from from FB.getLoginStatus().
  function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
		console.log('FB connected');
		//$location.path('/profile');
		$location.path('/home');
      // Logged into your app and Facebook.
      //testAPI();
    } else if (response.status === 'not_authorized') {
      // The person is logged into Facebook, but not your app.
      console.log('FB not_authorized');
    } else {
      // The person is not logged into Facebook, so we're not sure if
      // they are logged into this app or not.
      //document.getElementById('status').innerHTML = 'Please log ' +
        //'into Facebook.';
    }
  }

$scope.facebookConnect=function(provider){

   // LoaderService.show();
   FB.login(function(response){
	  statusChangeCallback(response);
	});
  };

  $scope.googleConnect=function(provider){

        LoaderService.show();
        sessionService.isSessionExists(provider)
         .then(function(data) {
            if(typeof(data)=="object"){
              var loginDetails={};
              loginDetails.auth_provider="Google";
              loginDetails.user_id=data.id;
              loginDetails.email=data.email;
              //loginDetails.access_token=data.access_token;
              //loginDetails.refresh_token=data.refresh_token;
              //loginDetails.login_time=new Date().getTime();
              //loginDetails.expired_in=loginDetails.login_time+data.expires_in*1000;
              var options={};
              options.client_id='22077347982.apps.googleusercontent.com';
              options.client_secret='blvucX6blM0g41rc9Y9umzo-';
              $.when(Authentication.ga.getRefreshToken(data.refresh_token,options))
                .then(function(data){
                  loginDetails.access_token=data.access_token;
                  loginDetails.refresh_token=data.refresh_token;
                  loginDetails.login_time=new Date().getTime();
                  loginDetails.expired_in=loginDetails.login_time+data.expires_in*1000;
                  DB.insertLoginDetail(loginDetails);
                    //console.log("after data insert");
                  LoaderService.hide();
                  $state.go('tabs.home');
                  console.log("Google record updated");

              });

            }
            else if(data){

              console.log("session already exists. Don't need to login ");
              LoaderService.hide();
              $state.go('tabs.home');

            }else{

                    $.when(Authentication.ga.authorize({
                            client_id: '22077347982.apps.googleusercontent.com',
                            client_secret: 'blvucX6blM0g41rc9Y9umzo-',
                            redirect_uri: 'http://localhost'
                    }))

                    .then(function (data) {

                      var loginDetails={};
                      loginDetails.auth_provider="Google";
                      loginDetails.access_token=data.access_token;
                      loginDetails.refresh_token=data.refresh_token;
                      loginDetails.login_time=new Date().getTime();
                      loginDetails.expired_in=loginDetails.login_time+data.expires_in*1000;
                      console.log("google expires in : "+loginDetails.expired_in);

                        console.log('Executing then callback with access token: ' + JSON.stringify(data)); 
                        Authentication.ga.getUserProfile(data.access_token).done(function(data){
                          loginDetails.user_id=data.id;
                          loginDetails.email=data.emails[0].value;
                           DB.insertLoginDetail(loginDetails);
                                      //console.log("after data insert");
                          LoaderService.hide();
                          $state.go('tabs.home');

                        }).fail(function (data) {
                                      console.log("error"+data);
                                      console.log(JSON.stringify(data));

                                  alert(data);

                                  LoaderService.hide();
                        });           

                        /*Authentication.ga.getContacts(data.access_token).done(function (data) {

                                        console.log('google response' + data);

                                        LoaderService.hide();
                                       
                                    }).fail(function (data) {
                                      console.log("error"+data);
                                      console.log(JSON.stringify(data));

                                  alert(data);

                                  LoaderService.hide();
                        });*/
                    });
          }
      },function(data){
            alert("Error occurred while login Error : "+data);            
             LoaderService.hide();
        });
    };

      $scope.liveConnect=function(provider){

        LoaderService.show();
        sessionService.isSessionExists(provider)
         .then(function(data) {
            if(data){

              console.log("session already exists. Don't need to login ");
              LoaderService.hide();
              //$state.go('tabs.home');
              $location.path('/home');

            }else{
                  $.when(Authentication.wl.authorize({
                          client_id: '000000004811769C'
                  }))

                  .then(function (data) {
                    //create login object to insert data in login table

                      var loginDetails={};
                      var access_token = /\#access_token=(.+)$/.exec(data);
                      var login = access_token[0].split('&');
                      login.forEach(function(item){
                        var d=item.split('=');
                        loginDetails.auth_provider="Windows live";
                        if(d[0].indexOf("access_token")!=-1)
                        {
                          loginDetails.access_token=d[1];
                          
                        }
                        if(d[0].indexOf("expires_in")!=-1)
                        {
                          loginDetails.login_time=new Date().getTime();
                          loginDetails.expired_in=loginDetails.login_time+d[1]*1000;
                          loginDetails.refresh_token=null;
                        }
                      });

                      //End

                      
                      console.log('Executing then callback with access token: ' + data); 
                      Authentication.wl.getUserDetail(access_token[1]).done(function (data) {
                                      console.log('windows live contacts response' + JSON.stringify(data));
                                      loginDetails.user_id=data.id;
                                      loginDetails.email=data.emails.account;
                                      console.log("login Details : "+JSON.stringify(loginDetails));
                                      console.log("before data insert");
                                      console.log(DB);
                                      DB.insertLoginDetail(loginDetails);
                                      console.log("after data insert");
                                      LoaderService.hide();
                                      //$state.go('tabs.home');
                                      $location.path('/home');
                                  }).fail(function (data) {
                                    console.log("error"+data);
                                    console.log(JSON.stringify(data));

                                alert(data);

                                LoaderService.hide();
                      });           

                      
                  },
                  function(){alert("In Error");LoaderService.hide();});
              }
                
          },function(data){
            alert("Error occurred while login Error : "+data);
            m={}
            m.provider="Windows live";
            m.login_Time=new Date().getTime();
            DB.isAppSessionExists(m)
             LoaderService.hide();
          });
      };