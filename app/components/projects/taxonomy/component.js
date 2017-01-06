// import Chart from './clonal';

controller.$inject = ['$log', 'dataService'];
function controller($log, dataService) {
  const $ctrl = this;

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
  templateUrl: 'components/projects/phylogeny/phylogeny.html',
  bindings: {
    dataPackage: '<package'
  }
};
