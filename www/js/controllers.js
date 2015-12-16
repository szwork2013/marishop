angular.module('starter.controllers', [])
.controller('LoginCtrl', function($rootScope,$state, $scope, Auth, $location, ApiEndpoint) {
  $scope.user = {};
  $scope.errors = {};

  if(Auth.getCurrentUser()._id!=null){
    $state.go('app.idea');

  }

  $scope.login = function(form) {
    $scope.submitted = true;

    if(form.$valid) {
      Auth.login({
        email: $scope.user.email,
        password: $scope.user.password
      })
      .then( function() {
        // Logged in, redirect to home
        $location.path('/');
      })
      .catch( function(err) {
        $scope.errors.other = err.message;
      });
    }
  };
})
.controller('SignupCtrl', function($scope, Auth, $location) {
  $scope.user = {};
  $scope.errors = {};

  $scope.register = function(form) {
    $scope.submitted = true;

    if(form.$valid) {
      Auth.createUser({
        name: $scope.user.name,
        email: $scope.user.email,
        password: $scope.user.password
      })
      .then( function() {
        // Account created, redirect to home
        $location.path('/');
      })
      .catch( function(err) {
        err = err.data;
        $scope.errors = {};

        // Update validity of form fields that match the mongoose errors
        angular.forEach(err.errors, function(error, field) {
          form[field].$setValidity('mongoose', false);
          $scope.errors[field] = error.message;
        });
      });
    }
  };
})
.controller('AppCtrl', function($scope, $ionicModal,$location, $timeout, Auth) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.loginData = {};

  $scope.isLoggedIn = Auth.isLoggedIn;
  $scope.getCurrentUser = Auth.getCurrentUser;

  // Open the login modal
  $scope.logout = function() {
    Auth.logout();
    $location.path('/login');
  };


})

.controller('JCardsCtrl', function($scope) {
  console.log('CARDS CTRL Initiated');

  // The array holding the data we need. match your JSON to this.
   var cardTypes = [
    { 
      image: 'img/demo/tinder-full-pic.jpg', 
      title: 'Samantha Gamblesx', location: 'Manchester', 
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
      vipStatus : false
    },
    { 
      image: 'img/demo/tinder-full-pic-2.jpg', 
      title: 'Junior Max', location: 'Manchester', 
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
      vipStatus : true
    },
    { 
      image: 'img/demo/tinder-full-pic-3.jpg', 
      title: 'Karla Valentine', location: 'Manchester', 
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
      vipStatus : true
    }
  ];

  $scope.cardsControl = {};
  
  //Reloading the cards.
  $scope.reload = function() {
    $scope.cards = Array.prototype.slice.call(cardTypes, 0);

    //we'll need to have a counter for the cards deck
    $scope.cardCounter = $scope.cards.length;

    //we'll need a variable to tell us if the deck is empty or full. since we're reloading, default is false
    $scope.deckIsEmpty = false;

    //we'll clone our $scope.cards for our own custom functions (like counting and exposing card data)
    $scope.cardDataArray = $scope.cards.slice(0);

    //If a card is swyped, its details will always be here. if we are resetting/updating the stack, 
    // this variable will be reset. refer to the $scope.exposeSwypedCard function
    $scope.swypedCard = null;

    // debug data
    console.log('cards in deck: '+$scope.cards.length);
  }

  $scope.exposeSwypedCard = function() {
    //since a card has been removed from deck, reduce counter by 1 
    //we're doing this to balance the 0-notation of arrays vs the array.lenght
    $scope.cardCounter -= 1;

    //if deck is empty set variable to true
    if ($scope.cardCounter === 0){
      $scope.deckIsEmpty = true;
      console.log('deck is empty!');
    }
    

    //we'll use the cardCounter as the index in our cloned array for that card's data
    $scope.swypedCard = $scope.cardDataArray[$scope.cardCounter];


    //output to console. use to your preference (return it or use the $scope.swypedCard variable itself)
    console.log($scope.swypedCard);
  }

  //Takes out the swiped card data from the original array $scope.cards
  $scope.cardDestroyed = function(index) {
    $scope.cards.splice(index, 1);
  };

  $scope.addCard = function() {
    var newCard = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    newCard.id = Math.random();
    $scope.cards.push(angular.extend({}, newCard));
  };
  
  // On tapping the accept function - triggers the $scope.cardSwipedRight() function
  $scope.yesClick = function() {
    $scope.cardsControl.swipeRight();
  };
  
  // On tapping the reject function triggers the $scope.cardSwipedLeft () function
  $scope.noClick = function() {
    $scope.cardsControl.swipeLeft();
  };
  
  //Callback Function on swiping to the left
  $scope.cardSwipedLeft = function(index) {
    console.log('LEFT SWIPE');
    $scope.exposeSwypedCard();  
  };
  
  //Callback Function on swiping to the right
  $scope.cardSwipedRight = function(index) {
    console.log('RIGHT SWIPE');
    $scope.exposeSwypedCard();
  };
  
  $scope.reload()
})

