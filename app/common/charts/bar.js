import {axisBottom, axisLeft, axisRight} from 'd3-axis';
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
    axisBottom, axisLeft, axisRight,
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
  const chart = {version: '2.2.1'};

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
  p.legend = p.legend || {inner: true, padding: 5, bottom: 100, left: 50, right: 50};
  p.color = p.color || d4.schemeSet3;
  p.barWidth = p.barWidth || 0;
  p.barPadding = p.barPadding || 0.1;
  p.cutoff = p.cutoff || null;
  if (p.sort === undefined) {
    p.sort = (a, b) => b.size - a.size;
  }

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
      case 'enableSwitch':
        action.payload.node.disabled = !action.payload.node.disabled;
        chart.update();
        break;
      case 'enableSingle':
        // Disable all nodes
        p.data.serie.forEach(d => {
          d.disabled = true;
        });
        // enable clicked node
        action.payload.node.disabled = false;
        chart.update();
        break;
      case 'enableAll':
        // Enable all nodes
        p.data.serie.forEach(d => {
          d.disabled = false;
        });
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
    v.y = d4.scaleLinear()
    .rangeRound([p.height - p.margin.bottom - p.legend.bottom, p.margin.top]);

    // Axis
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

    // group for legendRight need to be under visual elements
    v.svg.append('g').classed('legendRight', true)
    .attr('transform', `translate(${p.margin.left + p.legend.left}, 0)`);

    // group for visual elements
    v.svg.append('g').classed('bars', true);

    // group for legend
    v.svg.append('g').classed('legendInner', true);
    v.svg.append('g').classed('legendBottom', true)
    .attr('transform', `translate(0, ${p.height - p.margin.bottom - p.legend.bottom})`);
    v.svg.append('g').classed('legendLeft', true)
    .attr('transform', `translate(${p.margin.left + p.legend.left}, 0)`);
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
    .sort(p.sort);

    v.total = filtered.reduce((tot, r) => {
      // Sum data
      tot += r.size;
      return tot;
    }, 0);

    // Bar width (grid)
    // If barWidth is defined, size accordingly
    // else size according to width / height
    if (p.barWidth > 0) {
      // calculate width according to data
      p.width = p.margin.left + p.legend.left + (filtered.length * p.barWidth) + p.legend.right + p.margin.right;
    }

    // Scale
    v.x.domain(filtered.map(d => d.name))
    .rangeRound([p.margin.left + p.legend.left, p.width - p.margin.right - p.legend.right])
    .padding(p.barPadding);

    v.y.domain([0, d3.max(filtered, d => d.size)]);

    // Axis
    v.xAxisBottom = d4.axisBottom(v.x);
    v.yAxisLeft = d4.axisLeft(v.y);
    v.yAxisRight = d4.axisRight(v.y)
    .tickSize(p.width - p.margin.left - p.legend.left - p.margin.right - p.legend.right, 0);

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

    // Update axis
    if (p.legend.bottom > 0) {
      v.svg.select('.legendBottom')
        .transition(t2)
        .call(v.xAxisBottom)
        .selectAll('text')
        .attr('transform', 'rotate(-30)')
        .style('text-anchor', 'end')
        .attr('dx', '-1ex')
        .attr('dy', '1ex');
    }
    if (p.legend.left > 0) {
      v.svg.select('.legendLeft')
        .transition(t2)
        .call(v.yAxisLeft);
    }
    if (p.legend.right > 0) {
      v.svg.select('.legendRight')
        .transition(t2)
        .call(v.yAxisRight);
    }

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
    sel.transition(t1)
      .style('fill', d => d.disabled ? '#eee' : color(d.name))
      .style('stroke', d => d.disabled ? '#fff' : '#000');
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
      .style('fill-rule', 'evenodd')
      .style('cursor', 'pointer')
      .on('click', d => clickHandler(d))
      .on('contextmenu', d => leftClickHandler(d))
      .on('mouseover', d => tip('show', d))
      .on('mousemove', d => tip('move', d))
      .on('mouseout', d => tip('hide', d));
    // update
    sel = add.merge(sel);
    sel.transition(t3)
    .attr('y', d => v.y(d.size))
    .attr('height', d => v.y(0) - v.y(d.size))
    .style('fill', d => d.disabled ? '#eee' : color(d.name))
    .style('stroke', d => d.disabled ? '#fff' : '#000')
    .style('opacity', 1);

    // legend
    if (p.legend.inner) {
      const g = v.svg.select('.legendInner');
      // Update path
      sel = g.selectAll('path')
        .data(filtered, d => d.name);
      // exit
      sel.exit().transition(t1)
        .attr('d', d => path('hide', d))
        .remove();
      // update
      sel.transition(t2)
        .attr('d', d => path('show', d));
      // add
      add = sel.enter().append('path')
        .attr('id', d => `map${p.id}${d.name.replace(' ', '_')}`)
        .attr('d', d => path('hide', d))
        .style('pointer-events', 'none')
        .style('opacity', 0);
      // update
      sel = add.merge(sel);
      sel.transition(t3)
      .attr('d', d => path('show', d));

      // Update labels
      sel = g.selectAll('text')
        .data(filtered, d => d.name);
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
        .attr('xlink:href', d => `#map${p.id}${d.name.replace(' ', '_')}`)
        .text(d => d.name);
    }
  };

  function path(mode, d) {
    const x = v.x(d.name) + (v.x.bandwidth() / 2);
    if (mode === 'hide') {
      return `M${x}, ${v.y(0) - p.legend.padding} V${v.y(0) - p.legend.padding - 1}`;
    } // Else mode === 'show'
    return `M${x}, ${v.y(0) - p.legend.padding} V${v.y(d.size) + p.legend.padding}`;
  }

  function clickHandler(d) {
    const e = d3sel.event ? d3sel.event : d3.event;
    if (e.shiftKey || e.ctrlKey) {
      // Shift + Click or Ctrl + Click = enableSwitch
      p.dispatch({type: 'enableSwitch', payload: {node: d, chart: p.id}});
    } else {
      // Click = Deselect all and select only clicked node
      p.dispatch({type: 'enableSingle', payload: {node: d, chart: p.id}});
    }
  }

  function leftClickHandler() {
    const e = d3sel.event ? d3sel.event : d3.event;
    e.preventDefault();
    // Left Click = select all
    p.dispatch({type: 'enableAll', payload: {chart: p.id}});
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
      const e = d3sel.event ? d3sel.event : d3.event;
      y = e.pageY;
      x = e.pageX;
      d4.select('#tip')
        .style('top', `${y - 10}px`)
        .style('left', `${x + 10}px`);
    }
  }

  return chart;
}
