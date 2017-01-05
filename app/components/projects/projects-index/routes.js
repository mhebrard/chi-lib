import angular from 'angular';

import phylogenyComponent from '../clonal/component';

routeConfig.$inject = ['$routeProvider'];
function routeConfig($routeProvider) {
  $routeProvider
    .when('/phylogeny', {
      template: '<phylogeny data-package="$resolve.dataPackage"></phylogeny>',
      datapackageUrl: 'components/projects/phylogeny/datapackage.json'
    })
    .otherwise({redirectTo: '/'});
}

export default angular
  .module('index', ['projectX.dataService'])
  .component('phylogeny', phylogenyComponent)
  .config(routeConfig);
