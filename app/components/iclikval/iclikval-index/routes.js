import angular from 'angular';

import ickComponent from './component';

routeConfig.$inject = ['$routeProvider'];
function routeConfig($routeProvider) {
  $routeProvider
    .when('/ick', {
      template: '<ick data-package="$resolve.dataPackage"></ick>',
      datapackageUrl: 'components/iclikval/iclikval-index/datapackage.json'
    })
    .otherwise({redirectTo: '/'});
}

export default angular
  .module('ick-index', ['projectX.dataService'])
  .component('ick-idx', ickComponent)
  .config(routeConfig);
