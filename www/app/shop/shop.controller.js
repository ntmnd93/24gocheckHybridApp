'use strict';

/**
 * @ngdoc controller
 * @name shop.module.controller:ShopHomeCtrl
 * @requires $scope
 * @requires $localStorage
 * @requires $rootScope
 * @requires $stateParams
 * @requires $ionicSlideBoxDelegate
 * @requires ShopService
 * @description
 * Home page of the Shop module. This controller contains methods to show banners and product catalog in
 * the home page.
 */
angular
  .module('shop.module')
  .controller('ShopHomeCtrl', function ($scope, $localStorage, $rootScope, $stateParams, $ionicSlideBoxDelegate, ShopService) {
    var vm = this;
    $scope.endOfRLatestItems = false;
    $scope.loadingLatest = false;

    // sync form input to localstorage
    $localStorage.home = $localStorage.home || {};
    $scope.data = $localStorage.home;
    $scope.data.latestPage = 1;

    if (!$scope.data.slides)
      $scope.data.slides = [{image: "app/shop/images/logo.png"}];

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
        // $scope.data.slides = data.main_banners;

        // $scope.data = {};
        // $scope.data.slides = [
        //   {
        //     "link": "http://24gocheck.com/",
        //     "image": "http://24gocheck.com/image/catalog/24gocheck%20Icons/pic1.jpg"
        //   }
        // ];
        $scope.data.slides = [
          {
            "link": "http://24gocheck.com/",
            "image": "http://24gocheck.com/image/cache/catalog/Banner/ip8x-685x505.png"
          },
          {
            "link": "http://24gocheck.com/",
            "image": "http://24gocheck.com/image/cache/catalog/Banner/Hoa%20Qu%E1%BA%A3-685x505.png"
          },
          {
            "link": "http://24gocheck.com/",
            "image": "http://24gocheck.com/image/cache/catalog/Banner/thoi%20trang-685x505.png"
          }
        ];
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


/**
 * @ngdoc controller
 * @name shop.module.controller:ShopItemCtrl
 * @requires $scope
 * @requires $timeout
 * @requires $localStorage
 * @requires $rootScope
 * @requires $state
 * @requires $stateParams
 * @requires $ionicPopup
 * @requires $ionicLoading
 * @requires $ionicTabsDelegate
 * @requires $ionicSlideBoxDelegate
 * @requires locale
 * @requires ShopService
 * @requires CartService
 * @requires WEBSITE
 * @description
 * Shows details of a selected item. Renders all attributes and options in the view.
 * Contains a `Buy` button which interacts with the API and add to product cart.
 */
angular
  .module('shop.module')
  .controller('ShopItemCtrl', function ($scope, $timeout, $localStorage, $rootScope, $state, $cordovaGeolocation, $stateParams, $ionicPopup, $ionicLoading, $ionicTabsDelegate, $ionicSlideBoxDelegate, $compile, locale, ShopService, CartService, WEBSITE) {
 
      function initialize() {
        var myLatlng = new google.maps.LatLng( $scope.item.latitude, $scope.item.longitude);
         
        var mapOptions = {
          center: myLatlng,
          zoom: 17,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"),
            mapOptions);
        
        //Marker + infowindow + angularjs compiled ng-click
        var contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
        var compiled = $compile(contentString)($scope);

        var infowindow = new google.maps.InfoWindow({
          content: compiled[0]
        });

        var marker = new google.maps.Marker({
          position: myLatlng,
          map: map,
          title: 'Uluru (Ayers Rock)'
        });

        google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(map,marker);
        });

        $scope.map = map;
      }
      google.maps.event.addDomListener(window, 'load', initialize);

       $scope.navigate = function() {
      launchnavigator.navigate([ $scope.item.latitude, $scope.item.longitude]);
    }
      
      $scope.centerOnMe = function() {
        if(!$scope.map) {
          return;
        }

        $scope.loading = $ionicLoading.show({
          content: 'Getting current location...',
          showBackdrop: false
        });

        navigator.geolocation.getCurrentPosition(function(pos) {
          var mylatlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
          var myitemlatlng = new google.maps.LatLng($scope.item.latitude, $scope.item.longitude);
          $scope.calcRoute(mylatlng, myitemlatlng);
          $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
           launchnavigator.navigate([ $scope.item.latitude, $scope.item.longitude], {
            start: [pos.coords.latitude, pos.coords.longitude]
        });
          // $scope.loading.hide();
        }, function(error) {
          alert('Unable to get location: ' + error.message);
        });
      };

      var directionsDisplay = new google.maps.DirectionsRenderer();
      var directionsService = new google.maps.DirectionsService();

      $scope.calcRoute = function(start, end) {
        //var start = 
        //var end = new google.maps.LatLng(37.441883, -122.143019);
        var request = {
          origin: start,
          destination: end,
          travelMode: google.maps.TravelMode.DRIVING
        };
        directionsService.route(request, function(response, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            directionsDisplay.setMap($scope.map);
          } else {
            alert("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
          }
        });
      };
      
      $scope.clickTest = function() {
        alert('Example of infowindow with ng-click')
      };


    var vm = this;
    $scope.shop = {};
    $scope.cart = {};
    $scope.cart.quantity = 1;
    $scope.id = $stateParams.id;

     

    $scope.$on('$ionicView.enter', function () {
      $timeout(function () {
        $ionicTabsDelegate.$getByHandle('product-tabs').select(0);
      }, 0)
    });

    $localStorage.item_cache = $localStorage.item_cache || {};
    $scope.item_cache = $localStorage.item_cache;

    $ionicLoading.show();

    // check cache for the item. if item is available, immediately assign it
    if ($scope.item_cache.items && $scope.item_cache.items[$stateParams.id])
      $scope.item = $scope.item_cache.items[$stateParams.id];

    if (window.Connection) {
      if (navigator.connection.type == Connection.NONE) {
        if (!$scope.item) {
          alert(locale.getString('shop.error_not_connected_cache_failed'));
        } else {
          alert(locale.getString('shop.error_not_connected_cache_success'));
        }

        $ionicLoading.hide();
      }
    }

          
          ShopService.GetProduct($stateParams.id).then(function (data) {
      $scope.item = {};

      $scope.item.name = data.heading_title;
      $scope.item.product_id = data.product_id;
      $scope.item.text_stock = data.text_stock;
      $scope.item.text_model = data.text_model;
      $scope.item.attribure_groups = data.attribute_groups;
      $scope.item.shop_name = data.shop_name;
           $scope.item.price = data.price;
      $scope.item.firstname = data.separate_u_name;
      $scope.item.telephone = data.separate_u_phone;
      $scope.item.location = data.location; 
       $scope.item.latitude = data.latitude;
      $scope.item.longitude = data.longitude;
      $scope.item.special = data.special;
      $scope.item.description = data.description;
      $scope.item.off = data.off;
      $scope.item.mobile_special = data.mobile_special;
      $scope.item.stock = data.stock;
      $scope.item.model = data.model;
      $scope.item.options = data.options;
      $scope.item.minimum = data.minimum || 1;
      $scope.item.review_status = data.review_status;
      $scope.item.review_guest = data.review_guest;
      $scope.item.reviews = data.reviews;
      $scope.item.rating = data.rating;
      $scope.item.entry_name = data.entry_name;
      $scope.item.entry_review = data.entry_review;

      $scope.item.related = data.products;


      $scope.item.thumb = data.thumb;

      $scope.item.image = data.image;

      $scope.item.images = data.images;


      if (!$scope.item_cache.items)
        $scope.item_cache.items = {};
      $scope.item_cache.items[$stateParams.id] = $scope.item;

      $ionicSlideBoxDelegate.update();
      initialize();
      $timeout(function () {
        $ionicLoading.hide();
      }, 500);
    });

    $scope.openRingSizeGuide = function () {

      $ionicPopup.alert({
        title: "Ring Size Guide",
        templateUrl: 'templates/popups/size_guide.html',
        scope: $scope
      });

      ShopService.GetRingSizeImage().then(function (data) {
        if (data && data.banners && data.banners[0])
          $scope.item_cache.ringSizeUrl = data.banners[0].image;
      });
    }

    $scope.buyNow = function () {
      // add to cart and checkout
      if ($scope.shop.shopItemForm.$invalid) {
        $ionicPopup.alert({
          title: locale.getString('shop.select_following_options'),
          templateUrl: "app/shop/templates/popups/missing-props.html",
          scope: $scope,
          buttons: [
            {
              text: 'OK',
              type: 'button-positive'
            }
          ]
        });
      } else {
        $ionicLoading.show();

        CartService.AddToCart($stateParams.id, $scope.cart.quantity, $scope.cart.options).then(function (data) {
          $rootScope.cartItemCount = $rootScope.cartItemCount || 0;
          $rootScope.cartItemCount += parseInt($scope.cart.quantity);
          $ionicTabsDelegate.select(2);
          $state.go('app.menu.cart.home', {}, {reload: true});
          $ionicLoading.hide();
        }, function (error) {
          alert("Error. Can't add to the cart");
          $ionicLoading.hide();
        });
      }
    }

    $scope.addToCart = function () {
      if ($scope.shop.shopItemForm.$invalid) {
        $ionicPopup.alert({
          title: 'Oops!',
          templateUrl: "app/shop/templates/popups/missing-props.html",
          scope: $scope,
          buttons: [
            {
              text: 'OK',
              type: 'button-positive'
            }
          ]
        });
      } else {

        // show alert regardless Add to cart confirmation
        var alertPopup = $ionicPopup.alert({
          title: locale.getString('shop.added_to_cart'),
          cssClass: 'desc-popup',
          template: "{{ 'shop.item_added_to_cart' | i18n}}",
          buttons: [
            {text: locale.getString('shop.show_more')},
            {
              text: locale.getString('shop.go_to_cart'),
              type: 'button-positive',
              onTap: function (e) {
                $ionicTabsDelegate.select(2);
                $state.go('app.menu.cart.home', {}, {reload: true});
              }
            }
          ]
        });

        CartService.AddToCart($stateParams.id, $scope.cart.quantity, $scope.cart.options).then(function (data) {
          $rootScope.cartItemCount = $rootScope.cartItemCount || 0;
          $rootScope.cartItemCount += parseInt($scope.cart.quantity);
        }, function (error) {
          alertPopup.close();
          alert(locale.getString('shop.error'));
        });
      }
    }

    $scope.share = function () {
      var link = WEBSITE + "/index.php?route=product/product&product_id=" + $stateParams.id;
      window.plugins.socialsharing.share($scope.name, $scope.name, null, link);
    }

    $scope.range = function (min, max, step) {
      step = step || 1;
      min = min || 1;
      max = max || 10;
      min = parseInt(min);
      var input = [];
      for (var i = min; i <= max; i += step) {
        input.push(i);
      }

      return input;
    };

    $scope.selectableOptions = function (item) {
      return item.type === 'radio' || item.type === 'select';
    }

    $scope.multipleOptions = function (item) {
      return item.type === 'checkbox';
    }

    $scope.textOptions = function (item) {
      return item.type === 'text' || item.type === 'date' || item.type === 'time';
    }

    $scope.fileOptions = function (item) {
      return item.type === 'file';
    }

    $scope.datetimeOptions = function (item) {
      return item.type === 'datetime';
    }

    $scope.textareaOptions = function (item) {
      return item.type === 'textarea';
    }
  });


