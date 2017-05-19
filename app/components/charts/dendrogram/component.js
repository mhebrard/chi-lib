import Chart from 'common/charts/dendrogram';

function controller() {
  const $ctrl = this;

  // views
  const paramChart = {
    div: 'charts',
    id: 'dendro',
    dispatch,
    title: 'Dendrogram of flare package',
    width: 800,
    height: 2500
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
    // init only chart
    chart.init();
    // init all views
    // dispatch({type: 'init'});
    update();
  }

  function update() {
    // deep clone data
    // const d = JSON.parse(JSON.stringify($ctrl.dataPackage.resources[0].data));
    // update only chart
    chart.data($ctrl.dataPackage.resources[0].data);
    chart.update();
    // update all views
    // dispatch({type: 'update', data: $ctrl.dataPackage.resources[0].data});
  }

  // dispatch all action to all views
  function dispatch(action) {
    chart.consumer(action);
  }
}

export default {
  controller,
  templateUrl: 'components/charts/dendrogram/template.html',
  bindings: {
    dataPackage: '<package'
  }
};
