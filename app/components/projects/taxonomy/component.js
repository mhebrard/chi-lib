// import Chart from './clonal';
import completeTree from './complete-tree';

controller.$inject = ['$log', 'dataService'];
function controller($log, dataService) {
  const $ctrl = this;

  console.log('data', $ctrl.dataPackage.resources[0].data);
  // complete tree
  const tree = completeTree($ctrl.dataPackage.resources[0].data);
  console.log('tree', tree);
/*  // views
  const paramChart = {
    div: 'charts',
    id: 'clonal',
    dispatch,
    title: 'Clonal evolution diagram of flare package',
    titleSize: 20,
    width: 700,
    height: 5000
    // shape: 'rake' // comb, curve, rake
  };
  const chart = new Chart(paramChart);
*/
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
//    chart.init();
    update();
  }

  function update() {
//    chart.data($ctrl.dataPackage.resources[0].data);
//    chart.update();
  }

  // dispatch all action to all views
  function dispatch(action) {
//    chart.consumer(action);
  }
}

export default {
  controller,
  templateUrl: 'components/projects/taxonomy/taxonomy.html',
  bindings: {
    dataPackage: '<package'
  }
};
