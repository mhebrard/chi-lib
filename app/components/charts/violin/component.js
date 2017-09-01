import Chart from 'common/charts/violin';

function controller() {
  const $ctrl = this;

  // views
  const paramChart = {
    div: 'charts',
    id: 'violin',
    options: 'options',
    dispatch,
    title: 'Charaters Stats',
    height: 300,
    catWidth: 100,
    catSpacing: 10,
    resolution: 20,
    xScale: 'common'
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
  templateUrl: 'components/charts/violin/template.html',
  bindings: {
    dataPackage: '<package'
  }
};
