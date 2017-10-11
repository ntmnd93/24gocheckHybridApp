﻿'use strict';

/**
* @ngdoc controller
* @name info.module.controller:InfoCtrl
* @requires $scope
* @requires $rootScope
* @requires $state
* @requires $stateParams
* @requires $localStorage
* @requires notificationService
* @requires LANGUAGES
*
* @description
* Shows the home page of info module. Contains user language switch which invokes a method
* defined in `rootScope`. Need to change `$scope.lanuages` variable if new languages are added or
* existing are removed.
*/
angular
    .module('info.module')
    .controller('InfoCtrl', function ($scope, $rootScope, $state, $stateParams, $localStorage, notificationService, LANGUAGES) {
        var vm = this;

        $scope.$on('$ionicView.enter', function () {

            $rootScope.$broadcast('i2csmobile.more');

            if ($stateParams.redirect) {
                $state.go("app.menu.info." + $stateParams.redirect);
                $stateParams.redirect = "";
            }
        });

        $scope.info = {};
        $localStorage.silent = $localStorage.silent || false;
        $scope.info.notifications = !$localStorage.silent;

        $scope.toggleNotifications = function () {
            if ($scope.info.notifications) {
                $localStorage.silent = false;
                notificationService.subscribeForPush();
            } else {
                $localStorage.silent = true;
                notificationService.unsubscribeFromPush();
            }
        };

        $scope.info.open_close_shop = "Mở";
        $scope.user.user_group_id = $localStorage.user.customer_group_id;
        $scope.user.customer_id = $localStorage.user.customer_id;
    });

/**
* @ngdoc controller
* @name info.module.controller:InfoOrdersCtrl
* @requires $scope
* @requires $ionicLoading
* @requires InfoService
* @description
* Shows the list of past orders of a logged in customer.
*/
angular
    .module('info.module')
    .controller('InfoOrdersCtrl', function ($scope, $ionicLoading, InfoService) {
        var vm = this;

        $ionicLoading.show();
        InfoService.GetOrders().then(function (data) {
            $scope.orders = data.orders;
            $ionicLoading.hide();
        }, function (data) {
            $ionicLoading.hide();
        });

    });

/**
* @ngdoc controller
* @name info.module.controller:InfoLoadOrderCtrl
* @requires $scope
* @requires $ionicLoading
* @requires $stateParams
* @requires InfoService
* @description
* Shows information and invoice of an order.
*/
angular
    .module('info.module')
    .controller('InfoLoadOrderCtrl', function ($scope, $ionicLoading, $stateParams, InfoService) {
        var vm = this;

        $ionicLoading.show();
        InfoService.GetOrder($stateParams.id).then(function (data) {
            $scope.products = data.products;
            $scope.totals = data.totals;

            $scope.invoice_no = data.invoice_no;
            $scope.order_id = data.order_id;
            $scope.date_added = data.date_added;
            $scope.shipping_address = data.shipping_address;
            $scope.shipping_method = data.shipping_method;

            $scope.histories = data.histories;

            $ionicLoading.hide();
        }, function (data) {
            $ionicLoading.hide();
        });
    });

/**
* @ngdoc controller
* @name shop.module.controller:InfoWishlistCtrl
* @requires $scope
* @requires $state
* @requires $ionicLoading
* @requires $ionicTabsDelegate
* @requires InfoService
* @description
* Display current wishlist.
*/
angular
    .module('info.module')
    .controller('InfoWishlistCtrl', function ($scope, $state, $ionicLoading, $ionicTabsDelegate, InfoService) {

        $scope.loadWishlist = function () {
            $ionicLoading.show();
            InfoService.GetWishlist().then(function (data) {
                $scope.items = data.products;
                $ionicLoading.hide();
                $scope.$broadcast('scroll.refreshComplete');
            }, function (data) {
                $ionicLoading.hide();
                $scope.$broadcast('scroll.refreshComplete');
            })
        }

        $scope.refreshUI = function () {
            $scope.loadWishlist();
        }

        $scope.goToShop = function () {
            $ionicTabsDelegate.select(0);
        }

        $scope.removeItem = function (id) {
            $ionicLoading.show();
            InfoService.RemoveFromWishlist(id).then(function (data) {
                $scope.loadWishlist();
            }, function (data) {
                $scope.loadWishlist();
            });
        }

        $scope.$on('$ionicView.enter', function () {
            $scope.loadWishlist();
        });
    });



