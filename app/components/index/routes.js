import angular from 'angular';

import chartsRoutes from '../charts/charts-index/routes';
import chartsComponent from '../charts/charts-index/component';

import ickRoutes from '../iclikval/iclikval-index/routes';
import ickComponent from '../iclikval/iclikval-index/component';

import genomicRoutes from '../genomic/genomic-index/routes';
import genomicComponent from '../genomic/genomic-index/component';

routeConfig.$inject = ['$routeProvider'];
function routeConfig($routeProvider) {
  $routeProvider
    .when('/charts', {
      template: '<charts data-package="$resolve.dataPackage"></charts>',
      datapackageUrl: 'components/charts/charts-index/datapackage.json'
    })
    .when('/ick', {
      template: '<ick data-package="$resolve.dataPackage"></ick>',
      datapackageUrl: 'components/iclikval/iclikval-index/datapackage.json'
    })
    .when('/genomic', {
      template: '<genomic data-package="$resolve.dataPackage"></genomic>',
      datapackageUrl: 'components/genomic/genomic-index/datapackage.json'
    })
    .otherwise({redirectTo: '/'});
}

export default angular
  .module('index-routes', ['projectX.dataService', chartsRoutes.name, ickRoutes.name, genomicRoutes.name])
  .component('charts', chartsComponent)
  .component('ick', ickComponent)
  .component('genomic', genomicComponent)
  .config(routeConfig);
