import Treemap from '../../../common/charts/treemap';
import Sunburst from '../../../common/charts/sunburst';
import Clonal from '../../../common/charts/clonal';
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
    title: `Treemap of ${$ctrl.dataPackage.resources[0].name}`,
    width: 700,
    height: 500
    // shape: 'rake' // comb, curve, rake
  };
  const treemap = new Treemap(paramTreemap);

  // add sunburst
  const paramSunburst = {
    div: 'charts',
    id: 'sunburst',
    dispatch,
    title: `Sunburst of ${$ctrl.dataPackage.resources[0].name}`,
    width: 700,
    height: 500
  };
  const sunburst = new Sunburst(paramSunburst);

  // add clonal
  const paramClonal = {
    div: 'charts',
    id: 'clonal',
    dispatch,
    title: `Clonal Evolution of ${$ctrl.dataPackage.resources[0].name}`,
    width: 700,
    height: 900
  };
  const clonal = new Clonal(paramClonal);

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
    // init all views
    dispatch({type: 'init'});
    update();
  }

  function update() {
    // update all views
    dispatch({type: 'update', data: tree});
  }

  // dispatch all action to all views
  function dispatch(action) {
    treemap.consumer(action);
    sunburst.consumer(action);
    clonal.consumer(action);
  }
}

export default {
  controller,
  templateUrl: 'components/projects/taxonomy/taxonomy.html',
  bindings: {
    dataPackage: '<package'
  }
};