.controller('NewsCtrl',function($scope, $ionicPopup){
  $scope.infoApp = function() {
    var alertPopup = $ionicPopup.alert({
      title: '<b class="assertive">Template</b>',
      template: '<center>Template ionSunset </center>',
      buttons: [
        {
          text: 'Ok',
          type: 'button-dark'
        }
      ]
    });
    alertPopup.then(function(res) {
      console.log('Thank you!!');
    });
  };
})

.controller('MenuActiveCtrl', function($scope, $location) {
  $scope.isActive = function(route) {
    return route === $location.path();
  }
})

.controller('IdeaCtrl',function($rootScope, $scope, $stateParams,$ionicPopup,$ionicModal,$cordovaCamera,$cordovaImagePicker,$http,Upload , Ideas, Auth, socket,toaster,ApiEndpoint){

  $scope.limit = 5;
  $scope.last_id = '';
  $scope.noMoreItemsAvailable = false;

  $scope.totalCount = 0;



  $scope.contents =[];


  var setSocket = function(){
    console.log("setting socket");
    if(socket.socketReady){
      socket.syncUpdates('idea', $scope.contents);
    }else{
      setTimeout(function(){
        setSocket();
      },100)
    }
  };

  setSocket();


  var getPageList = function(cb){
    Ideas.getPageList({
      last_id: $scope.last_id,
      limit: $scope.limit
    })
    .then( function(data) {
      // Logged in, redirect to home
      console.log(data);
      //angular.extend($scope.contents,data);

      if(data.length<$scope.limit-1){
        $scope.noMoreItemsAvailable = true;
      }else{
        $scope.last_id = data[data.length-1]._id;
      }

      for(var i in data){
        if(data[i]._creator._id==Auth.getCurrentUser()._id){
          data[i].mine = true;
        }else{
          data[i].mine = false;

        }
        data[i].liker.forEach(function(val) {

          if (val == Auth.getCurrentUser()._id) {
            data[i].ilike = true;
          }
        })

        $scope.contents.push(data[i]);
      }

      cb();
    })
    .catch( function(err) {
      $scope.errors.other = err.message;
    });
  };


  //getPageList(function(){
  //  socket.syncUpdates('idea', $scope.contents);
  //});

  $scope.idea = {body:"",images:[],tags:[],bg:""};

  $scope.selectBg = function(bg){
    $scope.idea.bg = bg;
  }

  $scope.selectedBg = function(bg){
    if($scope.idea.bg == bg){
      return 'bg-selected';
    }
  }

  $scope.like = function(content){
    socket.emitLike({_liker:Auth.getCurrentUser()._id,_idea:content._id});

    if(content.ilike){
      content.ilike = false;
      content.like-=1;
    }else{
      content.ilike = true;
      content.like+=1;
    }
  }

  $scope.loadMore = function() {
    console.log('loadMore');


    getPageList(function(){
      //socket.syncUpdates('idea', $scope.contents);
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });

  };

  var getNextPage = function(){
    $scope.countPerPage = 2;
    $scope.page++;

    if($scope.totalCount>=($scope.page+1)*$scope.countPerPage){
      var item = Ideas.getPageList($scope.page,$scope.countPerPage );
    }else{
      var item = {};
      $scope.noMoreItemsAvailable = true;
    }
    return item;

  }

  $ionicModal.fromTemplateUrl('create-idea.html', {
    scope: $scope,
    animation: 'slide-in-up',
    focusFirstInput: true
  }).then(function(modal) {
    $scope.addIdeaModal = modal;
  });

  $scope.openCreateIdeaModal = function(title) {
    //toaster.pop({
    //  type: 'success',
    //  title: 'OK',
    //  body: 'Idea가 저장되었습니다.',
    //  timeout:50000000,
    //  showCloseButton: true
    //});
    $scope.replyTitle = title;
    $scope.addIdeaModal.show();
  };
  $scope.closeCreateIdeaModal = function() {

    $scope.addIdeaModal.hide();
  };



  $scope.takePhoto = function() {

    var options = {
      quality: 50,
      destinationType: navigator.camera.DestinationType.FILE_URI,
      sourceType: navigator.camera.PictureSourceType.CAMERA,
      allowEdit: true,
      encodingType: navigator.camera.EncodingType.JPEG,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false,
      correctOrientation:true
    };

    $cordovaCamera.getPicture(options).then(function(imageURI) {
      $scope.idea.images.push(imageURI);


    }, function(err) {
      // error
    });



  };


  $scope.getMultiPhoto = function(){
    console.log($cordovaImagePicker);
    var options = {
      maximumImagesCount: 10,
      quality: 80
    };

    $cordovaImagePicker.getPictures(options)
    .then(function (results) {
      for (var i = 0; i < results.length; i++) {
        console.log('Image URI: ' + results[i]);
        $scope.idea.images.push(results[i]);
      }
    }, function(error) {
      // error getting photos
    });

  }
  $scope.getPhoto = function() {

    var options ={ quality: 90,
      destinationType: navigator.camera.DestinationType.FILE_URI,
      sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
      encodingType: navigator.camera.EncodingType.PNG,
      targetWidth: 120,
      targetHeight: 120,
      correctOrientation: true};


    Album.getPhoto(options).then(function(imageURI) {
      window.FilePath.resolveNativePath(imageURI, function(fileEntry) {

        //If this doesn't work
        setPhoto("file://" + fileEntry);


      }, function(error){
        console.log('about to resolve this files errors');
        console.log(error);
        console.log(error.code);
      });

    }, function(err) {
      console.log(err);
    });
  };

  $scope.infoApp = function() {
    var alertPopup = $ionicPopup.alert({
      title: '<b class="assertive">Template</b>',
      template: '<center>Template ionSunset </center>',
      buttons: [
        {
          text: 'Ok',
          type: 'button-dark'
        }
      ]
    });
    alertPopup.then(function(res) {
      console.log('Thank you!!');
    });
  };

  $scope.onFileSelect = function($files) {
    console.log($files);
    for (var i = 0; i < $files.length; i++) {
      var file = $files[i];

      console.log(file);

      var fd = new FormData();
      fd.append('fileField1', file);

      $http.post(ApiEndpoint.api_url+"/ideas/upload", fd, {
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined},
          enctype: 'multipart/form-data'
        })
      .success(function(data){
        console.log(data);
        $scope.idea.images.push("http://localhost:9000"+data.path);

      })
      .error(function(err){
        console.log(err);
      });

    }
  }

  var uploadImages = [];
  $scope.imagePreview = function($files) {

    for (var i = 0; i < $files.length; i++) {
      var file = $files[i];
      var reader = new FileReader();

      reader.onload = function(event) {
        $scope.idea.images.push(event.target.result);
        uploadImages.push(file);
        $scope.$apply()
      }
      // when the file is read it triggers the onload event above.
      reader.readAsDataURL(file);
    }
  }

  $scope.somePlaceholder="메인에 보여질 한마디를 적어주세요.";
  $scope.createIdea = function(){
    var mergedTags =[];

    if($scope.idea.body==''){
      $scope.somePlaceholder="꼭 적어주셔야 해요.";
      return;
    }

    if($scope.idea.bg==''){
      $scope.idea.bg="1";
    }

    angular.forEach($scope.idea.tags, function(value, key) {
      this.push(value.text);
    }, mergedTags);

    $scope.idea.tags = mergedTags;

    if($scope.idea.images.length<1){
      $scope.idea._creator = Auth.getCurrentUser()._id;
      if($scope.idea === '') {
        return;
      }
      $http.post(ApiEndpoint.api_url+"/ideas",$scope.idea)
      .success(function(data){
        //$scope.idea.images.push("http://localhost:9000"+data.path);
        toaster.pop({
          type: 'success',
          title: 'OK',
          body: 'Idea가 저장되었습니다.',
          timeout:5000,
          showCloseButton: true
        });
        $scope.doRefresh();
        $scope.closeCreateIdeaModal();

      })
      .error(function(err){
        console.log(err);
      });


      $scope.idea = {body:"",images:[],tags:[]};
    }else{
      createIdeaWithFile();
    }
  }

  $scope.removeIdea = function(_id){
    $http.delete(ApiEndpoint.api_url+"/ideas/"+_id)
    .success(function(data){
      //$scope.idea.images.push("http://localhost:9000"+data.path);
      toaster.pop({
        type: 'success',
        title: 'OK',
        body: 'Idea가 삭제되었습니다.',
        timeout:5000,
        showCloseButton: true
      });

    })
    .error(function(err){
      console.log(err);
    });


  }

  var createIdeaWithFile = function(){

    var fd = new FormData();

    fd.append('fileCount',uploadImages.length);
    for (var i in uploadImages){
      fd.append('fileField'+i, uploadImages[i]);
    }
    /*
     _creator : { type: Schema.ObjectId, ref: 'User' },
     body: {type: String, required: true, trim: true}, // channel
     like: {type: Number, default : 0}, // channel
     date: {type: Date, default: Date.now}, // created
     images : [],
     tags : []
     */
    fd.append('body', $scope.idea.body);
    fd.append('detail', $scope.idea.detail);
    fd.append('bg', $scope.idea.bg);
    fd.append('_creator', Auth.getCurrentUser()._id);

    var mergedTags =[]

    angular.forEach($scope.idea.tags, function(value, key) {
      this.push(value.text);
    }, mergedTags);

    fd.append('tags', mergedTags);

    $http.post(ApiEndpoint.api_url+"/ideas/upload", fd, {
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined},
      enctype: 'multipart/form-data'
    })
    .success(function(data){
      //$scope.idea.images.push("http://localhost:9000"+data.path);
      toaster.pop('success', "title", "text");
      $scope.closeCreateIdeaModal();
      $scope.idea = {body:"",images:[],tags:[]};

    })
    .error(function(err){
      console.log(err);
    });

  }

  $scope.doRefresh = function() {

    console.log($scope.contents[0]);
    Ideas.getRefreshList({
      first_id: $scope.contents[0]._id
    })
    .then( function(data) {
      // Logged in, redirect to home
      console.log(data);
      //angular.extend($scope.contents,data);

      for(var i in data){
        if(data[i]._creator._id==Auth.getCurrentUser()._id){
          data[i].mine = true;
        }else{
          data[i].mine = false;

        }
        data[i].liker.forEach(function(val) {

          if (val == Auth.getCurrentUser()._id) {
            data[i].ilike = true;
          }
        })
        $scope.contents.unshift(data[i]);
      }
    })
    .catch( function(err) {
      $scope.errors.other = err.message;
    });

    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply()
  };


  $scope.$on('$destroy', function () {
    socket.unsyncUpdates('idea');
  });
})


