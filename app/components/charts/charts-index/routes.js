import angular from 'angular';

import chartsComponent from './component';
import clonalComponent from '../clonal/component';

routeConfig.$inject = ['$routeProvider'];
function routeConfig($routeProvider) {
  $routeProvider
    .when('/charts', {
      template: '<charts data-package="$resolve.dataPackage"></charts>',
      datapackageUrl: 'components/charts/charts-index/datapackage.json'
    })
    .when('/charts/clonal', {
      template: '<clonal data-package="$resolve.dataPackage"></clonal>',
      datapackageUrl: 'components/charts/clonal/datapackage.json'
    })
    .otherwise({redirectTo: '/charts'});
}

export default angular
  .module('charts-index', ['projectX.dataService'])
  .component('charts-idx', chartsComponent)
  .component('clonal', clonalComponent)
  .config(routeConfig);
