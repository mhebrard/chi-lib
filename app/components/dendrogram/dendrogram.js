import {select, selectAll} from 'd3-selection';
import {hierarchy, cluster} from 'd3-hierarchy';
import {transition} from 'd3-transition';

// fuse the d3 micro library in one global variable
const d3 = {
  select, selectAll,
  hierarchy, cluster,
  transition
};

const chart = {version: '0.2'};

// in case of absence of controller,
// the view became controller
let state;
function dispatch(action) {
  if (state.dispatch) {
    state.dispatch(action);
  } else {
    chart.consumer(state, action);
  }
}

// initial parameters
function params(s) {
  s = s || {};
  s.div = s.div || 'body';
  s.id = s.id || 'view';
  s.title = s.title || `Dendrogram of ${s.id}`;
  s.titleSize = s.titleSize || 18;
  s.fontSize = s.fontSize || 14;
  s.width = s.width || 800;
  s.height = s.height || 600;
  s.margin = s.margin || {top: 20, bottom: 10, left: 50, right: 200};
  s.shape = s.shape || 'curve';

  if (!s.controller) {
    state = s;
  }

  return s;
}

// consumer is like a reducer but not pure function
chart.consumer = function(state, action) {
  // actions
  switch (action.type) {
    case 'init':
      state = params(state);
      init(state);
      break;
    case 'update':
      state.data = action.data;
      update(state);
      break;
    case 'collapse':
      action.node.collapsed = true;
      update(state);
      break;
    case 'expand':
      action.node.collapsed = false;
      update(state);
      break;
    case 'hover':
      action.node.hover = true;
      hover(action.node);
      break;
    case 'hoverOut':
      action.node.hover = false;
      hoverOut(action.node);
      break;
    default:
      console.log('unknown event');
  }
};

// ACTIONS
function init(s) {
  // console.log('view init');
  // SVG
  const svg = d3.select(`#${s.div}`).append('svg')
    .attr('id', s.id)
    .attr('title', s.title)
    .attr('width', s.width)
    .attr('height', s.height);

  // title
  svg.append('g').attr('class', 'title')
    .append('text')
    .attr('x', 0)
    .attr('y', s.margin.top / 2)
    .attr('dy', '0.5ex')
    .style('font-size', `${s.titleSize}px`)
    .text(s.title);

  // data
  const tree = svg.append('g').attr('class', 'tree')
    .attr('transform', `translate(${s.margin.left}, ${s.margin.top})`)
    .style('font-size', `${s.fontSize}px`);
  tree.append('g').attr('class', 'edges');
  tree.append('g').attr('class', 'nodes');
}

function update(s) {
  // console.log('view update');
  // layout
  const filter = function(d) {
    if (d.children && !d.collapsed) {
      return d.children;
    }
  };
  const root = d3.hierarchy(s.data, filter);
  d3.cluster()
    .size([
      s.height - s.margin.top - s.margin.bottom,
      s.width - s.margin.left - s.margin.right
    ])(root);

  // edge breakpoint (distance to parent node where the break occure)
  s.space = (s.width - s.margin.left - s.margin.right) / (2 * root.height);

  // update pattern
  let sel;
  let add;
  // transitions
  const delay = 500;
  const t1 = d3.transition().duration(delay);
  const t2 = d3.transition().delay(delay).duration(delay);
  const t3 = d3.transition().delay(delay * 2).duration(delay);
  // path of edges
  const link = (d, show) => {
    let path;
    let f = 'L';
    if (s.shape === 'comb') {
      path = `M${d.y}, ${d.x} ${f}${d.parent.y}, ${d.parent.x}`;
    } else {
      if (s.shape === 'curve') {
        f = 'C';
      }
      if (show) {
        path = `M${d.y}, ${d.x} ` +
        `${f}${d.parent.y + s.space}, ${d.x} ` +
        `${d.parent.y + s.space}, ${d.parent.x} ` +
        `${d.parent.y}, ${d.parent.x}`;
      } else {
        path = `M${d.parent.y}, ${d.parent.x} ` +
        `${f}${d.parent.y}, ${d.parent.x} ` +
        `${d.parent.y}, ${d.parent.x} ` +
        `${d.parent.y}, ${d.parent.x}`;
      }
    }
    return path;
  };

  // edges
  sel = d3.select(`#${s.id}`).select('.edges').selectAll('.edge')
    .data(root.descendants().slice(1), d => d.data.name);
  // exit
  sel.exit().transition(t1)
    .attr('d', d => link(d, false))
    .remove();
  // update
  sel.transition(t2)
    .attr('d', d => link(d, true));
  // add
  add = sel.enter().append('path')
    .attr('class', d => `edge e${d.data.name.replace(' ', '')}`)
    .attr('d', d => link(d, false))
    .style('fill', 'none')
    .style('stroke', '#ccc')
    .style('stroke-width', '1.5px');
  // update
  sel = add.merge(sel);
  sel.transition(t3)
    .attr('d', d => link(d, true));

  // nodes
  sel = d3.select(`#${s.id}`).select('.nodes').selectAll('.node')
      .data(root.descendants(), d => d.data.name);
  // exit
  sel.exit().transition(t1)
    .attr('transform', d => `translate(${d.parent.y}, ${d.parent.x})`)
    .style('opacity', 0)
    .remove();
  // update
  sel.transition(t2)
  .attr('transform', d => `translate(${d.y}, ${d.x})`);
  // add
  add = sel.enter().append('g')
    .attr('class', d => `node n${d.data.name.replace(' ', '')}`)
    .attr('transform', d => {
      let coord = [0, s.height / 2];
      if (d.parent) {
        coord = [d.parent.y, d.parent.x];
      }
      return `translate(${coord[0]}, ${coord[1]})`;
    })
    .style('opacity', 0)
    .style('cursor', 'pointer')
    .on('click', d => {
      if (d.data.collapsed) {
        dispatch({type: 'expand', node: d.data});
      } else if (d.children) {
        dispatch({type: 'collapse', node: d.data});
      }
    })
    .on('mouseover', d => dispatch({type: 'hover', node: d.data}))
    .on('mouseout', d => dispatch({type: 'hoverOut', node: d.data}));
  add.append('circle').style('stroke-width', '2px');
  add.append('text').attr('dy', 3);
  // update
  sel = add.merge(sel);
  sel.transition(t3)
    .attr('transform', d => `translate(${d.y}, ${d.x})`)
    .style('opacity', 1);
  sel.select('circle')
    .attr('r', d => d.data.collapsed ? 5.5 : 4.5)
    .style('fill', d => d.data.collapsed ? '#ddd' : '#fff')
    .style('stroke', d => d.data.collapsed ? '#324eb3' : '#009a74');
  sel.select('text')
    .attr('dx', d => d.children ? -8 : 8)
    .style('text-anchor', d => d.children ? 'end' : 'start')
    .text(d => d.data.name);
}

function hover(n) {
  // hl node
  const d = d3.select(`.n${n.name}`);
  d.select('circle').style('stroke', '#9a0026');
  d.select('text').style('font-weight', 'bold');
  // hp ancestor path
  d.datum().ancestors().forEach(p => d3.select(`.e${p.data.name}`).style('stroke', '#000'));
}

function hoverOut(n) {
  // un-hl node
  const d = d3.select(`.n${n.name}`);
  d.select('circle').style('stroke', d => d.data.collapsed ? '#324eb3' : '#009a74');
  d.select('text').style('font-weight', '');
  // un-hp ancestor path
  d.datum().ancestors().forEach(p => d3.select(`.e${p.data.name}`).style('stroke', '#ccc'));
}

// export
export default chart;
