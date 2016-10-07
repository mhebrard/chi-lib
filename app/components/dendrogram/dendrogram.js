import {select, selectAll} from 'd3-selection';
import {hierarchy, cluster} from 'd3-hierarchy';
import {transition} from 'd3-transition';
import {dispatch} from 'd3-dispatch';

const d3 = {
  select, selectAll,
  hierarchy, cluster,
  transition,
  dispatch
};

export default function Chart(p) {
  this.version = '0.3';
  this.events = ['collapse', 'expand', 'hover', 'hoverOut'];

  // PARAMETERS
  p = p || {};
  p.div = p.div || 'body';
  p.id = p.id || 'view';
  p.dispatch = p.dispatch || d3.dispatch('collapse', 'expand', 'hover', 'hoverOut');
  p.data = p.data || {name: 'root', size: 1};
  p.title = p.title || `Dendrogram of ${p.id}`;
  p.titleSize = p.titleSize || 18;
  p.fontSize = p.fontSize || 14;
  p.width = p.width || 800;
  p.height = p.height || 600;
  p.margin = p.margin || {top: 20, bottom: 10, left: 50, right: 200};
  p.shape = p.shape || 'curve';

  // CHART OBJECT
  const chart = {};

  chart.init = function() {
    // console.log('create chart:', p.id);
    // SVG
    const svg = d3.select(`#${p.div}`).append('svg')
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
  };

  chart.data = function(d) {
    p.data = d;
  };

  chart.update = function() {
    // console.log('chart update', p.id);
    // layout
    const filter = function(d) {
      if (d.children && !d.collapsed) {
        return d.children;
      }
    };
    const root = d3.hierarchy(p.data, filter);
    d3.cluster()
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
    const t1 = d3.transition().duration(delay);
    const t2 = d3.transition().delay(delay).duration(delay);
    const t3 = d3.transition().delay(delay * 2).duration(delay);
    // path of edges
    const link = (d, show) => {
      let path;
      let f = 'L';
      if (p.shape === 'comb') {
        path = `M${d.y}, ${d.x} ${f}${d.parent.y}, ${d.parent.x}`;
      } else {
        if (p.shape === 'curve') {
          f = 'C';
        }
        if (show) {
          path = `M${d.y}, ${d.x} ` +
          `${f}${d.parent.y + p.space}, ${d.x} ` +
          `${d.parent.y + p.space}, ${d.parent.x} ` +
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
    sel = d3.select(`#${p.id}`).select('.edges').selectAll('.edge')
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
    sel = d3.select(`#${p.id}`).select('.nodes').selectAll('.node')
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
        let coord = [0, p.height / 2];
        if (d.parent) {
          coord = [d.parent.y, d.parent.x];
        }
        return `translate(${coord[0]}, ${coord[1]})`;
      })
      .style('opacity', 0)
      .style('cursor', 'pointer')
      .on('click', d => {
        if (d.data.collapsed) {
          p.dispatch.call('expand', this, d.data);
        } else if (d.children) {
          p.dispatch.call('collapse', this, d.data);
        }
      })
      .on('mouseover', d => p.dispatch.call('hover', this, d.data))
      .on('mouseout', d => p.dispatch.call('hoverOut', this, d.data));
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

  // ACTIONS
  p.dispatch.on(`collapse.${p.id}`, d => {
    console.log(`chart ${p.id} on collapse`);
    d.collapsed = true;
    chart.update();
  });

  p.dispatch.on(`expand.${p.id}`, d => {
    console.log(`chart ${p.id} on expand`);
    d.collapsed = false;
    chart.update();
  });

  p.dispatch.on(`hover.${p.id}`, d => {
    console.log(`chart ${p.id} on hover`);
    d.hover = true;
    hover(d);
    chart.update();
  });

  p.dispatch.on(`hoverOut.${p.id}`, d => {
    console.log(`chart ${p.id} on hoverOut`);
    d.hover = false;
    hoverOut(d);
    chart.update();
  });

  // HELPERS
  function hover(n) {
    // hl node
    const d = d3.selectAll(`.n${n.name}`);
    d.select('circle').style('stroke', '#9a0026');
    d.select('text').style('font-weight', 'bold');
    // hp ancestor path
    d.datum().ancestors().forEach(par => d3.selectAll(`.e${par.data.name}`).style('stroke', '#000'));
  }

  function hoverOut(n) {
    // un-hl node
    const d = d3.selectAll(`.n${n.name}`);
    d.select('circle').style('stroke', d => d.data.collapsed ? '#324eb3' : '#009a74');
    d.select('text').style('font-weight', '');
    // un-hp ancestor path
    d.datum().ancestors().forEach(par => d3.selectAll(`.e${par.data.name}`).style('stroke', '#ccc'));
  }

  // RETURN
  return chart;
}
