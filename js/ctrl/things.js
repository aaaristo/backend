var _things= ['$scope','$routeParams','$location','db','growl',
function ($scope,$routeParams,$location,db,growl)
{
    var load= function (opts)
        {
            opts= opts || {};

            var pageLimit= 3,
                options= {include_docs: true, descending: false };

            if (opts.startkey)
              options.startkey= opts.startkey;

            if (!opts.all)
              options.limit= pageLimit+1;

            db.allDocs(options,
            function(err, doc)
            {
              if ($scope.hasMore= opts.all ? false : doc.rows.length>pageLimit)
                $scope.hasMore= _.last(doc.rows).key;

              var things= _.pluck(doc.rows,'doc');

              if (!opts.all)
                things= things.slice(0,pageLimit);

              if (opts.startkey)
                $scope.things.push.apply($scope.things,things);
              else
                $scope.things= things;

              $scope.$apply();
            });
        };

    load(); 

    $scope.loadMore= function ()
    {
       load({ startkey: $scope.hasMore });
    };

    $scope.loadAll= function ()
    {
       load({ startkey: $scope.hasMore, all: true });
    };

    $scope.createSomething= function ()
    {
         $location.path('thing/'+UUIDjs.create(4));
    };

    $scope.remove= function (thing)
    {
       thing.changing= true;

       db.remove(thing, function(err, response)
       { 
          thing.changing= false;

          if (err)
            growl.addErrorMessage('woops, cannot remove this thing: '+err.message);
          else
          {
              $scope.things= _.without($scope.things,thing);
              growl.addSuccessMessage(thing.name+' removed!');
          }

          $scope.$apply();
       });
    };

}];
