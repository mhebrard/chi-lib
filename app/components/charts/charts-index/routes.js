import angular from 'angular';

import chartsComponent from './component';
import treemapComponent from '../treemap/component';
import sunburstComponent from '../sunburst/component';
import dendrogramComponent from '../dendrogram/component';
import radialComponent from '../radial/component';
import clonalComponent from '../clonal/component';
import violinComponent from '../violin/component';
import pieComponent from '../pie/component';

routeConfig.$inject = ['$routeProvider'];
function routeConfig($routeProvider) {
  $routeProvider
    .when('/charts', {
      template: '<charts data-package="$resolve.dataPackage"></charts>',
      datapackageUrl: 'components/charts/charts-index/datapackage.json'
    })
    .when('/charts/treemap', {
      template: '<treemap data-package="$resolve.dataPackage"></treemap>',
      datapackageUrl: 'components/charts/treemap/datapackage.json'
    })
    .when('/charts/sunburst', {
      template: '<sunburst data-package="$resolve.dataPackage"></sunburst>',
      datapackageUrl: 'components/charts/sunburst/datapackage.json'
    })
    .when('/charts/dendrogram', {
      template: '<dendrogram data-package="$resolve.dataPackage"></dendrogram>',
      datapackageUrl: 'components/charts/dendrogram/datapackage.json'
    })
    .when('/charts/radial', {
      template: '<radial data-package="$resolve.dataPackage"></radial>',
      datapackageUrl: 'components/charts/radial/datapackage.json'
    })
    .when('/charts/clonal', {
      template: '<clonal data-package="$resolve.dataPackage"></clonal>',
      datapackageUrl: 'components/charts/clonal/datapackage.json'
    })
    .when('/charts/violin', {
      template: '<violin data-package="$resolve.dataPackage"></violin>',
      datapackageUrl: 'components/charts/violin/datapackage.json'
    })
    .when('/charts/pie', {
      template: '<pie data-package="$resolve.dataPackage"></pie>',
      datapackageUrl: 'components/charts/pie/datapackage.json'
    })
    .otherwise({redirectTo: '/'});
}

export default angular
  .module('charts-index', ['projectX.dataService'])
  .component('charts-idx', chartsComponent)
  .component('treemap', treemapComponent)
  .component('sunburst', sunburstComponent)
  .component('dendrogram', dendrogramComponent)
  .component('radial', radialComponent)
  .component('clonal', clonalComponent)
  .component('violin', violinComponent)
  .component('pie', pieComponent)
  .config(routeConfig);
