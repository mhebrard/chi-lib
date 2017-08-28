import {interpolateRgbBasis} from 'd3-interpolate';
import {scaleLinear, scaleSequential} from 'd3-scale';
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
    interpolateRgbBasis,
    scaleLinear, scaleSequential
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
  p.data = p.data || {row1: {column1: 1}};
  p.title = p.title || `Heatmap of ${p.id}`;
  p.titleSize = p.titleSize || 20;
  p.fontSize = p.fontSize || 14;
  p.width = p.width || 800;
  p.height = p.height || 400;
  p.margin = p.margin || {top: 30, bottom: 5, left: 5, right: 5, padding: 1};
  p.legend = p.legend || {top: 100, bottom: 100, left: 100, right: 100, padding: 5};
  p.grid = p.grid || false; // true: use gris size, false: use global size;
  p.gridWidth = p.gridWidth || 0;
  p.gridHeight = p.gridHeight || 0;
  p.colorNull = '#fff';
  p.color = p.color || ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000']; // ColorBrewer sequential
  p.cornerRadius = p.cornerRadius || 3;

  const color = d4.scaleSequential(d4.interpolateRgbBasis(p.color));
  const scale = d4.scaleLinear().range([0.000, 1.000]);
  p.max = 0; // Maximal cell value

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
    // console.log('chart init');
    // SVG
    const svg = d4.select(`#${p.div}`).append('svg')
      .attr('id', p.id)
      .attr('title', p.title);

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
    .attr('transform', `translate(${p.margin.left + p.legend.left}, ${p.margin.top + p.legend.top})`)
    .classed('rows', true);

    // group for legend
    svg.append('g').classed('legendTop', true)
    .attr('transform', `translate(${p.margin.left + p.legend.left}, ${p.margin.top})`);
    svg.append('g').classed('legendBottom', true);
    svg.append('g').classed('legendLeft', true)
    .attr('transform', `translate(${p.margin.left}, ${p.margin.top + p.legend.top})`);
    svg.append('g').classed('legendRight', true);
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
    p.labelX = [];
    p.labelY = [];
    p.heatmap = [];
    // Parse data
    Object.keys(p.data).forEach(row => {
      // Define Y label and index
      let y = p.labelY.indexOf(row);
      if (y < 0) {
        y = p.labelY.length;
        p.labelY.push(row);
      }
      Object.keys(p.data[row]).forEach(col => {
        // Define X label and index
        let x = p.labelX.indexOf(col);
        if (x < 0) {
          x = p.labelX.length;
          p.labelX.push(col);
        }
        // Populate heatmap
        if (p.heatmap[y] === undefined) {
          p.heatmap[y] = [];
        }
        p.heatmap[y][x] = p.data[row][col];
        p.max = Math.max(p.max, p.data[row][col]);
      });
    });
    // Scale color
    scale.domain([0, p.max]);
    // Sort label
    p.labelX = p.labelX.map((m, i) => [m, i]);
    p.labelY = p.labelY.map((m, i) => [m, i]);
    p.labelX.sort((a, b) => a[0] < b[0] ? -1 : 1);
    p.labelY.sort((a, b) => a[0] < b[0] ? -1 : 1);
    // Grid
    // If grid is defined, size accordingly
    // else size according to width / height
    if (p.grid) {
      p.width = p.margin.left + p.legend.left + (p.labelX.length * p.gridWidth) + p.legend.right + p.margin.right;
      p.height = p.margin.top + p.legend.top + (p.labelY.length * p.gridHeight) + p.legend.bottom + p.margin.bottom;
    } else {
      p.gridWidth = (p.width - p.margin.left - p.legend.left - p.margin.right - p.legend.right) / p.labelX.length;
      p.gridHeight = (p.height - p.margin.top - p.legend.top - p.margin.bottom - p.legend.bottom) / p.labelY.length;
    }

    // Update pattern
    let sel;
    let add;
    // Transitions
    const delay = 500;
    const t1 = d4.transition().duration(delay);
    const t2 = d4.transition().delay(delay).duration(delay);
    const t3 = d4.transition().delay(delay * 2).duration(delay);

    // Adjust SVG
    const svg = d4.select(`#${p.id}`)
      .attr('width', p.width)
      .attr('height', p.height);
    svg.select('.legendBottom')
      .transition(t2)
      .attr('transform', `translate(${p.margin.left + p.legend.left}, ${p.height - p.margin.bottom - p.legend.bottom})`);
    svg.select('.legendRight')
      .transition(t2)
      .attr('transform', `translate(${p.width - p.margin.right - p.legend.right}, ${p.margin.top + p.legend.top})`);

    // Legend
    // const svg = d4.select(`#${p.id}`);
    if (p.legend.top > 2 * p.legend.padding) {
      addLegend('T', svg.select('.legendTop'), p.labelX.map(m => m[0]));
    }
    if (p.legend.bottom > 2 * p.legend.padding) {
      addLegend('B', svg.select('.legendBottom'), p.labelX.map(m => m[0]));
    }
    if (p.legend.left > 2 * p.legend.padding) {
      addLegend('L', svg.select('.legendLeft'), p.labelY.map(m => m[0]));
    }
    if (p.legend.right > 2 * p.legend.padding) {
      addLegend('R', svg.select('.legendRight'), p.labelY.map(m => m[0]));
    }

    // Rows
    sel = d4.select(`#${p.id}`).select('.rows').selectAll('g')
    .data(p.labelY.map(y => [y[0], p.heatmap[y[1]]]));
    // exit
    sel.exit().transition(t1)
      .style('opacity', 0)
      .remove();
    // update
    sel.transition(t2)
      .attr('transform', (d, i) => `translate(0, ${i * p.gridHeight})`);
    // add
    add = sel.enter().append('g')
      .attr('transform', (d, i) => `translate(0, ${i * p.gridHeight})`)
      .style('opacity', 0);
    // update
    sel = add.merge(sel);
    sel.transition(t3)
    .style('opacity', 1);

    // Cells
    sel = d4.select(`#${p.id}`).select('.rows').selectAll('g').selectAll('rect')
    .data(d => p.labelX.map(x => [d[0], x[0], d[1][x[1]] || 0]), d => d[0] + d[1]);
    // exit
    sel.exit().transition(t1)
      .style('opacity', 0)
      .remove();
    // update
    sel.transition(t2)
    .attr('x', (d, i) => (i * p.gridWidth) + p.margin.padding)
    .attr('width', p.gridWidth - (2 * p.margin.padding))
    .attr('height', p.gridHeight - (2 * p.margin.padding))
    .style('fill', d => d[2] === 0 ? p.colorNull : color(scale(d[2])));
    // add
    add = sel.enter().append('rect')
    .attr('x', (d, i) => (i * p.gridWidth) + p.margin.padding)
    .attr('y', p.margin.padding)
    .attr('width', 0)
    .attr('height', 0)
    .attr('rx', p.cornerRadius)
    .attr('ry', p.cornerRadius)
    .style('opacity', 0)
    .style('fill', '#fff')
    .style('fill-rule', 'evenodd')
    .style('stroke', '#000')
    .style('cursor', 'pointer')
    .on('mouseover', d => tip('show', {row: d[0], col: d[1], value: d[2]}))
    .on('mousemove', d => tip('move', d))
    .on('mouseout', d => tip('hide', d));
    // update
    sel = add.merge(sel);
    sel.transition(t3)
    .attr('width', p.gridWidth - (2 * p.margin.padding))
    .attr('height', p.gridHeight - (2 * p.margin.padding))
    .style('opacity', 1)
    .style('fill', d => d[2] === 0 ? p.colorNull : color(scale(d[2])));

    function addLegend(mode, g, data) {
      // Path
      sel = g.selectAll('path')
        .data(data, d => d);
      // exit
      sel.exit().transition(t1)
        .remove();
      // update
      sel.transition(t2)
        .attr('d', (d, i) => path(mode, d, i));
      // add
      add = sel.enter().append('path')
        .attr('id', d => `map${p.id}${mode}${d.replace(' ', '_')}`)
        .attr('d', (d, i) => path(mode, d, i))
        .style('pointer-events', 'none')
        .style('opacity', 0);
      // update
      sel = add.merge(sel);
      sel.transition(t3)
        .attr('d', (d, i) => path(mode, d, i));

      // Text
      sel = g.selectAll('text')
        .data(data, d => d);
      // exit
      sel.exit().transition(t1)
        .style('opacity', 0)
        .remove();
      // add
      add = sel.enter().append('text')
        .attr('text-anchor', 'left')
        .attr('dy', '0.5ex')
        .style('pointer-events', 'none')
        .style('opacity', 0);
      add.append('textPath')
          .attr('xlink:href', d => `#map${p.id}${mode}${d.replace(' ', '_')}`)
          .text(d => d);
      // update
      sel = add.merge(sel);
      sel.transition(t3)
        .style('opacity', 1);
    }
  };

  function path(mode, d, i) {
    let path;
    let line = 0;
    if (mode === 'L') {
      line = i * p.gridHeight;
      path = `M${p.legend.padding},${line + (p.gridHeight / 2)} L${p.legend.left - p.legend.padding},${line + (p.gridHeight / 2)}`;
    } else if (mode === 'R') {
      line = i * p.gridHeight;
      path = `M${p.legend.padding},${line + (p.gridHeight / 2)} L${p.legend.right - p.legend.padding},${line + (p.gridHeight / 2)}`;
    } else if (mode === 'T') {
      line = i * p.gridWidth;
      path = `M${line + p.legend.padding},${p.legend.top - p.legend.padding} L${line + p.gridWidth - p.legend.padding},${p.legend.padding}`;
    } else if (mode === 'B') {
      line = i * p.gridWidth;
      path = `M${line + p.legend.padding},${p.legend.padding} L${line + p.gridWidth - p.legend.padding},${p.legend.bottom - p.legend.padding}`;
    } else {
      console.log('Error addLabel mode');
    }
    return path;
  }

  function tip(state, d) {
    if (state === 'show') {
      d4.select('#tip')
        .datum(d)
        .style('opacity', 1)
        .html(d => `Row: ${d.row}<br/>\nColumn: ${d.col}<br/>\nValue: ${d.value}`);
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
