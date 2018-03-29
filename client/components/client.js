var clientApp = angular.module('clientApp', ['ngAnimate', 'ui.bootstrap', 'ngSanitize', 'ngResource', 'ngRoute'
]);

clientApp.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'components/home/home.html',
            controller: 'HomePageCtrl'
        })
        .otherwise({
            redirectTo: '/not-found'
        });

}]);

clientApp.controller('MainCtrl', function ($rootScope, $scope) {
    console.log("Main ctrl")
});

