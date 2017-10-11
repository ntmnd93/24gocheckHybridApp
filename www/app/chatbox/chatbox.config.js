'use strict';

angular.module('chatbox.module')
  .config(function config($stateProvider) {
    $stateProvider
      .state('app.menu.chatbox', {
        url: '/chatbox',
        abstract: true,
        views: {
          'tab-chatbox': {
            templateUrl: 'app/chatbox/templates/layout.html'
          },
          'menu': {
            templateUrl: 'app/chatbox/templates/layout.html'
          }
        }
      })
      .state('app.menu.chatbox.home', {
        url: '/home',
        views: {
          'chatContent': {
            templateUrl: 'app/chatbox/templates/home-chatbox.html',
            controller: 'ChatBoxCtrl'
          }
        },
        params: { redirect: null }
      })
      // .state('app.menu.chatbox.home', {
      //   url: '/home',
      //   views: {
      //     'chatboxContent': {
      //       templateUrl: 'app/cart/templates/home-chatbox.html',
      //       controller: 'ChatBoxCtrl'
      //     }
      //   }
      // })
  });
