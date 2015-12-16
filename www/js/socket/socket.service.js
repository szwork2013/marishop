/* global io */
'use strict';

angular.module('starter')
  .factory('socket', function(socketFactory,ApiEndpoint,$rootScope,Auth) {

    // socket.io now auto-configures its connection when we ommit a connection url

    var ioSocket,socket;
    var socketReady = false;

    //ioSocket = io(ApiEndpoint.cdn_url, {
    //  // Send auth token on connection, you will need to DI the Auth service above
    //  // 'query': 'token=' + Auth.getToken()
    //  path: '/socket.io-client'
    //});
    //
    //socket = socketFactory({
    //  ioSocket: ioSocket
    //});

    var initSocket = function(){
      console.log("init socket");
      if(window.io!== undefined){
        ioSocket = io(ApiEndpoint.cdn_url, {
          // Send auth token on connection, you will need to DI the Auth service above
          // 'query': 'token=' + Auth.getToken()
          path: '/socket.io-client'
        });

        socket = socketFactory({
          ioSocket: ioSocket
        });
        socketReady = true;
      }else{
        setTimeout(function(){
          initSocket();
        },1000);
      }
    }

    initSocket();


    return {
      socket: socket,
      socketReady : socketReady,

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
            if(item._creator._id==Auth.getCurrentUser()._id) {
              item.mine = true;
            }
            //array.unshift(item);
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
          console.log(modelName+":remove",item);
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
        socket.removeAllListeners(modelName + ':like');
      }


      ,setIdeaDetailSocket : function(_idea, array,content, cb, removeCb){
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
            event = 'updated';
          } else {
            array.push(item);
            content.comment +=1;
          }

        });

        socket.on('reply:remove', function (item) {
          var oldItem = _.find(array, {_id: item._id});
          var index = array.indexOf(oldItem);

          // replace oldItem if it exists
          // otherwise just add item to the collection
          if (oldItem) {
            array.splice(index, 1);
            content.comment -=1;
          }

        });

        socket.on("idea:like",function(data){
          cb(data);
        });

        socket.on("idea:remove",function(data){
          console.log("idea:remove",data);
          removeCb(data);
        })

        socket.on("reply:like",function(data){
          var oldItem = _.find(array, {_id: data._id});
          var index = array.indexOf(oldItem);
          array[index].like = data.like;
        });

      }
      ,emitCommentCreate : function(info){
        socket.emit("reply:save",info);
      }
      ,emitCommentRemove : function(info){
        socket.emit("reply:remove",info);
      }
      ,emitLike : function(_liker){
        socket.emit("idea:like",_liker);
      }
      ,emitReplyLike : function(_liker){
        socket.emit("reply:like",_liker);
      }
      ,emitRemove : function(_idea){
        socket.emit("idea:remove",_idea);
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
