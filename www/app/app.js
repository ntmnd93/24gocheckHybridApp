'use strict';

/**
* @ngdoc overview
* @name starter
*
* @requires ionic
* @requires ngCordova
* @requires angular-preload-image
* @requires ngLocalize
* @requires ngLocalize.InstalledLanguages
* @requires ionic.service.core
* @requires ngStorage
* @requires ngMessages
* @requires shop.module
* @requires offers.module
* @requires cart.module
* @requires info.module
* @requires payments.module
* @requires auth.module
*
* @description
* Main entry point of the app. When a new module needs to be added, have to inject the module here. ex, `sample.module`
* New languages must be initialized by editing following configuration values,
* ```
 .value('localeSupported', [
        'en-US',
        'fr-FR',
        'zh-CN'
    ])
 ```
*
* Configuration for the main entrypoint of the app is here.
* You can switch the main layout (tabs or side menu) by toggling templateUrl of the
* 'app.menu' state.

* The app is bootstrapped from an abstract state called `app`. Then it branches into
* two abstract states, `app.menu` and `app.main`. All the states which inherit `app.menu`
* state will have either tabs or side menu, whereas `app.main` will have a clean
* layout without tabs or side menus.
*
* ```
$stateProvider
    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'app/menu/templates/app.html',
        controller: 'AppCtrl'
    })
    .state('app.menu', {
        url: '/menu',
        abstract: true,
        templateUrl: 'app/menu/templates/tabs.html',
        //templateUrl: 'app/menu/templates/side.html',
        controller: 'MenuCtrl'
    })
    .state('app.main', {
        url: '/main',
        abstract: true,
        templateUrl: 'app/menu/templates/menuless.html',
        controller: 'MainCtrl'
    })
* ```
*/
var starter = angular.module('starter', ['ionic', 'ngCordova', 'angular-preload-image', 'ionic-ratings', 'ngLocalize', 'ngLocalize.InstalledLanguages', 'ngLocalize.Events', 'ionic.service.core', 'ngStorage', 'ngMessages', 'shop.module', 'offers.module', 'cart.module', 'info.module', 'payments.module', 'auth.module', 'notification.module', 'chatbox.module', 'option.module'])
    .run(function ($ionicPlatform, $ionicPopup, $ionicLoading, $localStorage, $ionicNavBarDelegate, $ionicScrollDelegate, $rootScope, $timeout, $state, notificationService, updateService, analyticsService, intercomService) {
        $ionicPlatform.ready(function () {

            // init ionic service platform
            Ionic.io();

            // check for updates
            updateService.init();

            $localStorage.silent = $localStorage.silent || false;

            // call to push registration if service is available
            var pushInit = function () {
                if (!$localStorage.silent && notificationService && notificationService.subscribeForPush)
                    notificationService.subscribeForPush();
            }

            // init push notification
            $timeout(function () {
                pushInit();
            }, 2000);

            // google analytics
            analyticsService.init();

            // local notifications
            notificationService.init();

            // intercom service
            intercomService.init();

            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (cordova.platformId === 'ios' && window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }

            $ionicPlatform.onHardwareBackButton(function (event) {
                event.preventDefault();
                event.stopPropagation();
                $ionicLoading.hide();
            });
        });

        $rootScope.$on('$ionicView.enter', function () {
            $ionicNavBarDelegate.showBar(true);
        });

        $rootScope.$on('$ionicView.loaded ', function () {

        });
    })
    //list of languages currently supported
    .value('localeSupported', [
        'vi-VN',
        'en-US',
        'fr-FR',
        'zh-CN',
        'ar-EG'
    ])
    //fallbacks when a particular language is present but not for the region from which the app is being opened (e.g. en-GB will use en-US)
    .value('localeFallbacks', {
        'vi': 'vi-VN',
        'en': 'en-US',
        'fr': 'fr-FR',
        'zh': 'zh-CN',
        'ar': 'ar-EG'
    })
    .config(function ($stateProvider, $urlRouterProvider) {
        /**
         * You can switch the main layout (tabs or side menu) by toggling templateUrl of the
         * 'app.menu' state.
         *
         * The app is bootstrapped from an abstract state called `app`. Then it branches into
         * two abstract states, `app.menu` and `app.main`. All the states which inherit `app.menu`
         * state will have either tabs or side menu, whereas `app.main` will have a clean
         * layout without tabs or side menus.
         * **/
        $stateProvider
            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'app/menu/templates/app.html',
                controller: 'AppCtrl'
            })
            .state('app.menu', {
                url: '/menu',
                abstract: true,
                templateUrl: 'app/menu/templates/tabs.html',
                //templateUrl: 'app/menu/templates/side.html',
                controller: 'MenuCtrl'
            })
            .state('app.main', {
                url: '/main',
                abstract: true,
                templateUrl: 'app/menu/templates/menuless.html',
                controller: 'MainCtrl'
            })
    })
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('welcome', {
                url: '/welcome',
                templateUrl: 'templates/welcome.html',
                controller: 'WelcomeCtrl'
            })

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/welcome');
    })
    .config(function ($httpProvider) {
        $httpProvider.defaults.withCredentials = true;
    });

starter.config(function ($ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('bottom').style('standard');
})

starter.constant('$ionicLoadingConfig', {
    templateUrl: 'templates/loading.html',
    duration: 30000
})

.directive('ionSegment', function() {
  return {
    restrict: 'E',
    require: "ngModel",
    transclude: true,
    replace: true,
    scope: {
      full: '@full'
    },
    template: '<ul id="ion-segment" ng-transclude></ul>',
    link: function($scope, $element, $attr, ngModelCtrl) {
      console.log("ion-segment link")
      if ($scope.full == "true") {
        $element.find("li").addClass("full");
      }
      var segment = $element.find("li").eq(0).attr("value");
      $element.find("li").eq(0).addClass("active");

      ngModelCtrl.$setViewValue(segment);

    }
  }
})
  .directive('ionSegmentButton', function() {
    return {
      restrict: 'E',
      require: "^ngModel",
      transclude: true,
      replace: true,
      template: '<li ng-transclude></li>',
      link: function($scope, $element, $attr, ngModelCtrl) {
        var value;
        function onChange(){
          if(value === ngModelCtrl.$modelValue){
            $element.parent().find("li").removeClass("active");
            $element.addClass("active");
          }
        }
        $scope.$watch(function(){
          return ngModelCtrl.$modelValue;
        }, onChange);
        $attr.$observe("value", function(_value){
          value = _value;
          onChange();
        });

        var clickingCallback = function() {
          ngModelCtrl.$setViewValue(value);
        };

        $element.bind('click', clickingCallback);

      }
    }
  })
