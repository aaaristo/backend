angular.module('backend', ['ngRoute','pouchdb','angular-growl'])
       .config(['$routeProvider','growlProvider',
       function ($routeProvider,growlProvider)
       {
          $routeProvider
              .when('/home', {controller: _home, templateUrl:'/views/home.html' })
              .when('/thing/:id', { controller: _thing, templateUrl:'/views/thing.html' })
              .when('/things', { controller: _things, templateUrl:'/views/things.html' })
              .otherwise({redirectTo:'/home'});

          growlProvider.globalTimeToLive(5000);
          growlProvider.onlyUniqueMessages(false);
       }])
       .filter('nvl', function()
       {
            return function(value, replacer) {
              return value ? value : (replacer ? replacer : '...');
            };
       })
       .factory('db', ['pouchdb',function(pouchdb) {
          return pouchdb.create('thingsdb');
       }]);
