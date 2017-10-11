'use strict';

angular.module('sample.module')
  .config(function config($stateProvider) {
    $stateProvider
      .state('app.menu.option', {
        url: '/option',
        abstract: true,
        views: {
          'tab-option': {
            templateUrl: 'app/option/templates/layout.html'
          },
          'menu': {
            templateUrl: 'app/option/templates/layout.html'
          }
        }
      })
      .state('app.menu.option.home', {
        url: '/home',
        views: {
          'optionContent': {
            templateUrl: 'app/option/templates/home-opt.html',
            controller: 'OptionCtrl'
          }
        }
      })
  });
