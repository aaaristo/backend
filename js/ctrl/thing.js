var _thing= ['$scope','$routeParams','$location','db','growl',
function ($scope,$routeParams,$location,db,growl)
{
   $('#name').focus(); 

   $('#fields').keypress(function(e)
   {
      if (e.which == 13)
        $scope.$apply($scope.createFields);
   });

   $scope.fields= [];
   $scope.thing= { _id: $routeParams.id };

   $scope.createFields= function ()
   {
      var fields= $scope.fieldNames.split(/\s+/);

      $scope.fields= _.filter($scope.fields,function (f) { return _.contains(fields,f.name); });

      _(fields).each(function (name)
      {
          if (!_.contains(_.pluck($scope.fields,'name'),name))
            $scope.fields.push({ name: name,
                                 type: 'text',
                                label: name.substring(0,1).toUpperCase()
                                      +name.substring(1).toLowerCase() });
      });
   };

   $scope.save= function ()
   {
      $scope.saving= true;

      db.put($scope.thing,
      function (err, response)
      {
        $scope.saving= false;

        if (err)
          growl.addErrorMessage('woops, cannot save this thing: '+err.message);
        else
        {
          growl.addSuccessMessage($scope.thing.name+' saved!');
          $location.path('things');
        }

        $scope.$apply(); // altrimenti niente growl: @TODO: fix angular-pouchdb
      });

   };
}];