.controller('IdeaDetailCtrl',function($rootScope,$scope, $state, $ionicPopup,$stateParams,$http,$ionicModal, Ideas,Replies, Auth, socket,ApiEndpoint,toaster){
  //$scope.content = Ideas.getOne($stateParams.ideaId);

  console.log(Auth.getCurrentUser()._id);
  var userId = Auth.getCurrentUser()._id;
  $scope.noMoreItemsAvailable = true;
  $scope.content = {};
  $scope.removed = false;
  $scope.mine = false;
  $scope.idea = {};

  var isThisMine = function(){
    if(userId){
      if($scope.content._creator._id==userId){
        $scope.content.mine = true;
      }else{
        $scope.content.mine = false;
      }
    }else{
      setTimeout(function(){
        console.log("is this mine timeout");
        isThisMine();
      },1000)
    }
  }
  Ideas.getOne({
    id: $stateParams.ideaId
  })
  .then( function(data) {
    // Logged in, redirect to home

    $scope.content = data;
    isThisMine();



    data.liker.forEach(function(val) {

      if (val == Auth.getCurrentUser()._id) {
        $scope.content.ilike = true;
      }
    })
  })
  .catch( function(err) {
    $scope.removed = true;
    //$scope.errors.other = err.message;
  });
  $scope.goFeed = function(){
    $state.go("app.idea");
  }
  $scope.removeIdea = function(_id){
    socket.emitRemove(_id);

    $http.delete(ApiEndpoint.api_url+"/ideas/"+_id)
    .success(function(data){
      toaster.pop({
        type: 'success',
        title: 'OK',
        body: 'Idea가 삭제되었습니다.',
        timeout:5000,
        showCloseButton: true
      });

      $scope.content={};
      $scope.removed = true;

      socket.emitRemove(_id);
    })
    .error(function(err){
      console.log(err);
    });
  };

  $ionicModal.fromTemplateUrl('update-idea.html', {
    scope: $scope,
    animation: 'slide-in-up',
    focusFirstInput: true
  }).then(function(modal) {
    $scope.updateIdeaModal = modal;
  });

  $scope.openUpdateIdeaModal = function(content) {
    console.log(content);
    $scope.idea = content;
    $scope.updateIdeaModal.show();
  };
  $scope.closeUpdateIdeaModal = function() {

    $scope.updateIdeaModal.hide();
  };

  $scope.updateIdea = function(){
    var mergedTags =[];

    if($scope.idea.body==''){
      $scope.somePlaceholder="꼭 적어주셔야 해요.";
      return;
    }

    if($scope.idea.bg==''){
      $scope.idea.bg="1";
    }

    angular.forEach($scope.idea.tags, function(value, key) {
      this.push(value.text);
    }, mergedTags);

    if($scope.idea.images.length<1){
      $scope.idea._creator = Auth.getCurrentUser()._id;
      if($scope.idea === '') {
        return;
      }

      var params = {bg:$scope.idea.bg
                  , body:$scope.idea.body
                  , detail:$scope.idea.detail
                  , tags:mergedTags};

      $http.put(ApiEndpoint.api_url+"/ideas/"+$scope.idea._id,params)
      .success(function(data){

        $scope.content = data;
        isThisMine();

        toaster.pop({
          type: 'success',
          title: 'OK',
          body: 'Idea가 수정되었습니다.',
          timeout:5000,
          showCloseButton: true
        });
        $scope.closeUpdateIdeaModal();
        $scope.idea = {body:"",images:[],tags:[]};
      })
      .error(function(err){
        console.log(err);
      });

    }else{
      //createIdeaWithFile();
    }
  }

  $scope.selectBg = function(bg){
    $scope.idea.bg = bg;
  }

  $scope.selectedBg = function(bg){
    if($scope.idea.bg == bg){
      return 'bg-selected';
    }
  }



  $scope.reply = {_idea:$stateParams.ideaId
                  ,_creator:Auth.getCurrentUser()._id};


  Replies.all({ideaId:$stateParams.ideaId})
  .then( function(data) {
    $scope.replies = data;

    $scope.content.comment = data.length;

    socket.setIdeaDetailSocket($stateParams.ideaId, $scope.replies,$scope.content,function(data){
      $scope.content.like = data.like;

      if(data.plus&&(Auth.getCurrentUser()._id==data.liker)){
        $scope.content.ilike = true;

      }else if(!data.plus&&(Auth.getCurrentUser()._id==data.liker)){
        $scope.content.ilike = false;
      }
    },
    function(data){
      if(!$scope.mine && $scope.content._id==data._idea){
        $scope.content={};
        $scope.removed = true;
        //toaster.pop({
        //  type: 'success',
        //  title: 'OK',
        //  body: '삭제된 Idea입니다.',
        //  timeout:5000,
        //  showCloseButton: true
        //});
      }
    });

  })
  .catch( function(err) {
    $scope.errors.other = err.message;
  });


  $scope.like = function(){
    socket.emitLike({_liker:Auth.getCurrentUser()._id,_idea:$stateParams.ideaId});
  };

  $scope.loadMore = function() {
    console.log('loadMore');
    //var item = Replies.all();
    //for(var i in item){
    //  $scope.replies.push(item[i]);
    //}
    $scope.$broadcast('scroll.infiniteScrollComplete');
  };

  $scope.createReply = function(){

    if($scope.reply.comment==""){
      return;
    }


    $http.post(ApiEndpoint.api_url+"/replies", $scope.reply)
    .success(function(data){
      $scope.reply.comment="";

      socket.emitCommentCreate({_id:data._id,_idea:data._idea});

    })
    .error(function(err){
      console.log(err);
    });
  }
  $scope.$on('$destroy', function () {
    socket.unsyncUpdates('idea');
    socket.unsyncUpdates('reply');
  });

})
;
