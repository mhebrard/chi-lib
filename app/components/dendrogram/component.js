import chart from './dendrogram';

controller.$inject = ['$log', 'dataService'];
function controller($log, dataService) {
  const $ctrl = this;
  const state = {};

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
    // initial parameters
    state.dispatch = dispatch;
    state.div = 'charts';
    state.id = 'dendro';
    state.title = 'Dendrogram of flare package';
    state.titleSize = 20;
    state.width = 800;
    state.height = 2800;

    dispatch({type: 'init'});
    update();
  }

  function update() {
    // deep clone data
    const d = JSON.parse(JSON.stringify($ctrl.dataPackage.resources[0].data));
    dispatch({type: 'update', data: d});
  }

  function dispatch(action) {
    console.log('dispatch', action);
    chart.consumer(state, action);
  }
}

export default {
  controller,
  templateUrl: 'components/dendrogram/dendrogram.html',
  bindings: {
    dataPackage: '<package'
  }
};
