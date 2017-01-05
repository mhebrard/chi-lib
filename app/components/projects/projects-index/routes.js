import angular from 'angular';

import clonalComponent from '../clonal/component';

routeConfig.$inject = ['$routeProvider'];
function routeConfig($routeProvider) {
  $routeProvider
    .when('/clonal', {
      template: '<clonal data-package="$resolve.dataPackage"></clonal>',
      datapackageUrl: 'components/clonal/datapackage.json'
    })
    .otherwise({redirectTo: '/'});
}

export default angular
  .module('index', ['projectX.dataService'])
  .component('clonal', clonalComponent)
  .config(routeConfig);
