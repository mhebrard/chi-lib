import angular from 'angular';

import projectsComponent from './component';
import mutbyposComponent from '../mutbypos/component';
import taxonomyComponent from '../taxonomy/component';

routeConfig.$inject = ['$routeProvider'];
function routeConfig($routeProvider) {
  $routeProvider
    .when('/projects', {
      template: '<projects data-package="$resolve.dataPackage"></projects>',
      datapackageUrl: 'components/projects/projects-index/datapackage.json'
    })
    .when('/projects/mutbypos', {
      template: '<mutbypos data-package="$resolve.dataPackage"></mutbypos>',
      datapackageUrl: 'components/projects/mutbypos/datapackage.json'
    })
    .when('/projects/taxonomy', {
      template: '<taxonomy data-package="$resolve.dataPackage"></taxonomy>',
      datapackageUrl: 'components/projects/taxonomy/datapackage.json'
    })
    .otherwise({redirectTo: '/'});
}

export default angular
  .module('projects-index', ['projectX.dataService'])
  .component('projects-idx', projectsComponent)
  .component('mutbypos', mutbyposComponent)
  .component('taxonomy', taxonomyComponent)
  .config(routeConfig);
