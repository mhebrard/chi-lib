import angular from 'angular';

import clonalComponent from '../clonal/component';

routeConfig.$inject = ['$routeProvider'];
function routeConfig($routeProvider) {
  $routeProvider
    .when('/charts/clonal', {
      template: '<clonal data-package="$resolve.dataPackage"></clonal>',
      datapackageUrl: 'components/charts/clonal/datapackage.json'
    })
    .otherwise({redirectTo: '/charts'});
}

export default angular
  .module('charts-index', ['projectX.dataService'])
  .component('clonal', clonalComponent)
  .config(routeConfig);
