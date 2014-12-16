.controller('myCalendarCtrl', function($scope,$filter) {
  $scope.filter=function(object){
    //var doWeHaveFilterData=false;
    var filter= $scope.events.filter(function(arr){
      if((object.title!=="" && typeof(object.title)!="undefined") && (typeof(object.date)!="undefined" && object.date!=""))
      {
        console.log('Inside Both');
         if(arr.title.toLowerCase().indexOf(object.title.toLowerCase())!=-1 && moment(arr.start).format('L')==object.date)
          {
           return true;
          }
      }else if(object.date!=="" && typeof(object.date)!="undefined"){
        console.log('inside date only');
        if(moment(arr.start).format('L')==object.date){
          return true;
        }
      }else if(object.title!=="" && typeof(object.title)!="undefined"){
        console.log('inside title only');
        if(arr.title.toLowerCase().indexOf(object.title.toLowerCase())!=-1)
        {
         return true;
        }
      }
      else{
        return true;
      }
    });
    var calendar=angular.element('#calendar')
    calendar.fullCalendar('removeEvents');
    calendar.fullCalendar('addEventSource', filter);
  };

  $scope.active = 'day';
  $scope.setActive = function(type) {
        $scope.active = type;
        var calendar= angular.element('#calendar');
        calendar.fullCalendar('changeView', type);
  };
  $scope.isActive = function(type) {
        return type === $scope.active;
  };
  var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
	$scope.events=[
        {
          title: 'All Day Event',
          start: new Date(y, m, 1)
        },
        {
          title: 'Long Event',
          start: new Date(y, m, d-5),
          end: new Date(y, m, d-2)
        },
        {
          id: 999,
          title: 'Repeating Event',
          start: new Date(y, m, d-3, 16, 0),
          allDay: false
        },
        {
          id: 999,
          title: 'Repeating Event',
          start: new Date(y, m, d+4, 16, 0),
          allDay: false
        },
        {
          title: 'Meeting',
          start: new Date(y, m, d, 10, 30),
          allDay: false
        },
        {
          title: 'Lunch',
          start: new Date(y, m, d, 12, 0),
          end: new Date(y, m, d, 14, 0),
          allDay: false
        },
        {
          title: 'Birthday Party',
          start: new Date(y, m, d+1, 19, 0),
          end: new Date(y, m, d+1, 22, 30),
          allDay: false
        },
        {
          title: 'Click for Google',
          start: new Date(y, m, 28),
          end: new Date(y, m, 29),
          url: 'http://google.com/'
        }
      ];
	
	
 
});