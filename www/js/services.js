angular.module('starter.services', [])

.factory('Ideas', function($http, $q, ApiEndpoint) {
  var countPerPage = 10;//default

  return {

    all: function() {
      $http.get(ApiEndpoint.api_url+"/ideas")
      .success(function(data){
        console.log(data);

        //$scope.idea.images.push("http://localhost:9000"+data.path);

      })
      .error(function(err){
        console.log(err);
      });

      return contents;
    },
    getPageList : function(pagination, callback){
      var cb = callback || angular.noop;
      var deferred = $q.defer();

      var last_id = pagination.last_id;
      var limit = pagination.limit;

      $http.get(ApiEndpoint.api_url+"/ideas",{params:{last_id:last_id,limit:limit}})
      .success(function(data){
        deferred.resolve(data);
        return cb();
      })
      .error(function(err){
        deferred.reject(err);
        return cb(err);
      }.bind(this));

      return deferred.promise;
    },

    getRefreshList : function(pagination, callback){
      var cb = callback || angular.noop;
      var deferred = $q.defer();

      var first_id = pagination.first_id;

      $http.get(ApiEndpoint.api_url+"/ideas",{params:{first_id:first_id,refresh:true}})
      .success(function(data){
        deferred.resolve(data);
        return cb();
      })
      .error(function(err){
        deferred.reject(err);
        return cb(err);
      }.bind(this));

      return deferred.promise;
    },


    getOne: function(idea, callback) {
      var cb = callback || angular.noop;
      var deferred = $q.defer();

      $http.get(ApiEndpoint.api_url+"/ideas/"+idea.id)
      .success(function(data){
        deferred.resolve(data);
        return cb();
      })
      .error(function(err){
        deferred.reject(err);
        return cb(err);
      }.bind(this));

      return deferred.promise;
    }
  };

})
.factory('Famous', function(ApiEndpoint) {

   var contents = [
     { id : '1',
       title :'맛집'},
     { id : '2',
       title :'암벽체험'},
     { id : '3',
       title :'남산'},
     { id : '4',
       title :'남이섬'}

   ];

  return {
    getAll : function(callback){
      var cb = callback || angular.noop;
      var deferred = $q.defer();

      $http.get(ApiEndpoint.api_url+"/replies")
      .success(function(data){
        deferred.resolve(data);
        return cb();
        //$scope.idea.images.push("http://localhost:9000"+data.path);
      })
      .error(function(err){
        deferred.reject(err);
        return cb(err);
      }.bind(this));

      return deferred.promise;
    }
  };

})

.factory('Replies', function($http,$q,ApiEndpoint) {

   var contents = [
     { id : '1',
       name :'hitzi',
       content : '어 이거 재밌겠네요 실제로 하면 라이브배송 서비스도 알려질수 있을 것 같아요 ',
       user_image : 'img/92.jpg',
       time : "2015.06.29 14:23",
       image : "card-full-1.jpg"
     },
     { id : '2',
       name :'james',
       content : '친구와 기억에 남을 여행을 하고 싶어 한국을 찾았는데, 평생 간직하고 싶은 화보집까지 얻었네요. 빅뱅헝아 짱. 이 여행 강추 합니다.',
       user_image : 'img/27.jpg',
       time : "2015.06.29 14:23",
       image : "card-full-2.jpg"
     },
     { id : '3',
       name :'eskozz',
       content : '친구와 기억에 남을 여행을 하고 싶어 한국을 찾았는데, 평생 간직하고 싶은 화보집까지 얻었네요. 빅뱅헝아 짱. 이 여행 강추 합니다.',
       user_image : 'img/48.jpg',
       time : "2015.06.29 14:23",
       image : "card-full-3.jpg"
     },
     { id : '4',
       name :'yohany',
       content : '친구와 기억에 남을 여행을 하고 싶어 한국을 찾았는데, 평생 간직하고 싶은 화보집까지 얻었네요. 빅뱅헝아 짱. 이 여행 강추 합니다.',
       user_image : 'img/88.jpg',
       time : "2015.06.29 14:23",
       image : "card-full-4.jpg"
     }

   ];

  return {
    all : function(reply, callback){
      var cb = callback || angular.noop;
      var deferred = $q.defer();

      $http.get(ApiEndpoint.api_url+"/replies/"+reply.ideaId)
      .success(function(data){
        deferred.resolve(data);
        return cb();
        //$scope.idea.images.push("http://localhost:9000"+data.path);
      })
      .error(function(err){
        deferred.reject(err);
        return cb(err);
      }.bind(this));

      return deferred.promise;
    }
  };

})
.directive('fileModel', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;

      element.bind('change', function(){
        scope.$apply(function(){
          modelSetter(scope, element[0].files[0]);
        });
      });
    }
  };
}])

.directive('ngRepeatRange', ['$compile', function ($compile) {
  return {
    replace: true,
    scope: { from: '=', to: '=', step: '=' },

    link: function (scope, element, attrs) {

      // returns an array with the range of numbers
      // you can use _.range instead if you use underscore
      function range(from, to, step) {
        var array = [];
        while (from + step <= to)
          array[array.length] = from += step;

        return array;
      }

      // prepare range options
      var from = scope.from || 0;
      var step = scope.step || 1;
      var to   = scope.to || attrs.ngRepeatRange;

      // get range of numbers, convert to the string and add ng-repeat
      var rangeString = range(from, to + 1, step).join(',');
      angular.element(element).attr('ng-repeat', 'n in [' + rangeString + ']');
      angular.element(element).removeAttr('ng-repeat-range');

      $compile(element)(scope);
    }
  };
}]).directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if (event.which === 13) {
        scope.$apply(function () {
          scope.$eval(attrs.ngEnter, {
            'event': event
          });
        });

        event.preventDefault();
      }
    });
  };
});