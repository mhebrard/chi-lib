import Chart from 'common/charts/bar';

function controller() {
  const $ctrl = this;

  // views
  const paramChart = {
    div: 'charts',
    id: 'bar',
    title: 'Bar chart of "layout" node of flare package',
    legend: {inner: true, bottom: 0, left: 40, padding: 5},
    cutoff: 3000,
    dispatch
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
  templateUrl: 'components/charts/bar/template.html',
  bindings: {
    dataPackage: '<package'
  }
};
