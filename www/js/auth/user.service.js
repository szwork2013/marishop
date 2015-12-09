'use strict';

angular.module('starter.services')
  .factory('User', function ($resource, ApiEndpoint) {

    return $resource(ApiEndpoint.api_url+"/users/:id/:controller", {
      id: '@_id'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      }
	  });
  });
