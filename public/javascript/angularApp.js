var app = angular.module('newApp', ['ui.router', 'googlechart']);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '/home.html',
                controller: 'MainCtrl',
                resolve: {
                    pollPromise: ['polls', function(polls){
                        return polls.getAll();
                    }],
                }
            })
            .state('profile', {
                url: '/profile',
                templateUrl: '/profile.html',
                controller: 'ProfileCtrl'
            })
            .state('poll', {
                url: '/poll/{id}',
                templateUrl: '/polls.html',
                controller: 'PollsCtrl', 
                resolve: {
                    poll: ['$stateParams', 'polls', function($stateParams, polls) {
                        return polls.getOne($stateParams.id);
                    }]
                }
            })
            .state('newPoll',{
                url: '/newPoll',
                templateUrl: '/newPoll.html',
                controller: 'MainCtrl'
            });
        $urlRouterProvider.otherwise('home');
}]);


app.service('auth', ['$http', '$q', function($http,$q){
    var httpPromise = $http({
        url: "/loggedIn",
        method: "GET",
        params:{}
    });
    return {
        varPromise: httpPromise.then(function(response){
            return response.data;
        })
    };
}]);

app.service('user', ['$http', function($http){
    var httpPromise = $http({
        url: '/api/:id',
        method: "GET",
        params:{}
    });
    return {
        userInfo: httpPromise.then(function(response){
            return response.data;
        })
    };
}]);

app.factory('polls',['$http', function($http){
    var o = {
        polls: []
    };
    
    o.getAll = function() {
        return $http.get('/poll').success(function(data){
            angular.copy(data, o.polls);
        });
    };
    
    o.create = function(poll) {
        return $http.post('/poll', poll).success(function(data){
            return data;
        });
    };
    
    o.getOne = function(id) {
        return $http.get('/poll/' + id).then(function(res){
            return res.data;
        });
    };
    
    o.addResponse = function(id, response) {
        return $http.post('/poll/' + id + '/response', response).success(function(data){
            return data;
        });
    };
    
    return o;
}]);

app.controller('PollsCtrl',['$scope','polls','poll',function($scope, polls, poll){
    $scope.poll = poll;
    
    $scope.data = [];
    
    $scope.updateData = function() {
        for (var i = 0; i < poll.choices.length; i++) {
            var newChoice = [poll.choices[i], 0];
            $scope.data.push(newChoice);
        }
        
        for (var j = 0; j < poll.responses.length; j++) {
            for (var k = 0; k < $scope.data.length; k++) {
                if($scope.data[k].indexOf(poll.responses[j].choice) > -1){
                    $scope.data[k][1] += 1;
                }
            }
        }
    };
        
    $scope.addResponse = function() {
        if($scope.pollChoice === ''){return;}
        polls.addResponse(poll._id, {
            choice: $scope.pollChoice
        }).success(function(response){
            $scope.poll.responses.push(response);
        });
        for(var n = 0; n < $scope.chartObject.data.rows.length; n++) {
            if($scope.chartObject.data.rows[n]['c'][0]['v'] == $scope.pollChoice) {
                $scope.chartObject.data.rows[n]['c'][1]['v'] += 1;
            }
        }
        $scope.pollChoice = '';
    };
    
    $scope.updateData();
    
    $scope.chartObject = {};
    
    $scope.chartObject.type = "PieChart";
    
    $scope.chartObject.data = {"cols": [
        {label: "Choice", type: "string"},
        {label: "Responses", type: "number"}
        ], "rows": []};
        
    for (var m = 0; m < $scope.data.length; m++) {
        $scope.chartObject.data.rows.push(
            {c: [
                {v: $scope.data[m][0]},
                {v: $scope.data[m][1]},
            ]});
    }
    
    $scope.chartObject.options = {
        pieHole: 0.4
    };
    
}]);

app.controller('NavCtrl',['$scope', '$q','auth',function($scope, $q, auth){
    auth.varPromise.then(function(data){
        $scope.isLoggedIn = data;
    });
}]);

app.controller('ProfileCtrl', ['$scope', 'user',function($scope,user){
    user.userInfo.then(function(data){
        $scope.id = data.id;
        data.id ? $scope.authUser = true:$scope.authUser = false;
        $scope.username = data.username;
        $scope.displayName = data.displayName;
        $scope.publicRepos = data.publicRepos;
    });
}]);

app.controller("MainCtrl", ['$scope','$http', 'polls', 'auth', '$state', 'user',function($scope,$http, polls,auth,$state,user){
    auth.varPromise.then(function(data){
        $scope.isLoggedIn = data;
    });
    user.userInfo.then(function(data){
        $scope.currentUser = data.username;
    });
    $scope.polls = polls.polls;
    $scope.createPoll = function() {
        if($scope.title === '') {return;}
        if($scope.choices === ''){return;}
        var poll = {
            title: $scope.title,
            choices:$scope.choices.split('\n')
        };
        polls.create(poll);
        $scope.title = '';
        $scope.choices = '';
        polls.getAll();
        $state.go('home');
    };
}]);



