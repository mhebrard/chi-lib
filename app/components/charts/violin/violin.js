import {ascending, histogram, max, quantile, mean} from 'd3-array';
import {axisLeft, axisRight} from 'd3-axis';
import {scaleOrdinal, scaleLinear} from 'd3-scale';
import {schemeSet3} from 'd3-scale-chromatic';
import {area, line, curveBasis, curveLinear, curveStepAfter} from 'd3-shape';
import {select, selectAll} from 'd3-selection';
import {transition} from 'd3-transition';

// test d3 version Map d3v4
let d4 = {};
if (d3.version) { // d3v3.x present as global
  d4 = {
    ascending, histogram, max, quantile, mean,
    axisLeft, axisRight,
    scaleOrdinal, scaleLinear,
    schemeSet3,
    area, line, curveBasis, curveLinear, curveStepAfter,
    select, selectAll,
    transition
  };
} else { // d3v4 present as global
  d4 = d3;
}

export default function Chart(p) {
  const chart = {version: 1.0};

  // PARAMETERS
  p = p || {};
  p.div = p.div || 'body';
  p.id = p.id || 'view';
  p.data = p.data || {serie: [0, 1]};
  p.title = p.title || `Violin plot of ${p.id}`;
  p.titleSize = p.titleSize || 18;
  p.fontSize = p.fontSize || 14;
  // p.width // adjust according to series number
  p.height = p.height || 600;
  p.margin = p.margin || {top: 30, bottom: 30, left: 50, right: 50};
  p.ymin = p.ymin || null;
  p.ymax = p.ymax || null;
  p.catWidth = p.catWidth || 100;
  p.catSpacing = p.catSpacing || 20;
  p.color = p.color || null;
  p.violinStroke = p.violinStroke || '#000';
  p.boxFill = p.boxFill || '#fff';
  p.boxStroke = p.boxStroke || '#000';
  p.meanColor = p.meanColor || '#000';
  p.labelColor = p.labelColor || '#000';
  p.resolution = p.resolution || 10;
  p.interpolation = p.interpolation || 'basis'; // basis | linear | step
  p.xScale = p.xScale === 'common' ? 'common' : 'each'; // each | common

  const color = d4.scaleOrdinal(p.color ? p.color : d4.schemeSet3);
  const v = {}; // initial variables

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
    // svg width (adjust according to series number)
    v.width = 300;
    // domain Y
    v.domain = [0, 1];
    // curve
    v.curve = '';
    switch (p.interpolation) {
      case 'linear':
        v.curve = d4.curveLinear;
        break;
      case 'step':
        v.curve = d4.curveStepAfter;
        break;
      default: // basis
        v.curve = d4.curveBasis;
    }
    // Scales
    v.y = d4.scaleLinear()
      .range([p.height - p.margin.bottom, p.margin.top]);

    v.x = d4.scaleLinear()
      .range([0, p.catWidth]);

    v.yV = d4.scaleLinear()
      .range([p.catWidth / 2, 0]);

    v.xV = d4.scaleLinear()
      .range([p.height - p.margin.bottom, p.margin.top])
      .nice();

    // Axis
    v.yAxisOut = d4.axisLeft(v.y)
      .ticks(5)
      .tickSize(5, 0);

    v.yAxisIn = d4.axisRight(v.y)
      .ticks(5)
      .tickSize(v.width - p.margin.right - p.margin.left, 0);

    // SVG
    v.svg = d4.select(`#${p.div}`).append('svg')
      .attr('id', p.id)
      .attr('title', p.title)
      .attr('width', v.width)
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
      .attr('transform', `translate(${p.margin.left},0)`)
      .call(v.yAxisOut);

    v.svg.append('g')
      .attr('class', 'axis yIn')
      .attr('transform', `translate(${p.margin.left},0)`)
      .call(v.yAxisIn);
  };

  // accessor
  chart.data = function(d) {
    if (d) {
      p.data = d;
    }
    return p.data;
  };

  chart.update = function() {
    // console.log('UPDATE');
    // series
    const keys = Object.keys(p.data).sort(d4.ascending);
    const sorted = keys.map(k => p.data[k].sort(d4.ascending));

    // update pattern
    let sel;
    let add;
    // transitions
    const delay = 500;
    const t1 = d4.transition().duration(delay);
    const t2 = d4.transition().delay(delay).duration(delay);
    const t3 = d4.transition().delay(delay * 2).duration(delay);

    // AXIS
    // update width
    v.width = (keys.length * (p.catWidth + p.catSpacing)) + p.margin.left + p.margin.right;
    d4.select(`#${p.div}`).select('svg')
      .transition(t3)
      .attr('width', v.width);

    // update y axis domain
    if (p.ymin === null) {
      v.domain[0] = Math.min(...sorted.map(s => s[0]));
    } else {
      v.domain[0] = p.ymin;
    }
    if (p.ymax === null) {
      v.domain[1] = Math.max(...sorted.map(s => s[s.length - 1]));
    } else {
      v.domain[1] = p.ymax;
    }
    v.y.domain(v.domain);

    // update Axis ticks
    v.yAxisOut = d4.axisLeft(v.y)
      .ticks(5)
      .tickSize(5, 0);

    v.yAxisIn = d4.axisRight(v.y)
      .ticks(5)
      .tickSize(v.width - p.margin.right - p.margin.left, 0);

    // update axis
    v.svg.select('.yOut')
      .transition(t3)
      .call(v.yAxisOut);
    v.svg.select('.yIn')
      .transition(t3)
      .call(v.yAxisIn);

    // VIOLIN
    // bins list of sorted data
    v.bins = sorted.map(s => {
      return d4.histogram()
      .thresholds(p.resolution)(s);
    });

    // Violin X scale
    v.xV.domain(v.domain);
    // Violin Y scale
    if (p.xScale === 'common') { // same y scale for all series
      // violin width
      v.yViolinMax = Math.max(...v.bins.map(b => {
        return Math.max(...b.map(vals => vals.length));
      }));
      v.yV.domain([0, v.yViolinMax]);
    }

    // violin group
    sel = d4.select(`#${p.div}`).select('svg').selectAll('.serie')
      .data(keys, k => k);
    // exit
    sel.exit().transition(t1)
      .style('opacity', 0)
      .remove();
    // update
    sel.transition(t2)
      .attr('transform', (d, i) => `translate(${(i * (p.catWidth + p.catSpacing)) + p.margin.left}, 0)`);
    // add
    add = sel.enter().append('g')
      .attr('class', (d, i) => `serie ${keys[i]}`)
      .style('opacity', 0);
    // update
    sel = add.merge(sel);
    sel.transition(t3)
      .attr('transform', (k, i) => `translate(${(i * (p.catWidth + p.catSpacing)) + p.margin.left}, 0)`)
      .style('opacity', 1);

    keys.forEach((k, i) => {
      const g = d4.select(`#${p.div}`).select('svg').select(`.${k}`);
      addViolin(g, v.bins[i], k);
      addBoxPlot(g, sorted[i], k, 0.10);
      addLabel(g, k);
    });

    function addViolin(g, bins, k) {
      // Violin Y scale
      if (p.xScale === 'each') { // y scale for each series
        // violin width
        v.yViolinMax = Math.max(...bins.map(vals => vals.length));
        v.yV.domain([0, v.yViolinMax]);
      }
      // shapes
      const area = d4.area()
        .curve(v.curve)
        .x(d => v.xV(d.x0))
        .y0(p.catWidth / 2)
        .y1(d => v.yV(d.length));

      const line = d4.line()
        .curve(v.curve)
        .x(d => v.xV(d.x0))
        .y(d => v.yV(d.length));

      // histogram
      sel = g.selectAll('.histo').data([k]);
      // exit // update
      // add
      add = sel.enter().append('g')
        .attr('class', 'histo');
      let sub = add.append('g')
        .attr('class', 'plus')
        .attr('transform', `rotate(90,0,0)  translate(0,-${p.catWidth})`);
      sub.append('path')
        .attr('class', 'area')
        .style('fill', color(k))
        .style('stroke', 'none');
      sub.append('path')
          .attr('class', 'line')
          .style('fill', 'none')
          .style('stroke', p.violinStroke);
      sub = add.append('g')
          .attr('class', 'minus')
          .attr('transform', 'rotate(90,0,0) scale(1,-1)');
      sub.append('path')
          .attr('class', 'area')
          .style('fill', color(k))
          .style('stroke', 'none');
      sub.append('path')
          .attr('class', 'line')
          .style('fill', 'none')
          .style('stroke', p.violinStroke);
      // update
      sel = add.merge(sel);
      sel.selectAll('.area')
        .transition(t3)
        .attr('d', area(bins));
      sel.selectAll('.line')
        .transition(t3)
        .attr('d', line(bins));
    }

    function addBoxPlot(g, vals, k, boxPlotWidth) {
      const left = 0.5 - (boxPlotWidth / 2);
      const right = 0.5 + (boxPlotWidth / 2);

      const probs = [0.05, 0.25, 0.5, 0.75, 0.95];
      for (let i = 0; i < probs.length; i++) {
        probs[i] = v.y(d4.quantile(vals, probs[i]));
      }

      const iSH = [0, 2, 4];
      const iSV = [[0, 1], [3, 4]];

      sel = g.selectAll('.boxplot').data([k]);
      // exit // update
      // add
      add = sel.enter().append('g')
        .attr('class', 'boxplot');
      add.selectAll('.box').data([k])
        .enter().append('rect')
        .attr('class', 'box')
        .style('fill', p.boxFill)
        .style('stroke', p.boxStroke);
      add.selectAll('.iSH').data(iSH)
        .enter().append('line')
        .attr('class', 'ISH')
        .style('fill', p.boxStroke)
        .style('stroke', p.boxStroke);
      add.selectAll('iSV').data(iSV)
        .enter().append('line')
        .attr('class', 'ISV')
        .style('stroke', p.boxStroke);
      add.selectAll('.mean').data([k])
        .enter().append('circle')
        .attr('class', 'mean')
        .style('fill', p.meanColor)
        .style('stroke', p.boxStroke)
        .attr('r', v.x(boxPlotWidth / 5));
      // update
      sel = d4.select(g.node());
      sel.select('.box')
        .transition(t3)
        .attr('x', v.x(left))
        .attr('width', v.x(right) - v.x(left))
        .attr('y', probs[3])
        .attr('height', -probs[3] + probs[1]);
      sel.selectAll('.ISH')
        .transition(t3)
        .attr('x1', v.x(left))
        .attr('x2', v.x(right))
        .attr('y1', d => probs[d])
        .attr('y2', d => probs[d]);
      sel.selectAll('.ISV')
        .transition(t3)
        .attr('x1', v.x(0.5))
        .attr('x2', v.x(0.5))
        .attr('y1', d => probs[d[0]])
        .attr('y2', d => probs[d[1]]);
      sel.selectAll('.mean')
        .transition(t3)
        .attr('cx', v.x(0.5))
        .attr('cy', v.y(d4.mean(vals)));
    }

    function addLabel(g, label) {
      g.append('text')
        .attr('class', 'label')
        .attr('x', v.x(0.5))
        .attr('y', p.height - (p.margin.bottom / 2))
        .attr('dy', '-0.5ex')
        .attr('text-anchor', 'middle')
        .style('fill', p.labelColor)
        .text(label);
    }
  };

  // RETURN
  return chart;
}
