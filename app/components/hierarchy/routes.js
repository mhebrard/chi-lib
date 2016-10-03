import angular from 'angular';

import indexComponent from "./component";
import treemapComponent from '../treemap/component';
import sunburstComponent from '../sunburst/component';
import dendrogramComponent from '../dendrogram/component';
import radialComponent from '../radial/component';

var folder = 'hierarchy';

routeConfig.$inject = ['$routeProvider'];
function routeConfig ($routeProvider) {
  $routeProvider
    .when('/'+folder, {
      template: '<'+folder+' data-package="$resolve.dataPackage"></'+folder+'>',
      datapackageUrl: 'components/'+folder+'/datapackage.json'
    })
    .when('/'+folder+'/treemap', {
      template: '<treemap data-package="$resolve.dataPackage"></treemap>',
      datapackageUrl: 'components/treemap/datapackage.json'
    })
    .when('/'+folder+'/sunburst', {
      template: '<sunburst data-package="$resolve.dataPackage"></sunburst>',
      datapackageUrl: 'components/sunburst/datapackage.json'
    })
    .when('/'+folder+'/dendrogram', {
      template: '<dendrogram data-package="$resolve.dataPackage"></dendrogram>',
      datapackageUrl: 'components/dendrogram/datapackage.json'
    })
    .when('/'+folder+'/radial', {
      template: '<radial data-package="$resolve.dataPackage"></radial>',
      datapackageUrl: 'components/radial/datapackage.json'
    })
    .otherwise({redirectTo: '/'});
}

export default angular
  .module(folder, ['projectX.dataService'])
  .component(folder, indexComponent)
  .component('treemap', treemapComponent)
  .component('sunburst', sunburstComponent)
  .component('dendrogram', dendrogramComponent)
  .component('radial', radialComponent)
  .config(routeConfig);
