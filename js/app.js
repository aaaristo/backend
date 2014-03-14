angular.module('backend', ['ngRoute','pouchdb','angular-growl','ui.bootstrap','ui.bootstrap.typeahead','ui'])
       .config(['$routeProvider','growlProvider','$compileProvider',
       function ($routeProvider,growlProvider,$compileProvider)
       {
          $routeProvider
              .when('/home', {controller: _home, templateUrl:'/views/home.html' })
              .when('/thing/:id', { controller: _thing, templateUrl:'/views/thing.html' })
              .when('/things', { controller: _things, templateUrl:'/views/things.html' })
              .otherwise({redirectTo:'/home'});

          growlProvider.globalTimeToLive(5000);
          growlProvider.onlyUniqueMessages(false);
          $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|data):/);
       }])
       .filter('nvl', function()
       {
            return function(value, replacer) {
              return value ? value : (replacer ? replacer : '...');
            };
       })
       .factory('db', ['pouchdb',function(pouchdb) {
          return pouchdb.create('thingsdb');
       }])
       .run(['$rootScope','$location','db',function($rootScope,$location,db) {
          db.allDocs({ include_docs: true, descending: false },
          function(err, doc)
          {
              var $apply= _.debounce(function () { $rootScope.$apply(); },100);
              $rootScope.things= _.pluck(doc.rows,'doc');
              $apply();

              db.changes
              ({ include_docs: true, 
                 continuous: true,
                 onChange: function (change)
                 {
                     if (change.deleted)
                       $rootScope.things= _.without($rootScope.things,_.findWhere($rootScope.things,{ _id: change.id }));
                     else
                     {
                        var val= _.findWhere($rootScope.things,{ _id: change.id });
 
                        if (val)
                        {
                           var idx= _.indexOf($rootScope.things, val);
                           $rootScope.things[idx]= change.doc;
                        }
                        else
                          $rootScope.things.push(change.doc);
                     }

                     console.log('db change',change);
                     $apply();
                 }
              });
          });

          $rootScope.$watch('search',function (search)
          {
              if (search&&search._id) 
              {
                $location.path('thing/'+search._id);
                $rootScope.search= '';
              }
          });

       }]);
