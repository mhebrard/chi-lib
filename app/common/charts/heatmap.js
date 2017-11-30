import {max, range} from 'd3-array';
import {axisLeft, axisRight, axisTop, axisBottom} from 'd3-axis';
import {set} from 'd3-collection';
import {interpolateRgbBasis} from 'd3-interpolate';
import {scaleBand, scaleLinear, scaleThreshold} from 'd3-scale';
import {transition} from 'd3-transition';
// workaround for event
import * as d3sel from 'd3-selection';

// test d3 version Map d3v4
/* global d3:true */
let d4 = {};
if (d3 === 'undefined' || d3.version) {
  d4 = {
    max, range,
    axisLeft, axisRight, axisTop, axisBottom,
    set,
    interpolateRgbBasis,
    scaleBand, scaleLinear, scaleThreshold,
    select: d3sel.select,
    selectAll: d3sel.selectAll,
    transition
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
  p.data = p.data || {serie: [{x: 'col1', y: 'row1', size: 1}]};
  p.title = p.title || `Heatmap of ${p.id}`;
  p.titleSize = p.titleSize || 20;
  p.fontSize = p.fontSize || 14;
  p.width = p.width || 800;
  p.height = p.height || 400;
  p.margin = p.margin || {top: 30, bottom: 5, left: 5, right: 5};
  p.legend = p.legend || {top: 70, bottom: 70, left: 100, right: 100};
  p.grid = p.grid || false; // true: use gris size, false: use global size;
  p.gridWidth = p.gridWidth || 0;
  p.gridHeight = p.gridHeight || 0;
  p.color = p.color || ['#ffffff', '#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000', '#550000']; // ColorBrewer sequential
  p.cornerRadius = p.cornerRadius || 3;
  p.padding = p.padding || 0.1;

  // Scale values from 0 to 1
  const scale = d4.scaleLinear().range([0.000, 1.000]);
  // Threshold color according to color list
  const color = d4.scaleThreshold().domain(d4.range(p.color.length - 1).map(m => m / (p.color.length - 1))).range(p.color);
  const v = {}; // Global variables

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
      case 'disable':
        action.node.disabled = true;
        chart.update();
        break;
      case 'enable':
        action.node.disabled = false;
        chart.update();
        break;
      default:
        // console.log('unknown event');
    }
  };

  // add dispatcher to parameters
  p.dispatch = p.dispatch || chart.consumer;

  chart.init = function() {
    // console.log('chart init');

    // Scale
    v.x = d4.scaleBand();
    v.y = d4.scaleBand();

    // Axis
    v.xAxisTop = d4.axisTop(v.x);
    v.xAxisBottom = d4.axisBottom(v.x);
    v.yAxisLeft = d4.axisLeft(v.y);
    v.yAxisRight = d4.axisRight(v.y);

    // SVG
    v.svg = d4.select(`#${p.div}`).append('svg')
      .attr('id', p.id)
      .attr('title', p.title);

    // title
    v.svg.append('g').attr('class', 'title')
      .append('text')
      .attr('x', 0)
      .attr('y', p.margin.top / 2)
      .attr('dy', '0.5ex')
      .style('font-size', `${p.titleSize}px`)
      .text(p.title);

    // group for visual elements
    v.svg.append('g')
    .classed('cells', true);

    // group for legend
    v.svg.append('g').classed('legendTop', true)
    .attr('transform', `translate(0, ${p.margin.top + p.legend.top})`);
    v.svg.append('g').classed('legendBottom', true)
    .attr('transform', `translate(0, ${p.height - p.margin.bottom - p.legend.bottom})`);
    v.svg.append('g').classed('legendLeft', true)
    .attr('transform', `translate(${p.margin.left + p.legend.left}, 0)`);
    v.svg.append('g').classed('legendRight', true)
    .attr('transform', `translate(${p.width - p.margin.right - p.legend.right}, 0)`);
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

    // Labels
    v.labelX = d4.set(p.data.serie.map(m => m.x)).values().sort();
    v.labelY = d4.set(p.data.serie.map(m => m.y)).values().sort();

    // Grid
    // If grid is defined, size accordingly
    // else size according to width / height
    if (p.grid === true) {
      // calculate width and height according to data
      p.width = p.margin.left + p.legend.left + (v.labelX.length * p.gridWidth) + p.legend.right + p.margin.right;
      p.height = p.margin.top + p.legend.top + (v.labelY.length * p.gridHeight) + p.legend.bottom + p.margin.bottom;
    }

    // Scale
    v.x.domain(v.labelX)
    .rangeRound([p.margin.left + p.legend.left, p.width - p.margin.right - p.legend.right])
    .padding(p.padding);

    v.y.domain(v.labelY)
    .rangeRound([p.margin.top + p.legend.top, p.height - p.margin.bottom - p.legend.bottom])
    .padding(p.padding);

    scale.domain([0, d4.max(p.data.serie, d => d.size)]);

    // Axis
    v.xAxisTop = d4.axisTop(v.x);
    v.xAxisBottom = d4.axisBottom(v.x);
    v.yAxisLeft = d4.axisLeft(v.y);
    v.yAxisRight = d4.axisRight(v.y);

    // Update pattern
    let sel;
    let add;
    // Transitions
    const delay = 500;
    const t1 = d4.transition().duration(delay);
    const t2 = d4.transition().delay(delay).duration(delay);
    const t3 = d4.transition().delay(delay * 2).duration(delay);

    // Adjust SVG
    v.svg.attr('width', p.width)
      .attr('height', p.height);
    v.svg.select('.legendBottom')
      .transition(t2)
      .attr('transform', `translate(0, ${p.height - p.margin.bottom - p.legend.bottom})`);
    v.svg.select('.legendRight')
      .transition(t2)
      .attr('transform', `translate(${p.width - p.margin.right - p.legend.right}, 0)`);

    // Update axis
    if (p.legend.top > 0) {
      v.svg.select('.legendTop')
        .transition(t3)
        .call(v.xAxisTop)
        .selectAll('text')
        .attr('transform', 'rotate(-30)')
        .style('text-anchor', 'start')
        .attr('dx', '1ex')
        .attr('dy', '1ex');
    }
    if (p.legend.bottom > 0) {
      v.svg.select('.legendBottom')
        .transition(t3)
        .call(v.xAxisBottom)
        .selectAll('text')
        .attr('transform', 'rotate(-30)')
        .style('text-anchor', 'end')
        .attr('dx', '-1ex')
        .attr('dy', '1ex');
    }
    if (p.legend.left > 0) {
      v.svg.select('.legendLeft')
        .transition(t3)
        .call(v.yAxisLeft);
    }
    if (p.legend.right > 0) {
      v.svg.select('.legendRight')
        .transition(t3)
        .call(v.yAxisRight);
    }

    // Cells
    sel = d4.select(`#${p.id}`).select('.cells').selectAll('rect')
    .data(p.data.serie, d => d.x + d.y);
    // exit
    sel.exit().transition(t1)
      .style('opacity', 0)
      .remove();
    // update
    sel.transition(t1)
      .style('fill', d => color(scale(d.size)))
      .style('stroke', '#000');
    sel.transition(t2)
    .attr('x', d => v.x(d.x))
    .attr('y', d => v.y(d.y))
    .attr('width', v.x.bandwidth())
    .attr('height', v.y.bandwidth());
    // add
    add = sel.enter().append('rect')
    .attr('x', d => v.x(d.x))
    .attr('y', d => v.y(d.y))
    .attr('width', 0)
    .attr('height', 0)
    .attr('rx', p.cornerRadius)
    .attr('ry', p.cornerRadius)
    .style('opacity', 0)
    .style('fill-rule', 'evenodd')
    .style('cursor', 'pointer')
    .on('mouseover', d => tip('show', d))
    .on('mousemove', d => tip('move', d))
    .on('mouseout', d => tip('hide', d));
    // update
    sel = add.merge(sel);
    sel.transition(t3)
    .attr('width', v.x.bandwidth())
    .attr('height', v.y.bandwidth())
    .style('opacity', 1)
    .style('fill', d => color(scale(d.size)))
    .style('stroke', '#000');
  };

  function tip(state, d) {
    if (state === 'show') {
      d4.select('#tip')
        .datum(d)
        .style('opacity', 1)
        .html(d => `Row: ${d.y}<br/>\nColumn: ${d.x}<br/>\nValue: ${d.size}`);
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
