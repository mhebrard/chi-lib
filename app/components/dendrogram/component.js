import d3 from 'd3';
import angular from 'angular';

import chart from './dendrogram';

controller.$inject = ['$log', 'dataService'];
function controller($log, dataService) {
  const $ctrl = this;
  /* v */
  const param = {
    width: 800,
    height: 2800,
    id: 'dendro',
    title: 'Dendrogram of flare package',
    titleSize: 20
  };
  /* ^ */

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
    const container = d3.select('#charts');
    // d3view.init(container,param) > create the SVG
    container.call(chart.init, param);
    update();
  }

  function update() {
    // deep clone data
    // JSON.parse(JSON.stringify($ctrl.dataPackage.resources[0].data));
    const data = angular.copy($ctrl.dataPackage.resources[0].data);
    // d3view.update(svg,data,param) > include data inside SVG
    d3.select(`#${param.id}`).call(chart.update, data, param);
  }
}

export default {
  controller,
  templateUrl: 'components/dendrogram/dendrogram.html',
  bindings: {
    dataPackage: '<package'
  }
};
