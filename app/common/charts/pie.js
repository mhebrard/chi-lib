import {scaleOrdinal} from 'd3-scale';
import {schemeSet3} from 'd3-scale-chromatic';
import {arc, pie} from 'd3-shape';
import {transition} from 'd3-transition';
// workaround for event
import * as d3sel from 'd3-selection';

// test d3 version Map d3v4
/* global d3:true */
let d4 = {};
if (d3 === 'undefined' || d3.version) {
  d4 = {
    select: d3sel.select,
    selectAll: d3sel.selectAll,
    transition,
    scaleOrdinal,
    schemeSet3,
    arc, pie
  };
} else {
  d4 = d3;
}

export default function Chart(p) {
  const chart = {version: 2.0};

  // PARAMETERS
  p = p || {};
  p.div = p.div || 'body';
  p.id = p.id || 'view';
  p.data = p.data || {serie: [{name: 'root', size: 1}]};
  p.title = p.title || `Pie chart of ${p.id}`;
  p.titleSize = p.titleSize || 20;
  p.fontSize = p.fontSize || 14;
  p.width = p.width || 800;
  p.height = p.height || 600;
  p.margin = p.margin || {top: 30, bottom: 5, left: 5, right: 5};
  p.color = p.color || d4.schemeSet3;
  p.inner = p.inner || 70;
  p.cornerRadius = p.cornerRadius || 3;
  p.padAngle = p.padAngle || 0.01;
  p.aMin = p.aMin || 0.1;
  p.cutoff = p.cutoff || null;

  p.radius = Math.min(p.width - p.margin.left - p.margin.right, p.height - p.margin.top - p.margin.bottom) / 2;
  p.total = 0;
  const color = d4.scaleOrdinal(p.color);

  const arc = d4.arc()
    .innerRadius(p.inner)
    .outerRadius(p.radius)
    .cornerRadius(p.cornerRadius)
    .padAngle(p.padAngle);

  const coord = d => {
    const a = ((d.startAngle + d.endAngle) / 2) - (Math.PI / 2);
    const inner = {x: (p.inner + 5) * Math.cos(a), y: (p.inner + 5) * Math.sin(a)};
    const outer = {x: (p.radius - 5) * Math.cos(a), y: (p.radius - 5) * Math.sin(a)};
    return {inner, outer};
  };

  const path = d => {
    const c = coord(d);
    if (c.inner.x < c.outer.x) {
      return `M${c.inner.x},${c.inner.y}L${c.outer.x},${c.outer.y}`;
    }
    return `M${c.outer.x},${c.outer.y}L${c.inner.x},${c.inner.y}`;
  };

  const align = d => {
    const c = coord(d);
    return c.inner.x < c.outer.x;
  };

  const percent = value => {
    const res = Math.round(value * 100 * 100 / p.total) / 100;
    return res;
  };

  // consume action: mutate data and apply changes
  chart.consumer = function(action) {
    // console.log('action', action);
    switch (action.type) {
      case 'init':
        chart.init();
        break;
      case 'update':
        p.data = action.data;
        chart.update();
        break;
      case 'setCutoff':
        p.cutoff = action.payload;
        chart.update();
        break;
      case 'disable':
        action.node.disabled = true;
        chart.update();
        break;
      case 'enable': {
        action.node.disabled = false;
        chart.update();
        break;
      }
      default:
      //  console.log('unknown event');
    }
  };

  // add dispatcher to parameters
  p.dispatch = p.dispatch || chart.consumer;

  chart.init = function() {
    // console.log('chart init');
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
    .attr('transform', `translate(${p.margin.left + p.radius}, ${p.margin.top + p.radius})`)
    .classed('arcs', true);

    // group for labels
    svg.append('g')
    .attr('transform', `translate(${p.margin.left + p.radius}, ${p.margin.top + p.radius})`)
    .classed('labels', true);

    // center
    svg.append('g')
    .attr('transform', `translate(${p.margin.left + p.radius}, ${p.margin.top + p.radius})`)
    .classed('center', true)
    .append('text')
    .attr('text-anchor', 'middle')
		.attr('dy', '0.5ex');
  };

  // accessor
  chart.data = function(d) {
    if (d) {
      p.data = d;
    }
    return p.data;
  };

  chart.update = function() {
    // console.log('chart update');
    // console.log(p.data.serie);
    // Layout
    const root = d4.pie().value(d => d.size)(p.data.serie);

    // center
    p.total = root.reduce((res, r) => {
      res += r.data.size;
      return res;
    }, 0);

    d4.select(`#${p.id}`).select('.center').select('text')
    .text(p.total.toLocaleString());

    // Update pattern
    let sel;
    let add;
    // Transitions
    const delay = 500;
    const t1 = d4.transition().duration(delay);
    const t2 = d4.transition().delay(delay).duration(delay);
    const t3 = d4.transition().delay(delay * 2).duration(delay);

    // Filter
    const filtered = root.filter(d => p.cutoff ? d.data.size > p.cutoff : true);

    // arcs
    sel = d4.select(`#${p.id}`).select('.arcs').selectAll('path')
      .data(filtered, d => d.data.name);
    // exit
    sel.exit().transition(t1)
      .attr('d', 'M0,0A0,0Z')
      .style('opacity', 0)
      .remove();
    // update
    sel.transition(t1)
      .style('fill', d => d.data.disabled ? '#eee' : color(d.data.name))
      .style('stroke', d => d.data.disabled ? '#fff' : '#000');
    sel.transition(t2)
      .attr('d', d => arc(d));
    // add
    add = sel.enter().append('path')
      .attr('class', d => 'v' + d.data.name)
      .attr('d', 'M0,0A0,0Z')
      .style('opacity', 0)
      .style('fill-rule', 'evenodd')
      .style('cursor', 'pointer')
      .on('click', d => {
        if (d.data.disabled) {
          p.dispatch({type: 'enable', node: d.data, chart: p.id});
        } else {
          p.dispatch({type: 'disable', node: d.data, chart: p.id});
        }
      })
      .on('mouseover', d => tip('show', d))
      .on('mousemove', d => tip('move', d))
      .on('mouseout', d => tip('hide', d));
    // update
    sel = add.merge(sel);
    sel.transition(t3)
    .attr('d', d => arc(d))
    .style('fill', d => d.data.disabled ? '#eee' : color(d.data.name))
    .style('stroke', d => d.data.disabled ? '#fff' : '#000')
    .style('opacity', 1);

    // filter for labels
    const labelled = filtered.filter(d => d.endAngle - d.startAngle > p.aMin);
    // path
    sel = d4.select(`#${p.id}`).select('.labels').selectAll('path')
      .data(labelled, d => d.data.name);
    // exit
    sel.exit().transition(t1)
      .attr('d', 'M0,0A0,0Z')
      .style('opacity', 0)
      .remove();
    // update
    sel.transition(t2)
      .attr('d', d => path(d));
    // add
    add = sel.enter().append('path')
      .attr('id', d => `map${p.id}` + d.data.name)
      .attr('d', 'M0,0A0,0Z')
      .style('pointer-events', 'none')
      .style('opacity', 0);
    // update
    sel = add.merge(sel);
    sel.transition(t3)
    .attr('d', d => path(d));

    // Labels
    sel = d4.select(`#${p.id}`).select('.labels').selectAll('text')
      .data(labelled, d => d.data.name);
    // exit
    sel.exit().transition(t1)
      .style('opacity', 0)
      .remove();
    // update
    sel.transition(t2)
      .attr('text-anchor', d => align(d) ? 'end' : 'start');
    // add
    add = sel.enter().append('text')
      .attr('dy', '0.5ex')
      .style('pointer-events', 'none');
    // update
    sel = add.merge(sel);
    sel.transition(t3)
      .attr('text-anchor', d => align(d) ? 'end' : 'start');

    // textPath
    sel = d4.select(`#${p.id}`).select('.labels').selectAll('text').selectAll('textPath')
    .data(d => [d]);
    // update
    sel.transition(t2)
      .attr('startOffset', d => align(d) ? '100%' : '0%');
    // add
    add = sel.enter().append('textPath')
      .attr('xlink:href', d => `#map${p.id}` + d.data.name)
      .text(d => d.data.name);
    // update
    sel = add.merge(sel);
    sel.transition(t3)
      .attr('startOffset', d => align(d) ? '100%' : '0%');
  };

  function tip(state, d) {
    if (state === 'show') {
      d4.select('#tip')
        .datum(d)
        .style('opacity', 1)
        .html(d => `name: ${d.data.name}
          <br/>value: ${d.data.size.toLocaleString()}
          <br/>(${percent(d.data.size)}%)`
          );
      // highlight(d);
    } else if (state === 'hide') {
      d4.select('#tip').style('opacity', 0);
      // highlight();
    } else { // move
      let x = 0;
      let y = 0;
      if (d3sel.event) {
        y = d3sel.event.pageY;
        x = d3sel.event.pageX;
      } else {
        y = d3.event.layerY;
        x = d3.event.layerX;
      }
      d4.select('#tip')
        .style('top', `${y - 10}px`)
        .style('left', `${x + 10}px`);
    }
  }

  return chart;
}
