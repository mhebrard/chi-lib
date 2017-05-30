import {select, selectAll} from 'd3-selection';
import {hierarchy, cluster} from 'd3-hierarchy';
import {transition} from 'd3-transition';

// test d3 version Map d3v4
/* global d3:true */
let d4 = {};
if (d3 === 'undefined' || d3.version) {
  d4 = {
    select, selectAll,
    hierarchy, cluster,
    transition
  };
} else {
  d4 = d3;
}

export default function Chart(p) {
  const chart = {version: 1.1};

  // PARAMETERS
  p = p || {};
  p.div = p.div || 'body';
  p.id = p.id || 'view';
  p.data = p.data || {name: 'root', size: 1};
  p.title = p.title || `Dendrogram of ${p.id}`;
  p.titleSize = p.titleSize || 20;
  p.fontSize = p.fontSize || 14;
  p.width = p.width || 800;
  p.height = p.height || 600;
  p.margin = p.margin || {top: 30, bottom: 10, left: 50, right: 200};
  p.shape = p.shape || 'curve';

  // consume action: mutate data and apply changes
  chart.consumer = function(action) {
    switch (action.type) {
      case 'init':
        chart.init();
        break;
      case 'update':
        p.data = action.data;
        chart.update();
        break;
      case 'collapse':
        action.node.collapsed = true;
        chart.update();
        break;
      case 'expand':
        action.node.collapsed = false;
        chart.update();
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
        // console.log('unknown event');
    }
  };

  // add dispatcher to parameters
  p.dispatch = p.dispatch || chart.consumer;

  // path of edges
  const link = (d, show) => {
    let path;
    let f = 'L';
    if (show) {
      if (p.shape === 'comb') {
        path = `M${d.y}, ${d.x} ${f}${d.parent.y}, ${d.parent.x}`;
      } else {
        if (p.shape === 'curve') {
          f = 'C';
        }
        path = `M${d.y}, ${d.x} ` +
        `${f}${d.parent.y + p.space}, ${d.x} ` +
        `${d.parent.y + p.space}, ${d.parent.x} ` +
        `${d.parent.y}, ${d.parent.x}`;
      }
    } else {
      path = `M${d.parent.y}, ${d.parent.x} L${d.parent.y}, ${d.parent.x}`;
    }
    return path;
  };

  chart.init = function() {
    // SVG
    const svg = d4.select(`#${p.div}`).append('svg')
      .attr('id', p.id)
      .attr('title', p.title)
      .attr('width', p.width)
      .attr('height', p.height);

    // title
    svg.append('g').attr('class', 'title')
      .append('text')
      .attr('x', 0)
      .attr('y', p.margin.top / 2)
      .attr('dy', '0.5ex')
      .style('font-size', `${p.titleSize}px`)
      .text(p.title);

    // data
    const tree = svg.append('g').attr('class', 'tree')
      .attr('transform', `translate(${p.margin.left}, ${p.margin.top})`)
      .style('font-size', `${p.fontSize}px`);
    tree.append('g').attr('class', 'edges');
    tree.append('g').attr('class', 'nodes');
    tree.append('path').attr('class', 'edge hl')
      .style('fill', 'none')
      .style('stroke', '#000')
      .style('stroke-width', '1.5px')
      .style('pointer-events', 'none');
  };

  // accessor
  chart.data = function(d) {
    if (d) {
      p.data = d;
    }
    return p.data;
  };

  chart.update = function() {
    // layout
    const filter = function(d) {
      if (d.children && !d.collapsed) {
        return d.children;
      }
    };
    const root = d4.hierarchy(p.data, filter);
    d4.cluster()
      .size([
        p.height - p.margin.top - p.margin.bottom,
        p.width - p.margin.left - p.margin.right
      ])(root);

    // edge breakpoint (distance to parent node where the break occure)
    p.space = (p.width - p.margin.left - p.margin.right) / (2 * root.height);

    // update pattern
    let sel;
    let add;
    // transitions
    const delay = 500;
    const t1 = d4.transition().duration(delay);
    const t2 = d4.transition().delay(delay).duration(delay);
    const t3 = d4.transition().delay(delay * 2).duration(delay);

    // edges
    sel = d4.select(`#${p.id}`).select('.edges').selectAll('.edge')
      .data(root.descendants().slice(1), d => d.data.name);
    // exit
    sel.exit().transition(t1)
      .attr('d', d => link(d, false))
      .style('opacity', 0)
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
      .style('stroke-width', '1.5px')
      .style('opacity', 0);
    // update
    sel = add.merge(sel);
    sel.transition(t3)
      .attr('d', d => link(d, true))
      .style('opacity', 1);

    // nodes
    sel = d4.select(`#${p.id}`).select('.nodes').selectAll('.node')
        .data(root.descendants().slice(1), d => d.data.name);
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
        let coord = [0, p.height / 2];
        if (d.parent) {
          coord = [d.parent.y, d.parent.x];
        }
        return `translate(${coord[0]}, ${coord[1]})`;
      })
      .style('cursor', 'pointer')
      .style('opacity', 0)
      .on('click', d => {
        if (d.data.collapsed) {
          p.dispatch({type: 'expand', node: d.data});
        } else if (d.parent && d.children) {
          p.dispatch({type: 'collapse', node: d.data});
        }
      })
      .on('mouseover', d => p.dispatch({type: 'hover', node: d.data}))
      .on('mouseout', d => p.dispatch({type: 'hoverOut', node: d.data}));
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
  };

  // HELPERS
  function hover(n) {
    // hl node
    const d = d4.select(`#${p.id}`).selectAll(`.n${n.name}`);
    d.select('circle').style('stroke', '#9a0026');
    d.select('text').style('font-weight', 'bold');
    // reconstruct path to too root for hl
    const path = d.datum().ancestors().slice(0, -1).reduce((t, a) => {
      t += link(a, true);
      return t;
    }, '');
    d4.select(`#${p.id}`).select('path.hl').attr('d', path);
  }

  function hoverOut(n) {
    // un-hl node
    const d = d4.select(`#${p.id}`).selectAll(`.n${n.name}`);
    d.select('circle').style('stroke', d => d.data.collapsed ? '#324eb3' : '#009a74');
    d.select('text').style('font-weight', '');
    // delete hl path
    d4.select(`#${p.id}`).select('path.hl').attr('d', null);
  }

  // RETURN
  return chart;
}
