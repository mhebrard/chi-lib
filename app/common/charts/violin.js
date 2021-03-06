import {ascending, extent, histogram, max, mean, quantile, range} from 'd3-array';
import {axisLeft, axisRight} from 'd3-axis';
import {scaleOrdinal, scaleLinear} from 'd3-scale';
import {area, line, curveBasis, curveCatmullRom, curveLinear, curveStepAfter} from 'd3-shape';
import {select, selectAll} from 'd3-selection';
import {transition} from 'd3-transition';

// test d3 version Map d3v4
/* global d3:true */
let d4 = {};
if (d3 === 'undefined' || d3.version) {
  d4 = {
    ascending, extent, histogram, max, mean, quantile, range,
    axisLeft, axisRight,
    scaleOrdinal, scaleLinear,
    area, line, curveBasis, curveCatmullRom, curveLinear, curveStepAfter,
    select, selectAll,
    transition
  };
} else {
  d4 = d3;
}

export default function Chart(p) {
  const chart = {version: 1.1};

  // PARAMETERS
  p = p || {};
  p.div = p.div || 'body';
  p.id = p.id || 'view';
  p.options = p.options || null;
  p.data = p.data || {serie: [0, 1]};
  p.title = p.title || `Violin plot of ${p.id}`;
  p.titleSize = p.titleSize || 20;
  p.fontSize = p.fontSize || 14;
  // p.width // adjust according to series number
  p.height = p.height || 600;
  p.margin = p.margin || {top: 30, bottom: 40, left: 50, right: 50};
  p.layouts = p.layouts || {violin: true, box: true, bar: false, beeswarm: false};
  p.ymin = p.ymin || null;
  p.ymax = p.ymax || null;
  p.catWidth = p.catWidth || 100;
  p.catSpacing = p.catSpacing || 20;
  p.strokeWidth = p.strokeWidth || 3;
  p.resolution = p.resolution || 10;
  p.interpolation = p.interpolation || 'catmull'; // catmull | basis | linear | step
  p.xScale = p.xScale === 'each' ? 'each' : 'common'; // each | common
  p.bg = p.bg || ['#F88', '#A8F', '#AF8', '#8FF', '#FA8', '#F8F', '#8F8', '#88F', '#FF8', '#F8A', '#8FA', '#8AF'];
  p.fg = p.fg || ['#900', '#609', '#690', '#099', '#960', '#909', '#090', '#009', '#990', '#906', '#096', '#069'];

  const color = d4.scaleOrdinal(d4.range(12));
  const v = {};
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
      case 'setLayouts': {
        const a = action.payload;
        if (a.violin !== undefined) {
          p.layouts.violin = a.violin;
        }
        if (a.box !== undefined) {
          p.layouts.box = a.box;
        }
        if (a.bar !== undefined) {
          p.layouts.bar = a.bar;
        }
        if (a.beeswarm !== undefined) {
          p.layouts.beeswarm = a.beeswarm;
        }
        chart.update();
        break;
      }
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
      case 'basis':
        v.curve = d4.curveBasis;
        break;
      default: // CatmullRom
        v.curve = d4.curveCatmullRom;
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

    // Legend
    const sel = v.svg.append('g').attr('class', 'legend');
    sel.append('circle');
    sel.append('text');

    // Options
    if (p.options) {
      d4.select(`#${p.options}`).append('b').text('Layouts: ');
      d4.select(`#${p.options}`).selectAll('input')
        .data(Object.keys(p.layouts))
        .enter()
        .append('label')
        .attr('for', d => `layout-${d}`)
        .text(d => d)
        .append('input')
        .attr('type', 'checkbox')
        .attr('id', d => `layout-${d}`)
        .property('checked', d => p.layouts[d])
        .style('margin', '0 10px 0 5px')
        .on('change', layoutChange);
    }
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
    v.width = p.catSpacing + (keys.length * (p.catWidth + p.catSpacing)) + p.margin.left + p.margin.right;
    d4.select(`#${p.div}`).select('svg')
      .transition(t3)
      .attr('width', v.width);

    // update y axis domain
    // Set domain as [min-1, max+1]
    if (p.ymin === null) {
      v.domain[0] = Math.min(...sorted.map(s => s[0])) - 1;
    } else {
      v.domain[0] = p.ymin;
    }
    if (p.ymax === null) {
      v.domain[1] = Math.max(...sorted.map(s => s[s.length - 1])) + 1;
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
    // Violin X scale
    v.xV.domain(v.domain);

    /**//* // TEST BIN
    const data = [1,2,2,3,3,3,4,5,6,7,7,7,8,8,9,10];
    // Number of bars I wish to have
    const binCount = 20;
    // Scale based on data
    const scale = d4.scaleLinear()
    .domain(d4.extent(data))
    .rangeRound([0, 100]);

    // Using threshold(array)
    const bin = d4.histogram().thresholds(scale.ticks(binCount))(data);
    const binLng = bin.length;
    const binLast = bin[binLng - 1];
    console.log(`BIN TEST: lng:${binLng} - last:[${binLast.x0},${binLast.x1}]: ${binLast}`);
    // console.log('data', data, 'scale.domain', scale.domain[0], scale.domain[0], 'ticks', '20', 'bin', bin);
    *//**/ // SHOULD BE lng: 19 - last: [10,10]: 10 // JsFiddle works, Here bug

    v.bins = sorted.map(s => {
      if (s.length > 0) {
        return d4.histogram()
        .thresholds(v.xV.ticks(p.resolution))(s);
      }
      return [];
    });
    // console.log('bins', v.bins);
    // Violin Y scale
    if (p.xScale === 'common') { // same y scale for all series
      // violin width
      v.yViolinMax = Math.max(1, Math.max(...v.bins.map(b => {
        return Math.max(...b.map(vals => vals.length));
      })));
      v.yV.domain([0, v.yViolinMax]);
      // BarWidth
      v.barWidth = Math.max(2, Math.max(...v.bins.map(b => {
        if (b[1]) {
          return v.xV(b[1].x0) - v.xV(b[1].x1);
        }
        return 10;
      })));
      // Scale data to circles
      const radius = v.barWidth / 2;
      const circleMax = Math.floor(v.yV(0) / radius);
      v.valueByCircle = Math.floor(v.yViolinMax / circleMax);
      if (v.valueByCircle === 0) {
        v.valueByCircle = 1;
      }
      // Legend
      if (p.layouts.beeswarm) {
        sel = v.svg.select('.legend')
          .attr('transform', `translate(${v.width - 120}, ${p.height - (p.margin.bottom / 2)})`)
          .style('opacity', 1);
        sel.select('circle')
          .attr('cx', radius + 2)
          .attr('cy', radius + 2)
          .attr('r', radius)
          .style('fill', '#000')
          .style('stroke', '#000')
          .style('opacity', 1);

        sel.select('text')
          .attr('x', radius + 12)
          .attr('y', radius + 2)
          .attr('dy', '0.5ex')
          .text(() => v.valueByCircle === 1 ? '= 1' : `= 1 to ${v.valueByCircle}`)
          .style('opacity', 1);
      } else {
        v.svg.select('.legend').style('opacity', 0);
      }
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
      .attr('transform', (d, i) => `translate(${p.catSpacing + (i * (p.catWidth + p.catSpacing)) + p.margin.left}, 0)`);
    // add
    add = sel.enter().append('g')
      .attr('class', (d, i) => `serie ${keys[i]}`)
      .style('opacity', 0);
    // update
    sel = add.merge(sel);
    sel.transition(t3)
      .attr('transform', (k, i) => `translate(${p.catSpacing + (i * (p.catWidth + p.catSpacing)) + p.margin.left}, 0)`)
      .style('opacity', 1);

    keys.forEach((k, i) => {
      if (v.bins[i].length > 0) { // Data not null
        const g = d4.select(`#${p.div}`).select('svg').select(`.${k}`);
        // layouts order
        const lay = ['violin', 'bar', 'beeswarm', 'box'];
        lay.forEach(l => {
          g.selectAll('.' + l).data([l])
            .enter().append('g').attr('class', l);

          const sub = g.select('.' + l);
          if (p.layouts[l]) {
            sub.transition(t2).style('opacity', 1);
            switch (l) {
              case 'violin':
                addViolin(sub, v.bins[i], k);
                break;
              case 'bar':
                addBar(sub, v.bins[i], k);
                break;
              case 'beeswarm':
                addCircle(sub, v.bins[i], k);
                break;
              case 'box':
                addBoxPlot(sub, sorted[i], k, 0.10);
                break;
              default:
            }
          } else {
            sub.transition(t1).style('opacity', 0)
              .text(null);
          }
        });
        addLabel(g, k);
      }
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

      // Add plus curve
      sel = g.selectAll('.plus').data([0]);
      add = sel.enter().append('g').attr('class', 'plus')
        .attr('transform', `rotate(90,0,0)  translate(0,-${p.catWidth})`);
      add.append('path')
        .attr('class', 'area')
        .style('fill', p.bg[color(k)])
        .style('stroke', 'none');
      add.append('path')
          .attr('class', 'line')
          .style('fill', 'none')
          .style('stroke', '#000');
      // Add minus curve
      sel = g.selectAll('.minus').data([0]);
      add = sel.enter().append('g').attr('class', 'minus')
          .attr('transform', 'rotate(90,0,0) scale(1,-1)');
      add.append('path')
          .attr('class', 'area')
          .style('fill', p.bg[color(k)])
          .style('stroke', 'none');
      add.append('path')
          .attr('class', 'line')
          .style('fill', 'none')
          .style('stroke', '#000');
      // update
      g.selectAll('.area')
        .transition(t3)
        .attr('d', area(bins));
      g.selectAll('.line')
        .transition(t3)
        .attr('d', line(bins));
    }

    function addBar(g, bins, k) {
      // Violin Y scale
      if (p.xScale === 'each') { // y scale for each series
        // violin width
        v.yViolinMax = Math.max(1, Math.max(...bins.map(vals => vals.length)));
        v.yV.domain([0, v.yViolinMax]);
        // barWidth
        if (bins[1]) {
          v.barWidth = v.xV(bins[1].x0) - v.xV(bins[1].x1);
        } else {
          v.barWidth = 5;
        }
      }
      // Add plus
      sel = g.selectAll('.plus').data([0]);
      add = sel.enter().append('g').attr('class', 'plus')
        .attr('transform', `rotate(90,0,0)  translate(0,-${p.catWidth})`);
      // Add minus
      sel = g.selectAll('.minus').data([0]);
      add = sel.enter().append('g').attr('class', 'minus')
          .attr('transform', 'rotate(90,0,0) scale(1,-1)');
      // Update plus
      sel = g.selectAll('.plus').selectAll('rect').data(bins);
      // exit
      sel.exit()
        .transition(t1)
        .attr('width', 0)
        .attr('height', 0)
        .remove();
      // update
      // add
      add = sel.enter().append('rect')
        .style('fill', p.bg[color(k)])
        .style('stroke', '#000');
      // update
      sel = add.merge(sel);
      sel.transition(t3)
        .attr('x', d => v.xV(d.x0))
        .attr('y', d => v.yV(d.length))
        .attr('width', v.barWidth)
        .attr('height', d => v.yV(0) - v.yV(d.length));
      // Update minus
      sel = g.selectAll('.minus').selectAll('rect').data(bins);
      // exit
      sel.exit()
        .transition(t1)
        .attr('width', 0)
        .attr('height', 0)
        .remove();
      // update
      // add
      add = sel.enter().append('rect')
        .style('fill', p.bg[color(k)])
        .style('stroke', '#000');
      // update
      sel = add.merge(sel);
      sel.transition(t3)
        .attr('x', d => v.xV(d.x0))
        .attr('y', d => v.yV(d.length))
        .attr('width', v.barWidth)
        .attr('height', d => v.yV(0) - v.yV(d.length));
    }

    function addCircle(g, bins, k) {
      // Violin Y scale
      if (p.xScale === 'each') { // y scale for each series
        // violin width
        v.yViolinMax = Math.max(...bins.map(vals => vals.length));
        v.yV.domain([0, v.yViolinMax]);
        // barWidth
        if (bins[1]) {
          v.barWidth = v.xV(bins[1].x0) - v.xV(bins[1].x1);
        } else {
          v.barWidth = 10;
        }
        // Scale data to circles
        const radius = v.barWidth / 2 || 1;
        const circleMax = Math.floor(v.yV(0) / radius);
        v.valueByCircle = Math.floor(v.yViolinMax / circleMax);
        if (v.valueByCircle === 0) {
          v.valueByCircle = 1;
        }
        // Legend
        sel = g.selectAll(`.lc-${k}`).data([k]);
        add = sel.enter().append('circle').attr('class', `.lc-${k}`);
        sel = add.merge(sel);
        sel.attr('cx', v.x(0.5) - radius - 10)
          .attr('cy', p.height - (p.margin.bottom / 2) + (p.fontSize / 2))
          .attr('r', radius)
          .style('fill', p.bg[color(k)])
          .style('stroke', '#000')
          .style('opacity', 1);

        sel = g.selectAll(`.lt-${k}`).data([k]);
        add = sel.enter().append('text').attr('class', `.lt-${k}`);
        sel = add.merge(sel);
        sel.attr('x', v.x(0.5) + radius - 8)
          .attr('y', p.height - (p.margin.bottom / 2) + (p.fontSize / 2))
          .attr('dy', '0.5ex')
          .text(() => v.valueByCircle === 1 ? '= 1' : `= 1 to ${v.valueByCircle}`)
          .style('opacity', 1);
      }
      const radius = v.barWidth / 2;
      // Add graph
      sel = g.selectAll('g').data([k]);
      add = sel.enter().append('g')
        .attr('transform', `rotate(90,0,0)  translate(0,-${p.catWidth})`)
        .style('fill', p.bg[color(k)])
        .style('stroke', '#000');
      sel = add.merge(sel);
      // One groub by bin
      let sub = sel.selectAll('g').data(bins);
      // exit
      sub.exit()
        .transition(t1)
        .style('opacity', 0)
        .remove();
      // update
      sub.transition(t3)
        .attr('transform', d => `translate(${v.xV(d.x0)}, ${v.yV(0)})`);
      // add
      add = sub.enter().append('g')
        .attr('transform', d => `translate(${v.xV(d.x0)}, ${v.yV(0)})`);
      // update
      sub = add.merge(sub);

      // Circles
      sel = sub.selectAll('circle').data(d => {
        // transform data to circles
        const value = d.length;
        const draw = [];
        if (value > 0) { // value exist
          // nb circle
          const c = Math.ceil(value / v.valueByCircle);
          // circle center
          let center = 0;
          if (c % 2 !== 0) { // nb of circle odd
            // draw central circle
            draw.push(center);
            center += radius;
          }
          while (draw.length < c) {
            // draw symmetric circles
            center += radius;
            draw.push(center);
            draw.push(-center);
            center += radius;
          }
        }
        return draw;
      });
      // exit
      sel.exit()
        .transition(t1)
        .attr('r', 0)
        .remove();
      // update
      // add
      add = sel.enter().append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 0);
      // update
      sel = add.merge(sel);
      sel.transition(t3)
        .attr('cy', d => d)
        .attr('r', radius);
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

      sel = g.selectAll('.box').data([k]);
      add = sel.enter();
      add.append('rect')
        .attr('class', 'box')
        .style('fill', p.bg[color(k)])
        .style('stroke', p.fg[color(k)])
        .style('stroke-width', p.strokeWidth);
      add.selectAll('.iSH').data(iSH)
        .enter().append('line')
        .attr('class', 'ISH')
        .style('stroke', p.fg[color(k)])
        .style('stroke-width', p.strokeWidth);
      add.selectAll('iSV').data(iSV)
        .enter().append('line')
        .attr('class', 'ISV')
        .style('stroke', p.fg[color(k)])
        .style('stroke-width', p.strokeWidth);
      add.selectAll('.mean').data([k])
        .enter().append('circle')
        .attr('class', 'mean')
        .style('fill', p.bg[color(k)])
        .style('stroke', '#000')
        .attr('r', v.x(boxPlotWidth / 5));
      // update
      // sel = d4.select(g.node());
      g.select('.box')
        .transition(t3)
        .attr('x', v.x(left))
        .attr('width', v.x(right) - v.x(left))
        .attr('y', probs[3] || 0)
        .attr('height', -probs[3] + probs[1] || 0);
      g.selectAll('.ISH')
        .transition(t3)
        .attr('x1', v.x(left))
        .attr('x2', v.x(right))
        .attr('y1', d => probs[d] || 0)
        .attr('y2', d => probs[d] || 0);
      g.selectAll('.ISV')
        .transition(t3)
        .attr('x1', v.x(0.5))
        .attr('x2', v.x(0.5))
        .attr('y1', d => probs[d[0]] || 0)
        .attr('y2', d => probs[d[1]] || 0);
      g.selectAll('.mean')
        .transition(t3)
        .attr('cx', v.x(0.5))
        .attr('cy', v.y(d4.mean(vals)) || 0);
    }

    function addLabel(g, label) {
      g.selectAll('text').data([label])
        .enter().append('text')
        .attr('class', 'label')
        .attr('x', v.x(0.5))
        .attr('y', p.height - (p.margin.bottom / 2))
        .attr('dy', '-0.5ex')
        .attr('text-anchor', 'middle')
        .style('fill', '#000')
        .text(label);
    }
  };

  function layoutChange() {
    d4.select(this).each(d => {
      p.layouts[d] = this.checked;
      chart.update();
    });
  }
  // RETURN
  return chart;
}
