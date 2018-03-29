clientApp.controller('HomePageCtrl', function ($scope, $resource, $log, $http, $route, $location, $interval, $filter) {

    console.log("Entered Home Page Ctrl");
    $scope.res = {};
    $scope.stackData = {};
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

    var getStackEvents = function(){
        $http.get('/aws/stack/events/'+$scope.req.stackName)
            .then(function(response) {
                //$log.debug("Stack Events: "+JSON.stringify(response));
                $scope.stack = response.data;
            }, function(response) {
                $scope.res.data = response.data || 'Request failed';
                $scope.res.status = response.status;
            });
    };

    var getStackDetails = function(){
        console.log("getting stack details..");
        $http.get('/aws/stacks/'+$scope.req.stackName)
            .then(function(response) {
                $log.debug("Stack Status: "+JSON.stringify(response));

                if(response.data.Stacks && response.data.Stacks[0].Outputs) {
                    var outputs = response.data.Stacks[0].Outputs;
                    console.log("outputs: "+JSON.stringify(outputs));
                    var arr = $filter('filter')(outputs, {OutputKey: "HookPublisherURL"});
                    console.log("array: "+JSON.stringify(arr));
                    if(arr && arr.length > 0)
                        $scope.stackData.publisherURL = arr[0].OutputValue;
                }

            }, function(response) {
                $scope.res.data = response.data || 'Request failed';
                $scope.res.status = response.status;
            });
    };
    
    $scope.getStackEvents = getStackEvents;
    $scope.getStackDetails = getStackDetails;
    
    var REFRESH_INTERVAL_MS = 5000;
    var refreshStackStatus = function(){
        cancelIntervals();
        $log.debug("refreshStackStatus..");
        $scope.refreshEventInterval = $interval(function () {
            $scope.getStackEvents();
        }, REFRESH_INTERVAL_MS);

        $scope.refreshStackInterval = $interval(function () {
            $scope.getStackDetails();
        }, REFRESH_INTERVAL_MS);
    };
    $scope.refreshStackStatus = refreshStackStatus;

    $scope.$on('$destroy', function() {
        // Make sure that the interval is destroyed too
        cancelIntervals();
    });

    var cancelIntervals = function(){
        if (angular.isDefined($scope.refreshEventInterval)) {
            $interval.cancel($scope.refreshEventInterval);
            $scope.refreshEventInterval = undefined;
        }
        if (angular.isDefined($scope.refreshStackInterval)) {
            $interval.cancel($scope.refreshStackInterval);
            $scope.refreshStackInterval = undefined;
        }
    };
});