import {axisLeft, axisRight} from 'd3-axis';
import {scaleBand, scaleLinear, scaleOrdinal} from 'd3-scale';
import {schemeSet3} from 'd3-scale-chromatic';
import {transition} from 'd3-transition';
// workaround for event
import * as d3sel from 'd3-selection';

// test d3 version Map d3v4
/* global d3:true */
let d4 = {};
if (d3 === 'undefined' || d3.version) {
  d4 = {
    axisLeft, axisRight,
    scaleBand, scaleLinear, scaleOrdinal,
    schemeSet3,
    select: d3sel.select,
    selectAll: d3sel.selectAll,
    transition
  };
} else {
  d4 = d3;
}

export default function Chart(p) {
  const chart = {version: 1.0};

  // PARAMETERS
  p = p || {};
  p.div = p.div || 'body';
  p.id = p.id || 'view';
  p.data = p.data || {serie: [{name: 'root', size: 1}]};
  p.title = p.title || `Bar chart of ${p.id}`;
  p.titleSize = p.titleSize || 20;
  p.fontSize = p.fontSize || 14;
  p.width = p.width || 800;
  p.height = p.height || 600;
  p.margin = p.margin || {top: 30, bottom: 5, left: 5, right: 0};
  p.legend = p.legend || {inner: true, bottom: 100, left: 50, padding: 5};
  p.color = p.color || d4.schemeSet3;
  p.padding = p.padding || 0.1;
  p.cutoff = p.cutoff || null;

  const color = d4.scaleOrdinal(p.color);
  const v = {}; // Global variables

  const percent = value => {
    const res = Math.round(value * 100 * 100 / v.total) / 100;
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
      case 'setCutoff':
        p.cutoff = action.payload;
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
    v.x = d4.scaleBand().rangeRound([p.margin.left + p.legend.left, p.width - p.margin.left - p.legend.left - p.margin.right]).padding(p.padding);
    v.y = d4.scaleLinear().rangeRound([p.height - p.margin.top - p.margin.bottom - p.legend.bottom, p.margin.top]);

    // Axis
    v.yAxisOut = d4.axisLeft(v.y)
      .ticks(5)
      .tickSize(5, 0);

    v.yAxisIn = d4.axisRight(v.y)
      .ticks(5)
      .tickSize(p.width - p.margin.right - p.legend.left - p.margin.left, 0);

    // SVG
    v.svg = d4.select(`#${p.div}`).append('svg')
      .attr('id', p.id)
      .attr('title', p.title)
      .attr('width', p.width)
      .attr('height', p.height);

    // title
    v.svg.append('g').attr('class', 'title')
      .append('text')
      .attr('x', 0)
      .attr('y', p.margin.top / 2)
      .attr('dy', '0.5ex')
      .style('font-size', `${p.titleSize}px`)
      .text(p.title);

    // Axis
    v.svg.append('g')
      .attr('class', 'axis yOut')
      .attr('transform', `translate(${p.margin.left + p.legend.left},0)`)
      .call(v.yAxisOut);

    v.svg.append('g')
      .attr('class', 'axis yIn')
      .attr('transform', `translate(${p.margin.left + p.legend.left},0)`)
      .call(v.yAxisIn);

    // group for visual elements
    v.svg.append('g').classed('bars', true);

    // group for legend
    v.svg.append('g').classed('legendInner', true);
    v.svg.append('g').classed('legendBottom', true);
  };

  // accessor
  chart.data = function(d) {
    if (d) {
      p.data = d;
    }
    return p.data;
  };

  chart.update = function() {
    // C console.log('chart update');
    // Filter and sort data
    const filtered = p.data.serie
    .filter(d => p.cutoff ? d.size > p.cutoff : true)
    .sort((a, b) => b.size - a.size);

    v.total = filtered.reduce((tot, r) => {
      tot += r.size;
      return tot;
    }, 0);
    // Scale domains
    v.x.domain(filtered.map(d => d.name));
    v.y.domain([0, d3.max(filtered, d => d.size)]);
    // Axis
    v.yAxisOut = d4.axisLeft(v.y)
      .ticks(5)
      .tickSize(5, 0);
    v.yAxisIn = d4.axisRight(v.y)
      .ticks(5)
      .tickSize(p.width - p.margin.right - p.legend.left - p.margin.left, 0);

    // Update pattern
    let sel;
    let add;
    // Transitions
    const delay = 500;
    const t1 = d4.transition().duration(delay);
    const t2 = d4.transition().delay(delay).duration(delay);
    const t3 = d4.transition().delay(delay * 2).duration(delay);

    // Update axis
    v.svg.select('.yOut')
      .transition(t3)
      .call(v.yAxisOut);
    v.svg.select('.yIn')
      .transition(t3)
      .call(v.yAxisIn);

    // Update bars
    sel = d4.select(`#${p.id}`).select('.bars').selectAll('rect')
      .data(filtered, d => d.name);
    // exit
    sel.exit().transition(t1)
      .attr('y', v.y(0))
      .attr('height', 0)
      .style('opacity', 0)
      .remove();
    // update
    sel.transition(t2)
      .attr('x', d => v.x(d.name))
      .attr('y', d => v.y(d.size))
      .attr('width', v.x.bandwidth())
      .attr('height', d => v.y(0) - v.y(d.size));
    // add
    add = sel.enter().append('rect')
      .attr('class', d => 'v' + d.name)
      .attr('x', d => v.x(d.name))
      .attr('y', v.y(0))
      .attr('width', v.x.bandwidth())
      .attr('height', 0)
      .style('opacity', 0)
      .style('fill', d => color(d.name))
      .style('fill-rule', 'evenodd')
      .style('stroke', '#000')
      .style('cursor', 'pointer')
      .on('mouseover', d => tip('show', d))
      .on('mousemove', d => tip('move', d))
      .on('mouseout', d => tip('hide', d));
    // update
    sel = add.merge(sel);
    sel.transition(t3)
    .attr('y', d => v.y(d.size))
    .attr('height', d => v.y(0) - v.y(d.size))
    .style('opacity', 1);

    // legend
    if (p.legend.inner) {
      addLegend('I', v.svg.select('.legendInner'), filtered);
    }
    if (p.legend.bottom > 2 * p.legend.padding) {
      addLegend('B', v.svg.select('.legendBottom'), filtered);
    }

    function addLegend(place, g, data) {
      // Update path
      sel = g.selectAll('path')
        .data(data, d => d.name);
      // exit
      sel.exit().transition(t1)
        .attr('d', d => path('hide', place, d))
        .remove();
      // update
      sel.transition(t2)
        .attr('d', d => path('show', place, d));
      // add
      add = sel.enter().append('path')
        .attr('id', d => `map${p.id}${place}${d.name.replace(' ', '_')}`)
        .attr('d', d => path('hide', place, d))
        .style('pointer-events', 'none')
        .style('opacity', 0);
      // update
      sel = add.merge(sel);
      sel.transition(t3)
      .attr('d', d => path('show', place, d));

      // Update labels
      sel = g.selectAll('text')
        .data(data, d => d.name);
      // exit
      sel.exit().transition(t1)
        .style('opacity', 0)
        .remove();
      // add
      add = sel.enter().append('text')
        .attr('text-anchor', 'start')
        .attr('dy', '0.5ex')
        .style('pointer-events', 'none');
      // textPath
      sel = g.selectAll('text').selectAll('textPath')
      .data(d => [d]);
      // add
      add = sel.enter().append('textPath')
        .attr('xlink:href', d => `#map${p.id}${place}${d.name.replace(' ', '_')}`)
        .text(d => d.name);
    }
  };

  function path(mode, place, d) {
    if (mode === 'hide') {
      if (place === 'I') {
        return `M${v.x(d.name) + (v.x.bandwidth() / 2)}, ${v.y(0) - p.legend.padding} V0`;
      } // Else place === 'B'
      return `M${v.x(d.name) + p.legend.padding}, ${v.y(0) + p.legend.padding} l0, 0`;
    } // Else mode === 'show'
    if (place === 'I') {
      return `M${v.x(d.name) + (v.x.bandwidth() / 2)}, ${v.y(0) - p.legend.padding} V${v.y(d.size) + p.legend.padding}`;
    } // Else place === 'B'
    return `M${v.x(d.name) + p.legend.padding}, ${v.y(0) + p.legend.padding} L${v.x(d.name) + v.x.bandwidth() - p.legend.padding}, ${v.y(0) + p.legend.bottom - p.legend.padding}`;
  }

  function tip(state, d) {
    if (state === 'show') {
      d4.select('#tip')
        .datum(d)
        .style('opacity', 1)
        .html(d => `name: ${d.name}
          <br/>value: ${d.size.toLocaleString()}
          <br/>(${percent(d.size)}%)`
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
