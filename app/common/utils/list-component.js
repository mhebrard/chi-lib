import template from './list-index.html!text';
import 'common/styles/index.css!';

controller.$inject = ['dataService'];
function controller(dataService) {
  this.dataPackage.resources.forEach(resource => {
    dataService.normalizePackage(resource.url, resource.data);
  });
}

export default {
  controller,
  template,
  bindings: {
    dataPackage: '<package'
  }
};
