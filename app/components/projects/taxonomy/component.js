import Treemap from '../../../common/charts/treemap';
import completeTree from './complete-tree';

controller.$inject = ['$log', 'dataService'];
function controller($log, dataService) {
  const $ctrl = this;

  console.log('data', $ctrl.dataPackage.resources[0].data);
  // complete tree
  const tree = completeTree($ctrl.dataPackage.resources[0].data);
  console.log('tree', tree);
  // add treemap
  const paramTreemap = {
    div: 'charts',
    id: 'treemap',
    dispatch,
    title: `Treemap of ${$ctrl.dataPackage.resources[0].name}`
    // titleSize: 20,
    // width: 700,
    // height: 5000
    // shape: 'rake' // comb, curve, rake
  };
  const treemap = new Treemap(paramTreemap);

  return Object.assign($ctrl, {
    editorOptions: {
      data: $ctrl.dataPackage,
      onChange: update
    },
    $onInit() {
      draw();
    }
  });

  function draw() {
    treemap.init();
    update();
  }

  function update() {
    treemap.data(tree);
    treemap.update();
  }

  // dispatch all action to all views
  function dispatch(action) {
    treemap.consumer(action);
  }
}

export default {
  controller,
  templateUrl: 'components/projects/taxonomy/taxonomy.html',
  bindings: {
    dataPackage: '<package'
  }
};
