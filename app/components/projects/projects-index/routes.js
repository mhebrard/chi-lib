import angular from 'angular';

import taxonomyComponent from '../taxonomy/component';

routeConfig.$inject = ['$routeProvider'];
function routeConfig($routeProvider) {
  $routeProvider
    .when('/taxonomy', {
      template: '<taxonomy data-package="$resolve.dataPackage"></taxonomy>',
      datapackageUrl: 'components/projects/taxonomy/datapackage.json'
    })
    .otherwise({redirectTo: '/'});
}

export default angular
  .module('index', ['projectX.dataService'])
  .component('taxonomy', taxonomyComponent)
  .config(routeConfig);
