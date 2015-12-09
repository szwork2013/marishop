// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services','ngCookies','ngResource',"ngFileUpload"
              , 'angular-jwt','ionic.contrib.ui.tinderCards', 'readMore','ngCordova','ngTagsInput','btford.socket-io','toaster','ngAnimate'
              ,'yaru22.angular-timeago'])

.run(function($ionicPlatform, $rootScope, $location, ApiEndpoint) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    $rootScope.device = false;
    $rootScope.cdn_url = ApiEndpoint.cdn_url;
    if( window.device ) {
      $rootScope.device = true;
    }
  });

})
.config(function($compileProvider,$httpProvider){
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|data):|data:image\//);
  $httpProvider.interceptors.push('authInterceptor');
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl',
    authenticate: true
  })

  .state('app.tinder-one', {
    url: "/tinder-one",
    views: {
      'menuContent': {
        templateUrl: "templates/tinder-one.html"
      }
    }
  })

  .state('app.tinder-two', {
    url: "/tinder-two",
    views: {
      'menuContent': {
        templateUrl: "templates/tinder-two.html"
      }
    }
  })

  .state('app.tinder-three', {
    url: "/tinder-three",
    views: {
      'menuContent': {
        templateUrl: "templates/tinder-three.html"
      }
    }
  })

  .state('app.tinder-four', {
    url: "/tinder-four",
    views: {
      'menuContent': {
        templateUrl: "templates/tinder-four.html"
      }
    }
  })

  .state('app.news', {
    url: "/news-feed",
    views: {
      'menuContent': {
        templateUrl: "templates/news-feed.html",
        controller: 'NewsCtrl'
      }
    }
  })

  .state('app.profile', {
    url: "/profile",
    views: {
      'menuContent': {
        templateUrl: "templates/profile.html"
      }
    }
  })
  .state('app.followers', {
    url: "/followers",
    views: {
      'menuContent': {
        templateUrl: "templates/followers.html"
      }
    }
  })
  .state('app.listUsers', {
    url: "/listUsers",
    views: {
      'menuContent': {
        templateUrl: "templates/listUsers.html"
      }
    }
  })

  /*
  * MARISHOP navigation from here
  * */

  .state('app.idea', {
    url: "/idea-feed",
    views: {
      'menuContent': {
        templateUrl: "templates/idea-feed.html",
        controller: 'IdeaCtrl'
      }
    },
    authenticate: true
  })
  .state('app.idea-detail', {
    url: "/idea-feed/:ideaId",
    views: {
      'menuContent': {
        templateUrl: "templates/idea-detail.html",
        controller: 'IdeaDetailCtrl'
      }
    },
    authenticate: true
  })
  .state('login', { // Notice: this state name matches the loginState property value to set in authProvider.init({...}) below...
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })
  .state('signup', { // Notice: this state name matches the loginState property value to set in authProvider.init({...}) below...
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'SignupCtrl'
  })

  ;


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('app/idea-feed');
})
.factory('authInterceptor', function ($rootScope, $q, $cookies, $location) {
  return {
    // Add authorization token to headers
    request: function (config) {
      config.headers = config.headers || {};
      if ($cookies.token) {
        config.headers.Authorization = 'Bearer ' + $cookies.token;
      }
      return config;
    },

    // Intercept 401s and redirect you to login
    responseError: function(response) {
      if(response.status === 401) {
        $location.path('/login');
        // remove any stale tokens
        $cookie.remove('token');
        return $q.reject(response);
      }
      else {
        return $q.reject(response);
      }
    }
  };
})
.constant('ApiEndpoint', {
  //auth_url: 'http://marishopserver-gsopenlab.rhcloud.com/auth'
  //,api_url: 'http://marishopserver-gsopenlab.rhcloud.com/api'
  auth_url: 'http://http://54.249.20.38:8100/auth'
  ,api_url: 'http://http://54.249.20.38:8100/api'
  ,cdn_url: 'http://marishopserver-gsopenlab.rhcloud.com:8000'
})
.run(function ($rootScope, $location, Auth) {
  // Redirect to login if route requires auth and you're not logged in
  $rootScope.$on('$stateChangeStart', function (event, next) {

    Auth.isLoggedInAsync(function(loggedIn) {

      if (next.authenticate && !loggedIn) {
        event.preventDefault();
        $rootScope.$evalAsync(function () {
          $location.path('/login');
        });
      }
    });
  });
})
.filter('formatText', function (){
  return function(input) {
    if(!input) return input;
    var output = input
      //replace possible line breaks.
    .replace(/(\r\n|\r|\n)/g, '<br/>')
      //replace tabs
    .replace(/\t/g, '&nbsp;&nbsp;&nbsp;')
      //replace spaces.
    .replace(/ /g, '&nbsp;');

    return output;
  };
});
