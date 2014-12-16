angular.module('AppToDate.Controllers')
.controller('groupCtrl',['$scope','$filter',function($scope,$filter){

    $scope.selectedContacts=[];

    $scope.contacts=[{
        "id":"1",
        "displayName":"SH1",
        "phoneNumbers": [
             {
             "type": "mobile",
             "value": "121",
             "id": "2",
               "pref": false
             }
        ]
    },
    {
        "id":"2",
        "displayName":"SH2",
        "phoneNumbers": [
             {
             "type": "mobile",
             "value": "121222",
             "id": "2",
               "pref": false
             }
        ]
    },
    {
        "id":"3",
        "displayName":"SH3",
        "phoneNumbers": [
             {
             "type": "mobile",
             "value": "121222222",
             "id": "2",
               "pref": false
             }
        ]
    }
    ];

    $scope.toggle=function(contactID){
       
        var idx = $scope.selectedContacts.indexOf(contactID);

        // is currently selected
        if (idx > -1) {
          $scope.selectedContacts.splice(idx, 1);
        }

        // is newly selected
        else {
          $scope.selectedContacts.push(contactID);
        }
    }

    $scope.createGroup=function(){
      //debugger;
      var selectedContacts= $filter('searchContact')($scope.contacts,$scope.selectedContacts);

    }

    /*$scope.contacts=[];
	function getPhoneContacts(){
		 var fields = ["id", "name", "phoneNumbers", "emails"];
		 var options = new ContactFindOptions();
         options.filter="";
         options.multiple=true;
         navigator.contacts.find(fields, onSuccess, onError,options);
	}

	function onSuccess(contacts) {
        var usercontacts=[];
		console.log("contacts : "+$filter('json')(contacts));
        
        contacts.forEach(function(contact){
            if(contact.displayName!=null && contact.phoneNumbers!=null){
                usercontacts.push(contact);
            }
        });

        $scope.$apply(function(){
            $scope.contacts=usercontacts;
        });

        for (var i=0; i<contacts.length; i++) {
        	console.log("ID = " + contacts[i].id);
            console.log("Display Name = " + contacts[i].displayName);
            console.log("PhoneNumber = " + $filter('json')(contacts[i].phoneNumbers));
        }
    }

    function onError(contactError) {
        alert('onError!'+ contactError);
    }
    getPhoneContacts();*/

}]);