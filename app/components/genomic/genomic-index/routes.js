import angular from 'angular';

import genomicComponent from './component';
import mutbyposComponent from '../mutbypos/component';
import taxonomyComponent from '../taxonomy/component';

routeConfig.$inject = ['$routeProvider'];
function routeConfig($routeProvider) {
  $routeProvider
    .when('/genomic', {
      template: '<genomic data-package="$resolve.dataPackage"></genomic>',
      datapackageUrl: 'components/genomic/genomic-index/datapackage.json'
    })
    .when('/genomic/mutbypos', {
      template: '<mutbypos data-package="$resolve.dataPackage"></mutbypos>',
      datapackageUrl: 'components/genomic/mutbypos/datapackage.json'
    })
    .when('/genomic/taxonomy', {
      template: '<taxonomy data-package="$resolve.dataPackage"></taxonomy>',
      datapackageUrl: 'components/genomic/taxonomy/datapackage.json'
    })
    .otherwise({redirectTo: '/'});
}

export default angular
  .module('genomic-index', ['projectX.dataService'])
  .component('genomic-idx', genomicComponent)
  .component('mutbypos', mutbyposComponent)
  .component('taxonomy', taxonomyComponent)
  .config(routeConfig);
