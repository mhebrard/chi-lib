import {hierarchy, treemap} from 'd3-hierarchy';
import {transition} from 'd3-transition';
import {scaleOrdinal} from 'd3-scale';
import {schemeSet3} from 'd3-scale-chromatic';
import {line, curveLinear} from 'd3-shape';
// workaround for event manager (d3sel.event)
import * as d3sel from 'd3-selection';

// test d3 version Map d3v4
/* global d3:true */
let d4 = {};
if (d3 === 'undefined' || d3.version) {
  d4 = {
    select: d3sel.select,
    selectAll: d3sel.selectAll,
    hierarchy, treemap,
    transition,
    scaleOrdinal,
    schemeSet3,
    line, curveLinear
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
  p.data = p.data || {name: 'root', size: 1};
  p.title = p.title || `Treemap of ${p.id}`;
  p.titleSize = p.titleSize || 20;
  p.fontSize = p.fontSize || 14;
  p.width = p.width || 800;
  p.height = p.height || 600;
  p.margin = p.margin || {top: 30, bottom: 0, left: 0, right: 0};
  p.color = p.color || d4.schemeSet3;

  const color = d4.scaleOrdinal(p.color);

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
      /*
      case 'collapse':
        action.node.collapsed = true;
        collapse(action.node);
        chart.update();
        break;
      case 'expand':
        action.node.collapsed = false;
        expand(action.node);
        chart.update();
        break;
      case 'hover':
        action.node.hover = true;
        hover(action.node);
        break;
      case 'hoverOut':
        action.node.hover = false;
        hoverOut(action.node);
        break;
      */
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
    .attr('transform', `translate(${p.margin.left}, ${p.margin.top + 20})`) // margin left, top
    .classed('rects', true);

    // group for labels
    svg.append('g')
    .attr('transform', `translate(${p.margin.left}, ${p.margin.top + 20})`) // margin left, top
    .classed('labels', true);

    // group for header (current zoom)
    const header = svg.append('g')
    .attr('transform', `translate(${p.margin.left}, ${p.margin.top})`) // margin left, top
    .classed('header', true)
    .style('font-size', '14px');
    // create visual element rect
    header.append('rect')
    .attr('y', 0)
    .attr('width', p.width - p.margin.left - p.margin.right)
    .attr('height', 20)
    .style('fill', '#888')
    .style('cursor', 'pointer');
		// create text element
    header.append('text')
    .attr('x', 6)
    .attr('y', 4)
    .attr('dy', '.75em')
    // .style('pointer-events', 'none')
    .text('Root');
  };

  // accessor
  chart.data = function(d) {
    if (d) {
      p.data = d;
    }
    return p.data;
  };

  chart.update = function() {
    console.log('chart.update');
    // layout
    const root = d4.hierarchy(p.data);
    d4.treemap()
      .size([
        p.width - p.margin.left - p.margin.right,
        p.height - p.margin.top - p.margin.bottom - 20// header + stroke
      ])
      .round(false)
      .padding(2)(root.sum(d => d.size));

    console.log('root', root);
    // link root to header
    d4.select(`#${p.id}`).select('.header')
    .select('rect').datum(root)
    .on('mouseover', d => tip('show', d))
    .on('mousemove', d => tip('move', d))
    .on('mouseout', d => tip('hide', d));

    // update pattern
    let sel;
    let add;
    // transitions
    const delay = 500;
    const t1 = d4.transition().duration(delay);
    const t2 = d4.transition().delay(delay).duration(delay);
    const t3 = d4.transition().delay(delay * 2).duration(delay);

    // rects
    sel = d4.select(`#${p.id}`).select('.rects').selectAll('rect') // width > 0 & height > 0
      .data(root.descendants().filter(d => d.x1 - d.x0 > 0 && d.y1 - d.y0 > 0), d => id(d));
    // exit
    sel.exit().transition(t1)
      .attr('transform', 'translate(0,0)')
      .attr('width', 0)
      .attr('height', 0)
      .style('opacity', 0)
      .remove();
    // update
    sel.transition(t2)
      .attr('transform', d => `translate(${d.x0}, ${d.y0})`)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0);
    // add
    add = sel.enter().append('rect')
      .attr('class', d => 'v' + id(d))
      .attr('transform', 'translate(0,0)')
      .attr('width', 0)
      .attr('height', 0)
      .style('opacity', 0)
      .style('fill', d => color(d.data.name))
      .style('stroke', '#000')
      .style('cursor', 'pointer')
      .on('mouseover', d => tip('show', d))
      .on('mousemove', d => tip('move', d))
      .on('mouseout', d => tip('hide', d));

    // update
    sel = add.merge(sel);
    sel.transition(t3)
    .attr('transform', d => `translate(${d.x0}, ${d.y0})`)
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .style('opacity', 1);

    // path
    sel = d4.select(`#${p.id}`).select('.labels').selectAll('path') // width > 0 & height > 0
      .data(root.descendants().filter(d => !d.children && d.x1 - d.x0 > 0 && d.y1 - d.y0 > 0), d => id(d));
    // exit
    sel.exit().transition(t1)
      .attr('d', 'M0,0L0,0')
      .style('opacity', 0)
      .remove();
    // update
    sel.transition(t2)
      .attr('d', (d, i) => line(d, i));
    // add
    add = sel.enter().append('path')
      .attr('id', d => `map${p.id}` + id(d))
      .attr('d', 'M0,0L0,0')
      .style('opacity', 0);

    // update
    sel = add.merge(sel);
    sel.transition(t3)
    .attr('d', (d, i) => line(d, i));

    // text
    sel = d4.select(`#${p.id}`).select('.labels').selectAll('text') // width > 0 & height > 0
      .data(root.descendants().filter(d => !d.children && d.x1 - d.x0 > 0 && d.y1 - d.y0 > 0), d => id(d));
    // exit
    sel.exit().transition(t1)
      .remove();
    // add
    add = sel.enter().append('text')
      .attr('class', d => 't' + id(d))
      .attr('text-anchor', 'left')
      .attr('dy', '0.5ex')
      .style('pointer-events', 'none')
      .append('textPath')
        .attr('xlink:href', d => `#map${p.id}` + id(d))
        .text(d => d.data.name);
  };

  function line(d) {
    let ax;
    let ay;
    let bx;
    let by;
    const mw = 5; // margin width
    const mh = 22; // margin height
    const rw = d.x1 - d.x0; // rect width
    const rh = d.y1 - d.y0; // rect height

    if (rw < rh) {// vertical
      ax = d.x0 + (rw / 2);
      ay = d.y0;
      bx = ax;
      by = d.y1;
      // margin && min width
      if (ay + mw < by - mw && rw > mh) {
        ay += mw;
        by -= mw;
      } else {
        by = ay;
      }
    } else { // horizontal
      ax = d.x0;
      ay = d.y0 + (rh / 2);
      bx = d.x1;
      by = ay;
      // margin && min height
      if (ax + mw < bx - mw && rh > mh) {
        ax += mw;
        bx -= mw;
      } else {
        bx = ax;
      }
    }

    const path = d4.line()
			.x(t => t[0])
			.y(t => t[1])
			.curve(d4.curveLinear);

    return path([[ax, ay], [bx, by]]);
  }

  function tip(state, d) {
    if (state === 'show') {
      d4.select('#tip')
        .datum(d)
        .style('opacity', 1)
        .html(d => {
          let txt = `name: ${d.data.name}
          <br/>value: ${f(d.value)}`;
          if (d.data.data) {
            Object.keys(d.data.data).forEach(k => {
              txt += `<br/>${k}: ${d.data.data[k]}`;
            });
          }
          return txt;
        });
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

  function f(i) {
    return Number(i).toLocaleString('en');
  }

  function id(d) {
    if (d.data.id) {
      return d.data.id;
    }
    return d.data.name;
  }

  // HELPERS
/*  function collapse(n) {
    const d = d4.select(`#${p.id}`).selectAll(`.n${n.name.replace(' ', '')}`);
    d.datum().descendants().slice(1).forEach(n => {
      n.data.collapsed = false;
      n.data.hidden = true;
    });
  }
*/
/*
  function expand(n) {
    const d = d4.select(`#${p.id}`).selectAll(`.n${n.name.replace(' ', '')}`);
    d.datum().descendants().slice(1).forEach(n => {
      n.data.hidden = false;
    });
  }
*/
/*
  function hover(n) {
    // hl node
    const d = d4.select(`#${p.id}`).selectAll(`.n${n.name.replace(' ', '')}`);
    d.select('circle').style('stroke', '#9a0026');
    d.select('text').style('font-weight', 'bold');
    // hl path
    d4.select(`#${p.id}`).select('path.hl')
      .attr('d', area(d.datum(), true))
      .style('fill', () => {
        const c = d4.rgb(color(n.name));
        c.opacity = 0.9;
        return c;
      });
  }
*/
/*
  function hoverOut(n) {
    // console.log(n);
    // un-hl node
    const d = d4.select(`#${p.id}`).selectAll(`.n${n.name.replace(' ', '')}`);
    d.select('circle').style('stroke', d => d.data.collapsed ? '#324eb3' : '#000000');
    d.select('text').style('font-weight', '');
    // delete hl path
    d4.select(`#${p.id}`).select('path.hl').attr('d', null);
  }
*/
  // RETURN
  return chart;
}
