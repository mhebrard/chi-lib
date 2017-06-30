import {axisBottom, axisLeft, axisRight} from 'd3-axis';
import {scaleLinear, scaleOrdinal} from 'd3-scale';
import {stack} from 'd3-shape';
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
    axisBottom, axisLeft, axisRight,
    stack,
    scaleLinear, scaleOrdinal
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
  p.data = p.data || {5: {a: 1, t: 1, g: 1, c: 1}, 10: {a: 2, t: 2, g: 2, c: 2}};
  p.title = p.title || `Mutation by position of ${p.id}`;
  p.titleSize = p.titleSize || 20;
  p.fontSize = p.fontSize || 14;
  p.width = p.width || 800;
  p.height = p.height || 400;
  p.margin = p.margin || {top: 50, bottom: 40, left: 40, right: 20};
  p.xRange = p.xRange || [0, 15];
  p.yRange = p.yRange || [0, 10];
  p.frames = p.frames || [{label: 'FRAME1', x1: 5, x2: 10, fill: '#eee'}];
  p.masks = p.masks || [{label: 'mask1', x1: 1, x2: 5, fill: '#808'}];

  const labels = ['a', 't', 'g', 'c'];
  const color = d4.scaleOrdinal()
    .domain(labels)
    .range(['#274A99', '#E4A527', '#1FB71F', '#E42727']);

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
    // Scales
    p.x = d4.scaleLinear()
      .domain(p.xRange)
      .range([p.margin.left, p.width - p.margin.right]);
    p.y = d4.scaleLinear()
      .domain(p.yRange)
      .range([p.height - p.margin.bottom, p.margin.top]);

    // Axis def
    p.xAxis = d4.axisBottom(p.x)
      .ticks(8)
      .tickSize(5, 1);
    p.yAxisOut = d4.axisLeft(p.y)
      .ticks(5)
      .tickSize(5, 0);
    p.yAxisIn = d4.axisRight(p.y)
      .ticks(5)
      .tickSize(p.width - p.margin.right - p.margin.left, 0);

    // SVG
    const svg = d4.select(`#${p.div}`).append('svg')
      .attr('id', p.id)
      .attr('title', p.title)
      .attr('width', p.width)
      .attr('height', p.height);

    // Frames
    let sel = svg.selectAll('.frame')
      .data(p.frames)
      .enter().append('g')
      .attr('class', 'frame');
    sel.append('text')
      .attr('x', d => p.x((d.x1 + d.x2) / 2))
      .attr('y', p.margin.top)
      .attr('dy', '-0.5ex')
      .attr('text-anchor', 'middle')
      .text(d => d.label);
    sel.selectAll('rect')
      .data(d => [d])
      .enter().append('rect')
      .attr('x', d => p.x(d.x1 - 0.5))
      .attr('y', p.margin.top)
      .attr('width', d => p.x(d.x2 + 1) - p.x(d.x1))
      .attr('height', p.height - p.margin.top - p.margin.bottom)
      .attr('stroke', d => d.fill === 'none' ? 'none' : '#000')
      .attr('fill', d => d.fill);

    // Masks
    sel = svg.selectAll('.mask')
      .data(p.masks)
      .enter().append('g')
      .attr('class', 'mask');
    sel.append('text')
      .attr('x', d => p.x((d.x1 + d.x2) / 2))
      .attr('y', p.y(0) - 15)
      .attr('dy', '-0.5ex')
      .attr('text-anchor', 'middle')
      .text(d => d.label);
    sel.selectAll('rect')
      .data(d => [d])
      .enter().append('rect')
      .attr('x', d => p.x(d.x1 - 0.5))
      .attr('y', p.y(0) - 10)
      .attr('width', d => p.x(d.x2 + 1) - p.x(d.x1))
      .attr('height', 10)
      .attr('stroke', d => d.fill === 'none' ? 'none' : '#000')
      .attr('fill', d => d.fill);

    // Title
    svg.append('g').attr('class', 'title')
      .append('text')
      .attr('x', 0)
      .attr('y', p.margin.top / 2)
      .attr('dy', '0.5ex')
      .style('font-size', `${p.titleSize}px`)
      .text(p.title);

    // Axis
    svg.append('g').attr('class', 'axis')
      .attr('transform', `translate(0, ${p.height - p.margin.bottom})`)
      .call(p.xAxis);
    svg.append('g').attr('class', 'axis')
      .attr('transform', `translate(${p.margin.left},0)`)
      .call(p.yAxisOut);
    svg.append('g').attr('class', 'axis')
      .attr('transform', `translate(${p.margin.left},0)`)
      .call(p.yAxisIn);

    // Legend
    sel = svg.append('g').attr('class', 'legend');
    sel.append('text')
      .attr('x', p.margin.left / 2)
      .attr('y', (p.height / 2) + p.margin.top)
      .attr('text-anchor', 'middle')
      .style('writing-mode', 'vertical-rl')
      .text('Mutation count');
    sel.append('text')
      .attr('x', (p.width / 2) + p.margin.left)
      .attr('y', p.height - (p.margin.bottom / 2))
      .attr('text-anchor', 'middle')
      .attr('dy', '0.5ex')
      .text('Position');
    sel = sel.append('g')
      .attr('transform', `translate(${p.width - 120}, ${p.height - (p.margin.bottom / 2)})`);
    sel.selectAll('rect')
      .data(labels)
      .enter().append('rect')
      .attr('x', (d, i) => (i - 1) * 30)
      .attr('y', 0)
      .attr('height', 10)
      .attr('width', 10)
      .attr('fill', d => color(d));
    sel.selectAll('text')
      .data(labels)
      .enter().append('text')
      .attr('x', (d, i) => ((i - 1) * 30) + 15)
      .attr('y', 5)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.5ex')
      .text(d => d);

    // Series
    svg.selectAll('.serie').data(labels)
    .enter().append('g').attr('class', 'serie');
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
    const poss = Object.keys(p.data);
    // Masks
    // for each pos under a mask, mutations are down to 0
    poss.forEach(f => {
      p.masks.forEach(g => {
        if (f >= g.x1 && f <= g.x2) {
          p.data[f] = {a: 0, t: 0, g: 0, c: 0};
        }
      });
    });
    // Layout
    const layout = d4.stack()
      .keys(labels)(poss.map(m => p.data[m]));
    console.log('layout', layout);

    // Update pattern
    let sel;
    // let add;
    // Transitions
    const delay = 500;
    const t1 = d4.transition().duration(delay);
    const t2 = d4.transition().delay(delay).duration(delay);
    const t3 = d4.transition().delay(delay * 2).duration(delay);

    // Rects
    sel = d4.select(`#${p.id}`).selectAll('.serie')
    .data(layout)
    .attr('fill', d => color(d.key))
    .selectAll('rect')
    .data(d => d);
    // exit
    sel.exit().transition(t1)
      .attr('height', 0)
      .remove();
    // update
    sel.transition(t2)
      .attr('y', d => p.y(d[1]))
      .attr('height', d => p.y(d[0]) - p.y(d[1]));
    // add
    const add = sel.enter().append('rect')
      .attr('x', (d, i) => p.x(poss[i] - 0.5)) // Rect is centered on the tick
      .attr('y', p.y(0))
      .attr('height', 0)
      .attr('width', p.x(1) - p.x(0)) // Rect width is 1 unit
      .on('mouseover', (d, i) => tip('show', {pos: poss[i], value: d[1] - d[0]}))
      .on('mousemove', d => tip('move', d))
      .on('mouseout', d => tip('hide', d));
    // update
    sel = add.merge(sel);
    sel.transition(t3)
    .attr('y', d => p.y(d[1]))
    .attr('height', d => p.y(d[0]) - p.y(d[1]));
  };

  function tip(state, d) {
    if (state === 'show') {
      d4.select('#tip')
        .datum(d)
        .style('opacity', 1)
        .html(d => `Position: ${d.pos}<br/>\nValue: ${d.value}`);
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
