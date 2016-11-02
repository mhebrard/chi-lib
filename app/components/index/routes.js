import angular from 'angular';

import treemapComponent from '../treemap/component';
import sunburstComponent from '../sunburst/component';
import dendrogramComponent from '../dendrogram/component';
import radialComponent from '../radial/component';
import clonalComponent from '../clonal/component';
import violinComponent from '../violin/component';

routeConfig.$inject = ['$routeProvider'];
function routeConfig($routeProvider) {
  $routeProvider
    .when('/treemap', {
      template: '<treemap data-package="$resolve.dataPackage"></treemap>',
      datapackageUrl: 'components/treemap/datapackage.json'
    })
    .when('/sunburst', {
      template: '<sunburst data-package="$resolve.dataPackage"></sunburst>',
      datapackageUrl: 'components/sunburst/datapackage.json'
    })
    .when('/dendrogram', {
      template: '<dendrogram data-package="$resolve.dataPackage"></dendrogram>',
      datapackageUrl: 'components/dendrogram/datapackage.json'
    })
    .when('/radial', {
      template: '<radial data-package="$resolve.dataPackage"></radial>',
      datapackageUrl: 'components/radial/datapackage.json'
    })
    .when('/clonal', {
      template: '<clonal data-package="$resolve.dataPackage"></clonal>',
      datapackageUrl: 'components/clonal/datapackage.json'
    })
    .when('/violin', {
      template: '<violin data-package="$resolve.dataPackage"></violin>',
      datapackageUrl: 'components/violin/datapackage.json'
    })
    .otherwise({redirectTo: '/'});
}

export default angular
  .module('index', ['projectX.dataService'])
  .component('treemap', treemapComponent)
  .component('sunburst', sunburstComponent)
  .component('dendrogram', dendrogramComponent)
  .component('radial', radialComponent)
  .component('clonal', clonalComponent)
  .component('violin', violinComponent)
  .config(routeConfig);