angular
  .module('info.module')
  .controller('InfoAccInfo', function ($scope, $rootScope, $state, $stateParams, $localStorage, notificationService, LANGUAGES) {
    $scope.edit = {};
    $scope.edit.email = $localStorage.user.email;
    $scope.edit.firstname = $localStorage.user.firstname;
    $scope.edit.telephone = $localStorage.user.telephone;
    $scope.edit.address_1 = $localStorage.user.address_1;
    $scope.edit.city = $localStorage.user.city;
    $scope.edit.postal_code = $localStorage.user.postal_code;
    $scope.edit.country_id = $localStorage.user.country_id;
    $scope.edit.zone_id = $localStorage.user.zone_id;

    // var str = JSON.stringify($localStorage.user);
    // str = JSON.stringify($localStorage.user, null, 4); // (Optional) beautiful indented output.
    // console.log(str); // Logs output to dev tools console.
    // alert(str); // Displays output using window.alert()

  });




angular
  .module('info.module')
  .controller('InfoFavCtrl', function ($scope, $localStorage, $rootScope, $stateParams, $ionicSlideBoxDelegate, ShopService) {
    var vm = this;
    $scope.endOfRLatestItems = false;
    $scope.loadingLatest = false;

    // sync form input to localstorage
    $localStorage.home = $localStorage.home || {};
    $scope.data = $localStorage.home;
    $scope.data.latestPage = 1;

    if (!$scope.data.slides)
      $scope.data.slides = [{ image: "app/shop/images/introcompany.png" }];

    $scope.refreshUI = function () {
      $scope.data.latestPage = 1;
      $scope.endOfRLatestItems = false;
      $scope.loadLatest(true);
      $scope.loadFeatured();
      //$scope.loadCategories();
      $scope.loadBanners();
    }

    $scope.loadBanners = function () {
      ShopService.GetBanners().then(function (data) {
        $scope.data.slides = data.main_banners;
        $scope.data.offers = data.offer_banner;
        $ionicSlideBoxDelegate.update();
      });
    }

    $scope.loadFeatured = function () {
      ShopService.GetFeaturedProducts().then(function (data) {
        $scope.data.featuredItems = data.products;
        $ionicSlideBoxDelegate.update();
      });
    }

    $scope.loadLatest = function (refresh) {
      if ($scope.loadingLatest) {
        return;
      }

      $scope.loadingLatest = true;
      $scope.data.latestItems = $scope.data.latestItems || [];

      ShopService.GetLatestProducts($scope.data.latestPage).then(function (data) {
        if (refresh) {
          $scope.data.latestItems = data.products;
          $scope.data.latestPage = 1;
        } else {
          if ($scope.data.latestPage == 1) {
            $scope.data.latestItems = [];
          }

          $scope.data.latestItems = $scope.data.latestItems.concat(data.products);
          $scope.data.latestPage++;
        }
        if (data.products && data.products.length < 1)
          $scope.endOfRLatestItems = true;
        $scope.loadingLatest = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.$broadcast('scroll.refreshComplete');
      }, function (data) {
        $scope.loadingLatest = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    $scope.loadNextRecentPage = function () {
      if (!$scope.endOfRLatestItems) {
        $scope.loadLatest();
      } else {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }
    }

    $scope.$on('$ionicView.enter', function () {
      $ionicSlideBoxDelegate.update();
    });

    $scope.$on('i2csmobile.shop.refresh', function () {
      $scope.refreshUI();
    });

    $scope.loadFeatured();
    $scope.loadBanners();


  });
