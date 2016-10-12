import {select, selectAll} from 'd3-selection';
import {hierarchy, partition} from 'd3-hierarchy';
import {transition} from 'd3-transition';
import {scaleOrdinal} from 'd3-scale';
import {schemeSet3} from 'd3-scale-chromatic';
import {rgb} from 'd3-color';

// test d3 version Map d3v4
let d4 = {};
if (d3.version) { // d3v3.x present as global
  d4 = {
    select, selectAll,
    hierarchy, partition,
    transition,
    scaleOrdinal,
    schemeSet3,
    rgb
  };
} else { // d3v4 present as global
  d4 = d3;
}

export default function Chart(p) {
  const chart = {version: 0.1};

  // PARAMETERS
  p = p || {};
  p.div = p.div || 'body';
  p.id = p.id || 'view';
  p.data = p.data || {name: 'root', size: 1};
  p.title = p.title || `Clonal Evolution of ${p.id}`;
  p.titleSize = p.titleSize || 18;
  p.fontSize = p.fontSize || 14;
  p.width = p.width || 800;
  p.height = p.height || 600;
  p.margin = p.margin || {top: 30, bottom: 10, left: 50, right: 50};
  p.shape = p.shape || 'curve';
  p.color = p.color || null;

  const color = d4.scaleOrdinal(p.color ? p.color : d4.schemeSet3);

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
      default:
        // console.log('unknown event');
    }
  };

  // add dispatcher to parameters
  p.dispatch = p.dispatch || chart.consumer;

  const middle = d => [d.y0, (d.x0 + d.x1) / 2];

  const area = (d, show) => {
    const coord = middle(d);
    let path;
    let f = 'L';
    if (show) {
      if (p.shape === 'comb') {
        path = `M${p.width - p.margin.left - p.margin.right}, ${d.x0}` +
        `L${d.y1}, ${d.x0}` +
        `${f}${coord[0]}, ${coord[1]} ${d.y1}, ${d.x1}` +
        `L${p.width - p.margin.left - p.margin.right}, ${d.x1}`;
      } else {
        if (p.shape === 'curve') {
          f = 'C';
        }
        path = `M${p.width - p.margin.left - p.margin.right}, ${d.x0} ` +
        `L${d.y1}, ${d.x0}` +
        `${f}${d.y0 + p.space}, ${d.x0} ${d.y0 + p.space}, ${coord[1]} ${coord[0]}, ${coord[1]}` +
        `${f}${d.y0 + p.space}, ${coord[1]} ${d.y0 + p.space}, ${d.x1} ${d.y1}, ${d.x1}` +
        `L${p.width - p.margin.left - p.margin.right}, ${d.x1}`;
      }
    } else {
      path = `M${p.width - p.margin.left - p.margin.right}, ${coord[1]} ` +
      `L${coord[0]}, ${coord[1]}`;
    }
    return path;
  };

  chart.init = function() {
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

    // data
    const tree = svg.append('g').attr('class', 'tree')
      .attr('transform', `translate(${p.margin.left}, ${p.margin.top})`)
      .style('font-size', `${p.fontSize}px`);
    tree.append('g').attr('class', 'edges');
    tree.append('g').attr('class', 'nodes');
    tree.append('path').attr('class', 'edge hl')
      .style('fill', 'none')
      .style('stroke', '#000')
      .style('stroke-width', '1.5px')
      .style('pointer-events', 'none');
  };

  // accessor
  chart.data = function(d) {
    if (d) {
      p.data = d;
    }
    return p.data;
  };

  chart.update = function() {
    // console.log('chart.update');
    // layout
    const root = d4.hierarchy(p.data);
    d4.partition()
      .size([
        p.height - p.margin.top - p.margin.bottom,
        p.width - p.margin.left - p.margin.right
      ])(root.sum(d => d.size));

    // console.log('root', root);

    // edge breakpoint (distance to parent node where the break occure)
    p.space = (p.width - p.margin.left - p.margin.right) / (2 * root.height);

    // update pattern
    let sel;
    let add;
    // transitions
    const delay = 500;
    const t1 = d4.transition().duration(delay);
    const t2 = d4.transition().delay(delay).duration(delay);
    const t3 = d4.transition().delay(delay * 2).duration(delay);

    // edges
    sel = d4.select(`#${p.id}`).select('.edges').selectAll('.edge')
      .data(root.descendants().filter(d => !d.data.hidden), d => d.data.name);
    // exit
    sel.exit().transition(t1)
      .attr('d', d => area(d, false))
      .remove();
    // update
    sel.transition(t2)
      .attr('d', d => area(d, true));
    // add
    add = sel.enter().append('path')
      .attr('class', d => `edge e${d.data.name.replace(' ', '')}`)
      .attr('d', d => area(d, false))
      .style('fill', d => color(d.data.name))
      .style('stroke', '#000')
      .style('stroke-width', '1.5px');
    // update
    sel = add.merge(sel);
    sel.transition(t3)
      .attr('d', d => area(d, true));

    // nodes
    sel = d4.select(`#${p.id}`).select('.nodes').selectAll('.node')
        .data(root.descendants().filter(d => !d.data.hidden), d => d.data.name);
    // exit
    sel.exit().transition(t1)
      .attr('transform', d => {
        const coord = d.parent ? middle(d.parent) : middle(root);
        return `translate(${coord[0]}, ${coord[1]})`;
      })
      .remove();
    // update
    sel.transition(t2)
    .attr('transform', d => {
      const coord = middle(d);
      return `translate(${coord[0]}, ${coord[1]})`;
    });
    // add
    add = sel.enter().append('g')
      .attr('class', d => `node n${d.data.name.replace(' ', '')}`)
      .attr('transform', d => {
        const coord = d.parent ? middle(d.parent) : middle(root);
        return `translate(${coord[0]}, ${coord[1]})`;
      })
      .style('cursor', 'pointer')
      .on('click', d => {
        if (d.data.collapsed) {
          p.dispatch({type: 'expand', node: d.data});
        } else if (d.children) {
          p.dispatch({type: 'collapse', node: d.data});
        }
      })
      .on('mouseover', d => p.dispatch({type: 'hover', node: d.data}))
      .on('mouseout', d => p.dispatch({type: 'hoverOut', node: d.data}));
    add.append('circle')
      .style('fill', d => color(d.data.name))
      .style('stroke-width', '2px');
    add.append('text')
      .attr('dy', 3)
      .attr('dx', -8)
      .style('text-anchor', 'end');
    // update
    sel = add.merge(sel);
    sel.transition(t3)
      .attr('transform', d => {
        const coord = middle(d);
        return `translate(${coord[0]}, ${coord[1]})`;
      });
    sel.select('circle')
        .attr('r', d => d.data.collapsed ? 5.5 : 4.5)
        .style('stroke', d => d.data.collapsed ? '#324eb3' : '#000000');
    sel.select('text')
      .text(d => d.data.name);
  };

  // HELPERS
  function collapse(n) {
    const d = d4.select(`#${p.id}`).selectAll(`.n${n.name.replace(' ', '')}`);
    d.datum().descendants().slice(1).forEach(n => {
      n.data.collapsed = false;
      n.data.hidden = true;
    });
  }

  function expand(n) {
    const d = d4.select(`#${p.id}`).selectAll(`.n${n.name.replace(' ', '')}`);
    d.datum().descendants().slice(1).forEach(n => {
      n.data.hidden = false;
    });
  }

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

  function hoverOut(n) {
    // console.log(n);
    // un-hl node
    const d = d4.select(`#${p.id}`).selectAll(`.n${n.name.replace(' ', '')}`);
    d.select('circle').style('stroke', d => d.data.collapsed ? '#324eb3' : '#000000');
    d.select('text').style('font-weight', '');
    // delete hl path
    d4.select(`#${p.id}`).select('path.hl').attr('d', null);
  }

  // RETURN
  return chart;
}
