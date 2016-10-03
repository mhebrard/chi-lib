import d3 from 'd3';

const chart = {version: '0.1'};

function params(p) {
  p = p || {};
  p.id = p.id || 'test';
  p.title = p.title || `Dendrogram of ${p.id}`;
  p.titleSize = p.titleSize || 18;
  p.width = p.width || 800;
  p.height = p.height || 600;
  p.margin = p.margin || {top: 20, bottom: 10, left: 50, right: 200};
  p.fontSize = p.fontSize || 14;
  return p;
}

chart.init = function(div, p) {
  console.log('init', div.node());
  p = params(p);

  // clean id
  // div.select('#' + p.id).remove();

  // SVG
  const svg = div.append('svg')
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
    .style('font-size', p.titleSize + 'px')
    .text(p.title);

  // data
  const tree = svg.append('g').attr('class', 'tree')
    .attr('transform', 'translate(' + p.margin.left + ',' + p.margin.top + ')')
    .style('font-size', p.fontSize + 'px');
  tree.append('g').attr('class', 'edges');
  tree.append('g').attr('class', 'nodes');
};

chart.update = function(svg, data, p) {
  console.log('update', svg.node());
  p = params(p);

  // layout
  const layout = d3.layout.cluster()
    .size([p.height - p.margin.top - p.margin.bottom,
      p.width - p.margin.left - p.margin.right]);
  const nodes = layout.nodes(data);
  const edges = layout.links(nodes);

  console.log(nodes.length, 'nodes');

  // helper
  const diagonal = d3.svg.diagonal()
    .projection(d => [d.y, d.x]);

  // update pattern
  let sel;
  let add;

  // edges
  sel = svg.select('.edges').selectAll('.edge')
    .data(edges);
  // exit
  sel.exit().remove();
  // add
  sel.enter().append('path')
    .attr('class', 'edge')
    .style('fill', 'none')
    .style('stroke', '#ccc')
    .style('stroke-width', '1.5px');
  // update
  sel.attr('d', diagonal);

  // nodes
  sel = svg.select('.nodes').selectAll('.node')
      .data(nodes);
  // exit
  sel.exit().remove();
  // add
  add = sel.enter().append('g')
    .attr('class', 'node');
  add.append('circle')
    .attr('r', 4.5)
    .style('stroke', '#324eb3')
    .style('stroke-width', '2px')
    .style('fill', '#fff');
  add.append('text').attr('dy', 3);
  // update
  sel.attr('transform', d => 'translate(' + d.y + ',' + d.x + ')');
  sel.select('text')
    .attr('dx', d => d.children ? -8 : 8)
    .style('text-anchor', d => d.children ? 'end' : 'start')
    .text(d => d.name);
};

export default chart;
