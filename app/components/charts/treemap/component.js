import Chart from 'common/charts/treemap';

function controller() {
  const $ctrl = this;

  // views
  const paramChart = {
    div: 'charts',
    id: 'treemap',
    dispatch,
    title: 'Treemap of flare package',
    width: 800,
    height: 600
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
  templateUrl: 'components/charts/treemap/template.html',
  bindings: {
    dataPackage: '<package'
  }
};
