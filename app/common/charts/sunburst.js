import {select, selectAll} from 'd3-selection';
import {hierarchy, partition} from 'd3-hierarchy';
import {transition} from 'd3-transition';
import {scaleOrdinal, scaleLinear} from 'd3-scale';
import {schemeSet3} from 'd3-scale-chromatic';
import {arc, curveLinear, line} from 'd3-shape';

// workaround for event manager (d3sel.event)
import * as d3sel from 'd3-selection';

// Map d3v4
const d4 = {
  select, selectAll,
  hierarchy, partition,
  transition,
  scaleOrdinal, scaleLinear,
  schemeSet3,
  arc, curveLinear, line
};

export default function Chart(p) {
  const chart = {version: 1.1};

  // PARAMETERS
  p = p || {};
  p.div = p.div || 'body';
  p.id = p.id || 'view';
  p.data = p.data || {name: 'root', size: 1};
  p.title = p.title || `Treemap of ${p.id}`;
  p.titleSize = p.titleSize || 20;
  p.fontSize = p.fontSize || 14;
  p.width = p.width || 800;
  p.height = p.height || 600;
  p.margin = p.margin || {top: 30, bottom: 5, left: 0, right: 0};
  p.color = p.color || d4.schemeSet3;

  const color = d4.scaleOrdinal(p.color);
  const radius = Math.min(p.width - p.margin.left - p.margin.right, p.height - p.margin.top - p.margin.bottom) / 2;
  const x = d4.scaleLinear().range([0, 2 * Math.PI]);
  const y = d4.scaleLinear().range([0, radius]);

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
      /*
      case 'collapse':
        action.node.collapsed = true;
        collapse(action.node);
        chart.update();
        break;
      case 'expand':
        action.node.collapsed = false;
        expand(action.node);
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
      */
      default:
        // console.log('unknown event');
    }
  };

  // add dispatcher to parameters
  p.dispatch = p.dispatch || chart.consumer;

  chart.init = function() {
    console.log('chart init');
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

    // group for visual elements
    svg.append('g')
    .attr('transform', `translate(${(p.width + p.margin.left) / 2}, ${(p.height + p.margin.top) / 2})`)
    .classed('arcs', true);

    // group for labels
    svg.append('g')
    .attr('transform', `translate(${(p.width + p.margin.left) / 2}, ${(p.height + p.margin.top) / 2})`)
    .classed('labels', true);
  };

  // accessor
  chart.data = function(d) {
    if (d) {
      p.data = d;
    }
    return p.data;
  };

  chart.update = function() {
    console.log('chart.update');
    // layout
    const root = d4.hierarchy(p.data);
    d4.partition()(root.sum(d => d.size));

    console.log('sunburst root', root);

    // update pattern
    let sel;
    let add;
    // transitions
    const delay = 500;
    const t1 = d4.transition().duration(delay);
    const t2 = d4.transition().delay(delay).duration(delay);
    const t3 = d4.transition().delay(delay * 2).duration(delay);

    // arcs
    sel = d4.select(`#${p.id}`).select('.arcs').selectAll('path')
      .data(root.descendants(), d => id(d));
    // exit
    sel.exit().transition(t1)
      .attr('d', 'M0,0A0,0Z')
      .style('opacity', 0)
      .remove();
    // update
    sel.transition(t2)
      .attr('d', d => arc(d));
    // add
    add = sel.enter().append('path')
      .attr('class', d => 'v' + id(d))
      .attr('d', 'M0,0A0,0Z')
      .style('opacity', 0)
      .style('fill', d => color(d.data.name))
      .style('fill-rule', 'evenodd')
      .style('stroke', '#000')
      .style('cursor', 'pointer')
      .on('mouseover', d => tip('show', d))
      .on('mousemove', d => tip('move', d))
      .on('mouseout', d => tip('hide', d));
    // update
    sel = add.merge(sel);
    sel.transition(t3)
    .attr('d', d => arc(d))
    .style('opacity', 1);

    // path
    sel = d4.select(`#${p.id}`).select('.labels').selectAll('path')
      .data(root.descendants(), d => id(d));
    // exit
    sel.exit().transition(t1)
      .attr('d', 'M0,0A0,0Z')
      .style('opacity', 0)
      .remove();
    // update
    sel.transition(t2)
      .attr('d', d => arc(d, 'middle'));
    // add
    add = sel.enter().append('path')
      .attr('id', d => `map${p.id}` + id(d))
      .attr('d', 'M0,0A0,0Z')
      .style('pointer-events', 'none')
      .style('opacity', 0);
    // update
    sel = add.merge(sel);
    sel.transition(t3)
    .attr('d', d => arc(d, 'middle'))
    .style('opacity', 0);

    // text
    sel = d4.select(`#${p.id}`).select('.labels').selectAll('text')
      .data(root.descendants(), d => id(d));
    // exit
    sel.exit().transition(t1)
      .remove();
    // add
    add = sel.enter().append('text')
      .attr('class', d => 't' + id(d))
      .attr('text-anchor', 'left')
      .attr('dy', '0.5ex')
      .style('pointer-events', 'none')
      .append('textPath')
        .attr('xlink:href', d => `#map${p.id}` + id(d))
        .text(d => d.data.name);
  };

  function arc(d, edge) {
    // visual
    let a = x(d.x0);
    let b = x(d.x1);
    const ir = y(d.y0);
    let or = y(d.y1);

    if (edge === 'middle') { // label guide
      or = y((d.y0 + d.y1) / 2); // middle arc
      // add marges angle = pi-2*acos(marge/radius)
      const m = Math.PI - (2 * Math.acos(2 / ir));
      // verify a < b or path=0;
      if (a + m < b - m) {
        a += m;
        b -= m;
      } else {
        b = a;
      }
    } else if (edge === 'extern') { // HL
      or = radius;
    }

    // compute path
    const path = d4.arc()
      .startAngle(Math.max(0, Math.min(2 * Math.PI, a)))
      .endAngle(Math.max(0, Math.min(2 * Math.PI, b)))
      .innerRadius(Math.max(0, ir))
      .outerRadius(Math.max(0, or));

    let res;
    if (edge === 'middle') { // extract outer arc
      const extract = /[Mm][\d.\-e,\s]+A[\d.\-e,\s]+/;
      const guide = extract.exec(path(d));
      if (guide) {
        res = guide[0];
      } else {
        res = 'M0,0A0,0Z';
      }
    } else {
      res = path(d);
    }

    return res;
  }

  function tip(state, d) {
    if (state === 'show') {
      d4.select('#tip')
        .datum(d)
        .style('opacity', 1)
        .html(d => {
          let txt = `name: ${d.data.name}
          <br/>value: ${f(d.value)}`;
          if (d.data.data) {
            Object.keys(d.data.data).forEach(k => {
              txt += `<br/>${k}: ${d.data.data[k]}`;
            });
          }
          return txt;
        });
      // highlight(d);
    } else if (state === 'hide') {
      d4.select('#tip').style('opacity', 0);
      // highlight();
    } else { // move
      d4.select('#tip')
        .style('top', `${d3sel.event.pageY - 10}px`)
        .style('left', `${d3sel.event.pageX + 10}px`);
    }
  }

  function f(i) {
    return Number(i).toLocaleString('en');
  }

  function id(d) {
    if (d.data.id) {
      return d.data.id;
    }
    return d.data.name;
  }

  // RETURN
  return chart;
}
