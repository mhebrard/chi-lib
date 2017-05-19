import {select, selectAll} from 'd3-selection';
import {transition} from 'd3-transition';
import {scaleOrdinal} from 'd3-scale';
import {schemeSet3} from 'd3-scale-chromatic';
import {arc, pie} from 'd3-shape';
// workaround for event
import * as d3sel from 'd3-selection';

// Map d3v4
const d4 = {
  select, selectAll,
  transition,
  scaleOrdinal,
  schemeSet3,
  arc, pie
};

export default function Chart(p) {
  const chart = {version: 1.0};

  // PARAMETERS
  p = p || {};
  p.div = p.div || 'body';
  p.id = p.id || 'view';
  p.data = p.data || {serie: [{name: 'root', size: 1}]};
  p.title = p.title || `Pie chart of ${p.id}`;
  p.titleSize = p.titleSize || 18;
  p.fontSize = p.fontSize || 14;
  p.width = p.width || 800;
  p.height = p.height || 600;
  p.margin = p.margin || {top: 20, bottom: 0, left: 0, right: 0};
  p.color = p.color || d4.schemeSet3;
  p.inner = p.inner || 70;
  p.cornerRadius = p.cornerRadius || 3;
  p.padAngle = p.padAngle || 0.01;
  p.aMin = p.aMin || 0.1;

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
    switch (action.type) {
      case 'init':
        chart.init();
        break;
      case 'update':
        p.data = action.data;
        chart.update();
        break;
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
    console.log('chart update');
    // Layout
    const root = d4.pie().value(d => d.size)(p.data.serie);
    console.log('pir layout', root);

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

    // arcs
    sel = d4.select(`#${p.id}`).select('.arcs').selectAll('path')
      .data(root, d => d.data.name);
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
      .attr('class', d => 'v' + d.data.name)
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

    // filter for labels
    const labelled = root.filter(d => d.endAngle - d.startAngle > p.aMin);
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
      d4.select('#tip')
        .style('top', `${d3sel.event.pageY - 10}px`)
        .style('left', `${d3sel.event.pageX + 10}px`);
    }
  }

  return chart;
}