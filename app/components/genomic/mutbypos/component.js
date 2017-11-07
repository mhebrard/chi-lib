import Chart from 'common/charts/mutbypos';

function controller() {
  const $ctrl = this;

  // views
  const paramChart = {
    div: 'charts',
    id: 'mutbypos',
    title: 'Mutation by position example',
    xRange: [0, 325],
    frames: [
			{label: 'CDR1', x1: 79, x2: 114, fill: '#eee'},
			{label: 'CDR2', x1: 166, x2: 195, fill: '#eee'}
    ],
    masks: [
      {label: 'primer', x1: 1, x2: 30, fill: '#808'},
      {label: 'primer', x1: 315, x2: 325, fill: '#808'}
    ],
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
  templateUrl: 'components/genomic/mutbypos/template.html',
  bindings: {
    dataPackage: '<package'
  }
};
