var app = angular.module('newApp', ['ui.router']);

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
    
    return o;
}]);

app.controller('PollsCtrl',['$scope','polls','poll',function($scope, polls, poll){
    $scope.poll = poll;
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

app.controller("MainCtrl", ['$scope','$http', 'polls', 'auth',function($scope,$http, polls,auth){
    $scope.polls = polls.polls;
    $scope.createPoll = function() {
        var poll = {
            title: $scope.title,
            choices:$scope.choices.split('\n')
        };
        polls.create(poll);
        $scope.title = '';
        $scope.choices = '';
        polls.getAll();
    };
}]);
