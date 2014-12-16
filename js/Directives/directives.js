angular.module('AppToDate.Directives',[])
.directive('calendar',function(){
  return{
    restrict:'A',
    scope:{
        Calevents:"=ngModel"
    },
    link:function(scope,element,attr){
        element.fullCalendar({
        header: {
          left:'',
          right: 'prev,next',
          center: 'title'
        },
        editable: true,
        events: scope.Calevents
      });
    }
  }
})

.directive('calendarPicker',function(){
  return{
    restrict:'A',
    link:function(scope,element,attr){
        element.datepicker();
    }
  }
})
.directive('matchField', [function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            var matchField = '#' + attrs.matchField;
            elem.add(matchField).on('keyup', function () {
                scope.$apply(function () {
                    ctrl.$setValidity('matchField', elem.val() === $(matchField).val());
                });
            });
        }
    }
}]);