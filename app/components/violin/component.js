import Chart from './violin';

controller.$inject = ['$log', 'dataService'];
function controller($log, dataService) {
  const $ctrl = this;

  // views
  const paramChart = {
    div: 'charts',
    id: 'violin',
    dispatch,
    title: 'Charaters Stats',
    titleSize: 20,
    // margin:{top:10, bottom:20, left:50, right:50},
    height: 300,
    catWidth: 100,
    catSpacing: 10,
    resolution: 20
    // ymin: 0,
    // ymax: 255
    // interpolation: 'step'
    // shape: 'rake' // comb, curve, rake
  };
  const chart = new Chart(paramChart);

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
    chart.init();
    update();
  }

  function update() {
    chart.data($ctrl.dataPackage.resources[0].data);
    chart.update();
  }

  // dispatch all action to all views
  function dispatch(action) {
    chart.consumer(action);
  }
}

export default {
  controller,
  templateUrl: 'components/violin/violin.html',
  bindings: {
    dataPackage: '<package'
  }
};
