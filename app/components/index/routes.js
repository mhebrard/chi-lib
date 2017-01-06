import angular from 'angular';

import chartsRoutes from '../charts/charts-index/routes';
import chartsComponent from '../charts/charts-index/component';

import projectsRoutes from '../projects/projects-index/routes';
import projectsComponent from '../projects/projects-index/component';

routeConfig.$inject = ['$routeProvider'];
function routeConfig($routeProvider) {
  $routeProvider
    .when('/charts', {
      template: '<charts data-package="$resolve.dataPackage"></charts>',
      datapackageUrl: 'components/charts/charts-index/datapackage.json'
    })
    .when('/projects', {
      template: '<projects data-package="$resolve.dataPackage"></projects>',
      datapackageUrl: 'components/projects/projects-index/datapackage.json'
    })
    .otherwise({redirectTo: '/'});
}

export default angular
  .module('index-routes', ['projectX.dataService', chartsRoutes.name, projectsRoutes.name])
  .component('charts', chartsComponent)
  .component('projects', projectsComponent)
  .config(routeConfig);
