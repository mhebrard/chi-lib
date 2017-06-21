import {scaleLinear, scaleSequential} from 'd3-scale';
import {interpolateOranges} from 'd3-scale-chromatic';
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
    scaleLinear, scaleSequential,
    interpolateOranges
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
  p.data = p.data || {serieA: [{name: 'root', size: 1}]};
  p.title = p.title || `Heatmap of ${p.id}`;
  p.titleSize = p.titleSize || 20;
  p.fontSize = p.fontSize || 14;
  p.width = p.width || 800;
  p.height = p.height || 400;
  p.margin = p.margin || {top: 30, bottom: 5, left: 5, right: 5};
  p.legend = p.legend || {top: 100, bottom: 100, left: 100, right: 100};
  // p.color = p.color || d4.schemeSet3;
  p.cornerRadius = p.cornerRadius || 3;
  p.padding = p.padding || 1;

  const color = d4.scaleSequential(d4.interpolateOranges);
  const scale = d4.scaleLinear().range([0.000, 1.000]);
  p.max = 0;
  p.labelX = [];
  p.labelY = [];
  p.heatmap = [];

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
    .attr('transform', `translate(${p.margin.left + p.legend.left}, ${p.margin.top + p.legend.top})`)
    .classed('rects', true);

    // group for legend
    svg.append('g')
    .attr('transform', `translate(${p.margin.left + p.legend.left}, ${p.margin.top})`)
    .classed('legendTop', true)
    .append('text').attr('html', '<h3>legend Top</h3>');
    svg.append('g')
    .attr('transform', `translate(${p.margin.left + p.legend.left}, ${p.height - p.margin.bottom - p.legend.bottom})`)
    .classed('legendBottom', true)
    .append('text').attr('html', '<h3>legend Bottom</h3>');
    svg.append('g')
    .attr('transform', `translate(${p.margin.left}, ${p.height - p.margin.bottom})`)
    .classed('legendLeft', true);
    /* ********************************************* */
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
    // Parse data
    Object.keys(p.data).forEach(row => {
      // Define Y label and index
      let y = p.labelY.indexOf(row);
      if (y < 0) {
        y = p.labelY.length;
        p.labelY.push(row);
      }
      p.data[row].forEach(cell => {
        // Define X label and index
        let x = p.labelX.indexOf(cell.name);
        if (x < 0) {
          x = p.labelX.length;
          p.labelX.push(cell.name);
        }
        // Populate heatmap
        if (p.heatmap[x] === undefined) {
          p.heatmap[x] = [];
        }
        p.heatmap[x][y] = cell.size;
        p.max = Math.max(p.max, cell.size);
      });
    });
    // grid
    p.gridWidth = (p.width - p.margin.left - p.margin.right) / p.labelX.length;
    p.gridHeight = (p.height - p.margin.top - p.margin.bottom) / p.labelY.length;
    scale.domain([0, p.max]);

    // C console.log('heatmap', p.heatmap);

    // display data
    const rects = d4.select(`#${p.id}`).select('.rects');
    const labelsX = d4.select(`#${p.id}`).select('.labelsX');
    const labelsY = d4.select(`#${p.id}`).select('.labelsY');

    p.labelY.sort().forEach((row, j) => {
      // Display labels
      const line = (j * p.gridHeight) + (p.gridHeight / 2);
      labelsY.append('path')
        .attr('id', `map${row}`)
        .attr('d', `M${p.padding},${line} L${p.margin.right - p.padding},${line}`)
        .style('opacity', 0);
      labelsY.append('text')
        .attr('text-anchor', 'left')
        .attr('dy', '0.5ex')
        .style('pointer-events', 'none')
        .append('textPath')
          .attr('xlink:href', `#map${row}`)
          .text(row);

      // Define X index
      const y = p.labelY.indexOf(row);
      p.labelX.sort().forEach((cell, i) => {
        const x = p.labelX.indexOf(cell);
        // C console.log('x', i * p.gridWidth, 'y', j * p.gridHeight, p.heatmap[x][y]);
        // Create rect
        rects.append('rect')
          .datum(p.heatmap[x][y] || 0)
          .attr('x', (i * p.gridWidth) + p.padding)
          .attr('y', (j * p.gridHeight) + p.padding)
          .attr('width', p.gridWidth - (2 * p.padding))
          .attr('height', p.gridHeight - (2 * p.padding))
          .attr('rx', p.cornerRadius)
          .attr('ry', p.cornerRadius)
          .style('opacity', 1)
          .style('fill', d => color(scale(d)))
          .style('fill-rule', 'evenodd')
          .style('stroke', '#000')
          .style('cursor', 'pointer')
          .on('mouseover', d => tip('show', {x: cell, y: row, size: d}))
          .on('mousemove', d => tip('move', d))
          .on('mouseout', d => tip('hide', d));
      });
    });

    p.labelX.sort().forEach((col, i) => {
      // Display labels
      const line = (i * p.gridWidth) + (p.gridWidth / 2);
      labelsX.append('path')
        .attr('id', `map${col}`)
        .attr('d', `M${line},${p.padding} L${line},${p.margin.bottom - p.padding}`)
        .style('opacity', 0);
      labelsX.append('text')
        .attr('text-anchor', 'left')
        .attr('dy', '0.5ex')
        .style('pointer-events', 'none')
        .append('textPath')
          .attr('xlink:href', `#map${col}`)
          .text(col);
    });
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
        y = d3.event.clientY;
        x = d3.event.clientX;
      }
      d4.select('#tip')
        .style('top', `${y - 10}px`)
        .style('left', `${x + 10}px`);
    }
  }

  return chart;
}
