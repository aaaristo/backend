var _home= ['$scope','$location',
function ($scope,$location)
{
   $scope.createSomething= function ()
   {
         $location.path('thing/'+UUIDjs.create(4));
   }
}];
