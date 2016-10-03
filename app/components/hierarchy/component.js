import 'common/styles/index.css!';
import template from './index.html!text';

controller.$inject = ['dataService'];
function controller (dataService) {
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