/**
 * @ngdoc controller
 * @name shop.module.controller:ShopCategoryCtrl
 * @requires $scope
 * @requires $rootScope
 * @requires $stateParams
 * @requires $state
 * @requires ShopService
 * @description
 * Lists products of a selected category.
 */
angular
  .module('shop.module')
  .controller('ShopCategoryCtrl', function ($scope, $rootScope, $stateParams, $state, ShopService) {
    var vm = this;

    $scope.id = $stateParams.id;

    if (!$stateParams.id) {
      $state.go('app.menu.shop.home');
    }

    $scope.endOfItems = false;
    $scope.loadingItems = false;
    $scope.page = 1;

    $scope.refreshUI = function () {
      $scope.endOfItems = false;
      $scope.items = [];
      $scope.page = 1;
      $scope.loadItems();
    }

    $scope.loadItems = function () {
      if ($scope.loadingItems) {
        return;
      }

      $scope.loadingItems = true;
      $scope.items = $scope.items || [];

      ShopService.GetCategoryProducts($stateParams.id, $scope.page).then(function (data) {
        $scope.items = $scope.items.concat(data.products);
        $scope.category_name = data.heading_title;
        $scope.text_empty = data.text_empty;
        $scope.page++;
        if (data && data.products.length < 1)
          $scope.endOfItems = true;
        $scope.loadingItems = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.$broadcast('scroll.refreshComplete');
      }, function (data) {
        $scope.loadingItems = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    $scope.loadNextPage = function () {
      if (!$scope.endOfItems) {
        $scope.loadItems();
      } else {
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.$broadcast('scroll.refreshComplete');
      }
    }
  });


/**
 * @ngdoc controller
 * @name shop.module.controller:ShopSearchCtrl
 * @requires $scope
 * @requires $rootScope
 * @requires $ionicScrollDelegate
 * @requires $stateParams
 * @requires ShopService
 * @description
 * Search page shows a search input box and filters the product catalog for the customer entered
 * keywords.
 */
angular
  .module('shop.module')
  .controller('ShopSearchCtrl', function ($scope, $localStorage, $rootScope, $ionicScrollDelegate, $stateParams, ShopService, CartService) {
    $scope.selectedCat = "1";
    $scope.selectedZone = "3776";
    $scope.page = 1;
    $scope.cates = [];
    $scope.endOfItems = true;
    $scope.loadingItems = false;
    $scope.picked = '';


    $scope.items = [];
    ShopService.GetCategories().then(function (data) {

      $scope.cates = data.categories;


      $ionicLoading.hide();
    }, function (data) {
      $ionicLoading.hide();
    });

    //==================================================================================================================

    $rootScope.checking = false;


    $scope.pickedOption = function (aString) {
      $scope.picked = aString;
    }
    //==================================================================================================================

    $scope.changeCategory = function (selectedCat) {
      $scope.selectedCat = selectedCat;
      if ($scope.loadingItems) {
        return;
      }

      $scope.loadingItems = true;
      $scope.items = $scope.items || [];

      console.log('Shika Page ' + $scope.page);

      console.log('Selected Cate' + selectedCat);
      ShopService.SearchProductsByCategoryId(selectedCat, $scope.page).then(function (data) {
        $scope.items = $scope.items.concat(data.products);
        $scope.text_empty = data.text_empty;

        $ionicScrollDelegate.resize();
        $scope.page++;
        if (data.products.length < 1)
          $scope.endOfItems = true;
        else
          $scope.endOfItems = false;
        $scope.loadingItems = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }, function (data) {
        $scope.loadingItems = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });

    }
    $scope.loadNextPage = function () {
      if (!$scope.endOfItems) {
        if($scope.picked == 'category'){
          $scope.changeCategory($scope.selectedCat);
        }else if ($scope.picked == 'city'){
          $scope.changeZone($scope.selectedZone);
        }
      } else {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }
    }

    $scope.changeZone = function (selectedZone) {

      $scope.selectedZone = selectedZone;
      if ($scope.loadingItems) {
        return;
      }

      $scope.loadingItems = true;
      $scope.items = $scope.items || [];


      console.log('Selected Zone' + selectedZone);


      ShopService.SearchProductsByZoneId(selectedZone, $scope.page).then(function (data) {
        $scope.items = $scope.items.concat(data.products);
        $scope.text_empty = data.text_empty;

        $ionicScrollDelegate.resize();
        $scope.page++;
        if (data.products.length < 1)
          $scope.endOfItems = true;
        else
          $scope.endOfItems = false;
        $scope.loadingItems = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }, function (data) {
        $scope.loadingItems = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    }




    $scope.resetOption = function () {
      $scope.items = [];
      $scope.page = 1;
      $scope.endOfItems = true;
      $scope.loadingItems = false;
      $scope.selectedCat = "1";
      $scope.selectedZone = "1";
    }



  });

angular
  .module('shop.module')
  .controller('FilterCtrl', function ($scope, $rootScope, $ionicScrollDelegate, $stateParams, ShopService) {
    $scope.filter = 'Xu hướng';

  });

angular
  .module('shop.module')
  .controller('ShopPromotionCtrl', function ($scope, $localStorage, $rootScope, $stateParams, $ionicSlideBoxDelegate, ShopService) {

    var vm = this;
    $scope.endOfRLatestItems = false;
    $scope.loadingLatest = false;

    // sync form input to localstorage
    $localStorage.home = $localStorage.home || {};
    $scope.data = $localStorage.home;
    $scope.data.latestPage = 1;

    if (!$scope.data.slides)
      $scope.data.slides = [{image: "app/shop/images/introcompany.png"}];

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

// <<<<<<< HEAD
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
// =======
//     ShopService.GetLatestProducts($scope.data.latestPage).then(function (data) {
      
//        $scope.item = {};
//  $scope.item.firstname = data.separate_u_name;

//       if (refresh) {
//         $scope.data.latestItems = data.products;
//         $scope.data.latestPage = 1;
//       } else {
//         if ($scope.data.latestPage == 1) {
//           $scope.data.latestItems = [];
// >>>>>>> fix map
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


    // ShopService.GetProduct($stateParams.id).then(function (data) {
    //   $scope.item = {};
    //
    //   $scope.item.name = data.heading_title;
    //   $scope.item.product_id = data.product_id;
    //   $scope.item.text_stock = data.text_stock;
    //   $scope.item.text_model = data.text_model;
    //   $scope.item.attribure_groups = data.attribute_groups;
    //
    //   $scope.item.price = data.price;
    //   $scope.item.special = data.special;
    //   $scope.item.description = data.description;
    //   $scope.item.off = data.off;
    //   $scope.item.mobile_special = data.mobile_special;
    //   $scope.item.stock = data.stock;
    //   $scope.item.model = data.model;
    //   $scope.item.options = data.options;
    //   $scope.item.minimum = data.minimum || 1;
    //
    //   $scope.item.review_status = data.review_status;
    //   $scope.item.review_guest = data.review_guest;
    //   $scope.item.reviews = data.reviews;
    //   $scope.item.rating = data.rating;
    //   $scope.item.entry_name = data.entry_name;
    //   $scope.item.entry_review = data.entry_review;
    //
    //   $scope.item.related = data.products;
    //
    //   $scope.item.images = data.images;
    //
    //   if (!$scope.item_cache.items)
    //     $scope.item_cache.items = {};
    //   $scope.item_cache.items[$stateParams.id] = $scope.item;
    //
    //   $ionicSlideBoxDelegate.update();
    //   $timeout(function () {
    //     $ionicLoading.hide();
    //   }, 500);
    // });

  });


angular
  .module('shop.module')
  .controller('OffersTopCtrl', function ($scope, $localStorage, $rootScope, $stateParams, $ionicSlideBoxDelegate, ShopService) {
    // $scope.navTitle='<img class="title-image" src="images/24gocheck.png" />';
    // $scope.shop = {};
    // $scope.shop.shopName = "Công ty AlVietJS";
    // $scope.shop.location = " 169 Nguyễn Ngọc Vũ, P.Trung Hòa";
    // $scope.shop.price = "1000000000 đ";
    // $scope.shop.phone = "123456";
    // $scope.shop.rating = 3;
    // $scope.shop.likes = "85";


    var vm = this;
    $scope.endOfRLatestItems = false;
    $scope.loadingLatest = false;

    // sync form input to localstorage
    $localStorage.home = $localStorage.home || {};
    $scope.data = $localStorage.home;
    $scope.data.latestPage = 1;

    if (!$scope.data.slides)
      $scope.data.slides = [{image: "app/shop/images/introcompany.png"}];

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


angular
  .module('shop.module')
  .controller('OffersTrendCtrl', function ($scope, $localStorage, $rootScope, $stateParams, $ionicSlideBoxDelegate, ShopService) {
    // $scope.navTitle='<img class="title-image" src="images/24gocheck.png" />';
    $scope.navTitle = '<img class="title-image" src="images/24gocheck.png" />';
    // $scope.shop = {};
    // $scope.shop.shopName = "Công ty AlVietJS";
    // $scope.shop.location = " 169 Nguyễn Ngọc Vũ, P.Trung Hòa";
    // $scope.shop.price = "1000000000 đ";
    // $scope.shop.phone = "123456";
    // $scope.shop.rating = 3;
    // $scope.shop.likes = "85";


    var vm = this;
    $scope.endOfRLatestItems = false;
    $scope.loadingLatest = false;

    // sync form input to localstorage
    $localStorage.home = $localStorage.home || {};
    $scope.data = $localStorage.home;
    $scope.data.latestPage = 1;

    if (!$scope.data.slides)
      $scope.data.slides = [{image: "app/shop/images/introcompany.png"}];

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




