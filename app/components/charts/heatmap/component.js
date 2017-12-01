import Chart from 'common/charts/heatmap';

function controller() {
  const $ctrl = this;

  // views
  const paramChart = {
    div: 'charts',
    id: 'heatmapSVG',
    title: 'Heatmap derived from "layout" node of flare package',
    grid: true,
    gridWidth: 50,
    gridHeight: 50,
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
  templateUrl: 'components/charts/heatmap/template.html',
  bindings: {
    dataPackage: '<package'
  }
};
