angular.module('backend', ['ngRoute','pouchdb','angular-growl','ui.bootstrap','ui.bootstrap.typeahead'])
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
       }]);
