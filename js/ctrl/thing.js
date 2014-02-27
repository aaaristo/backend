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

   db.get($routeParams.id, function(err, thing)
   { 
        if (err)
        {
          if (err.status==404)
            $scope.thing= { _id: $routeParams.id };
          else
            growl.addErrorMessage('woops, cannot read this thing: '+err.message);
        }
        else
        {
          $scope.thing= thing;
          $scope.fieldNames= _.keys(_.omit($scope.thing,['_id','_rev','name'])).join(' ');
          $scope.createFields();
        }

        $scope.$apply(); // altrimenti niente growl: @TODO: fix angular-pouchdb
   });   

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

   $scope.save= function (selse)
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

          if (selse)
            $location.path('thing/'+UUIDjs.create(4));
          else
            $location.path('things');
          
        }

        $scope.$apply(); // altrimenti niente growl: @TODO: fix angular-pouchdb
      });

   };
}];
