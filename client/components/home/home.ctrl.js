clientApp.controller('HomePageCtrl', function ($scope, $resource, $log, $http, $route, $location, $interval) {

    console.log("Entered Home Page Ctrl");
    $scope.res = {};
    $scope.submitData = function(){
        $log.debug("Submit request to server: "+JSON.stringify($scope.req));
        $scope.res = {};
        $scope.stackStatus = undefined;
        $http.post('/aws/stack', $scope.req)
            .then(function(response) {
                $log.debug("Create Stack Response: "+JSON.stringify(response));
                $scope.res.status = response.status;
                $scope.res.data = response.data;
                refreshStackStatus();

            }, function(response) {
                $scope.res.data = response.data || 'Request failed';
                $scope.res.status = response.status;
            });
    };

    var getStackStatus = function(){
        $http.get('/aws/stack/'+$scope.req.stackName)
            .then(function(response) {
                $log.debug("Stack Status: "+JSON.stringify(response));
                $scope.stackStatus = response.data;
            }, function(response) {
                $scope.res.data = response.data || 'Request failed';
                $scope.res.status = response.status;
            });
    };
    $scope.getStackStatus = getStackStatus;

    var REFRESH_INTERVAL_MS = 5000;
    var refreshStackStatus = function(){

        var refreshInterval = $interval(function () {
            $scope.getStackStatus();

        }, REFRESH_INTERVAL_MS);
    };

    $scope.$on('$destroy', function() {
        // Make sure that the interval is destroyed too
        if (angular.isDefined(refreshStackStatus)) {
            $interval.cancel(refreshStackStatus);
            refreshStackStatus = undefined;
        }
    });
});