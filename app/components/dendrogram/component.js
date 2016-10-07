import {dispatch} from 'd3-dispatch';
import Chart from './dendrogram';

const dispatcher = dispatch('collapse', 'expand', 'hover', 'hoverOut');

controller.$inject = ['$log', 'dataService'];
function controller($log, dataService) {
  const $ctrl = this;

  // views
  const paramChart = {
    div: 'charts',
    id: 'dendro',
    dispatch: dispatcher,
    title: 'Dendrogram of flare package',
    titleSize: 20,
    width: 800,
    height: 1800
    // shape: 'rake' // comb, curve, rake
  };
  const chart = new Chart(paramChart);

  const paramTest = {
    div: 'charts',
    dispatch: dispatcher,
    height: 200
  };
  const test = new Chart(paramTest);

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
    test.init();
    chart.init();
    update();
  }

  function update() {
    // deep clone data
    const d = JSON.parse(JSON.stringify($ctrl.dataPackage.resources[0].data));
    chart.data(d);
    chart.update();
  }
}

export default {
  controller,
  templateUrl: 'components/dendrogram/dendrogram.html',
  bindings: {
    dataPackage: '<package'
  }
};
