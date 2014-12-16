angular.module('AppToDate.Filters',[])
.filter('searchContact',function(){
	return function(contacts,selectedContactsID){
			var filterarr=[];
			for (var i = 0; i < selectedContactsID.length; i++) {
				contacts.forEach(function(item){
					var index=item.id.indexOf(selectedContactsID[i]);
					if(index!=-1){
						filterarr.push(item);
					}
				});
        	}
        	return filterarr;
	}
})