/* global io */
'use strict';

angular.module('starter')
  .factory('socket', function(socketFactory,ApiEndpoint,$rootScope) {

    // socket.io now auto-configures its connection when we ommit a connection url
    var ioSocket = io(ApiEndpoint.cdn_url, {
      // Send auth token on connection, you will need to DI the Auth service above
      // 'query': 'token=' + Auth.getToken()
      path: '/socket.io-client'
    });

    var socket = socketFactory({
      ioSocket: ioSocket
    });

    return {
      socket: socket,

      /**
       * Register listeners to sync an array with updates on a model
       *
       * Takes the array we want to sync, the model name that socket updates are sent from,
       * and an optional callback function after new items are updated.
       *
       * @param {String} modelName
       * @param {Array} array
       * @param {Function} cb
       */
      syncUpdates: function (modelName, array, cb) {
        cb = cb || angular.noop;

        /**
         * Syncs item creation/updates on 'model:save'
         */
        socket.on(modelName + ':save', function (item) {
          console.log(item);
          var oldItem = _.find(array, {_id: item._id});
          var index = array.indexOf(oldItem);
          var event = 'created';

          // replace oldItem if it exists
          // otherwise just add item to the collection
          if (oldItem) {
            array.splice(index, 1, item);
            event = 'updated';
          } else {
            array.unshift(item);
          }

          cb(event, item, array);
        });

        /**
         * Syncs removed items on 'model:remove'
         */
        socket.on(modelName + ':remove', function (item) {
          var event = 'deleted';
          _.remove(array, {_id: item._id});
          cb(event, item, array);
        });
      },

      /**
       * Removes listeners for a models updates on the socket
       *
       * @param modelName
       */
      unsyncUpdates: function (modelName) {
        socket.removeAllListeners(modelName + ':save');
        socket.removeAllListeners(modelName + ':remove');
      }


      ,setIdeaDetailSocket : function(_idea, array,content, cb){
        cb = cb || angular.noop;

        var beforeSocket =$rootScope.currentSocket;
        $rootScope.currentSocket = "idea^"+_idea;

        socket.emit("idea:detail",{before:beforeSocket, current:$rootScope.currentSocket})
        socket.on('reply:save', function (item) {
          var oldItem = _.find(array, {_id: item._id});
          var index = array.indexOf(oldItem);
          var event = 'created';

          // replace oldItem if it exists
          // otherwise just add item to the collection
          if (oldItem) {
            array.splice(index, 1, item);
            content.comment -=1;
            event = 'updated';
          } else {
            array.unshift(item);
            content.comment +=1;
          }

        });

        socket.on("idea:like",function(data){
          cb(data);
        });



      }
      ,emitCommentCreate : function(info){
        socket.emit("reply:save",info);
      }
      ,emitLike : function(_liker){
        socket.emit("idea:like",_liker);
      }

      //,setLikeEvent : function(modelName, cb){
      //
      //
      //  cb = cb || angular.noop;
      //  console.log("set like Event socket");
      //
      //  socket.on(modelName+":like",function(data){
      //    cb(data);
      //  });
      //}


    };
  });
