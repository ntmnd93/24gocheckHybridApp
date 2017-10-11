'use strict';

angular.module('info.module')
    .config(function config($stateProvider, $urlRouterProvider) {
        $stateProvider
           .state('app.menu.info', {
               url: '/info',
               abstract: true,
               views: {
                   'tab-info': {
                       templateUrl: 'app/info/templates/layout.html'
                   },
                   'menu': {
                       templateUrl: 'app/info/templates/layout.html'
                   }
               }
           })
           .state('app.menu.info.home', {
               url: '/home',
               views: {
                   'infoContent': {
                       templateUrl: 'app/info/templates/info-home.html',
                       controller: 'InfoCtrl'
                   }
               },
               params: { redirect: null }
           })
           .state('app.menu.info.orders', {
               url: '/orders',
               views: {
                   'infoContent': {
                       templateUrl: 'app/info/templates/info-orders-list.html',
                       controller: 'InfoOrdersCtrl'
                   }
               }
           })
           .state('app.menu.info.order', {
               url: '/order/:id',
               views: {
                   'infoContent': {
                       templateUrl: 'app/info/templates/info-order.html',
                       controller: 'InfoLoadOrderCtrl'
                   }
               }
           })
           .state('app.menu.info.wishlist', {
               url: '/wishlist',
               views: {
                   'infoContent': {
                       templateUrl: 'app/info/templates/info-wishlist.html',
                       controller: 'InfoWishlistCtrl'
                   }
               }
           })
          .state('app.menu.info.favorite', {
            url: '/favorite',
            views: {
              'infoContent': {
                templateUrl: 'app/info/templates/info-favorite.html',
                controller: 'InfoFavCtrl'
              }
            }
          })
          .state('app.menu.info.feedback', {
            url: '/feedback',
            views: {
              'infoContent': {
                templateUrl: 'app/info/templates/info-feedback.html'
              }
            }
          })
          .state('app.menu.info.account-info', {
            url: '/account-info',
            views: {
              'infoContent': {
                templateUrl: 'app/info/templates/info-account-info.html',
                controller: 'InfoAccInfo'
              }
            }
          })
          .state('app.menu.info.transaction-history', {
            url: '/transaction-history',
            views: {
              'infoContent': {
                templateUrl: 'app/info/templates/info-transaction-history.html'
              }
            }
          })
          .state('app.menu.info.favorite.favorite-shops', {
            url: '/favorite-shops',
            views: {
              'shops-tab': {
                templateUrl: 'app/info/templates/info-favorite-shops.html'
              }
            }
          })
          .state('app.menu.info.favorite.favorite-products', {
            url: '/favorite-products',
            views: {
              'products-tab': {
                templateUrl: 'app/info/templates/info-favorite-products.html'
              }
            }
          });
      $urlRouterProvider.otherwise('/favorite/favorite-products');
    });
