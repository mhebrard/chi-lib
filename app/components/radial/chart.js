import d3 from 'd3';

export default function Chart (opts) {
  opts = opts || {};

  return function chart (selection) {
    selection.each(function (d, i) {
      var el = d3.select(this);

      el.selectAll('svg').remove();

      var radius = 960 / 2;

      var color = d3.scale.category20c();

      var cluster = d3.layout.cluster()
        .size([360, radius - 120]);
      var nodes = cluster.nodes(d);

      console.log("nodes",nodes);

      var diagonal = d3.svg.diagonal.radial()
        .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

      var svg = el.append('svg')
        .attr('title', 'radial')
        .attr("width", radius * 2)
        .attr("height", radius * 2)
        .append("g")
        .attr("transform", "translate(" + radius + "," + radius + ")");

      var link = svg.selectAll("path.link")
        .data(cluster.links(nodes))
        .enter().append("path")
        .attr("class", "link")
        .attr("d", diagonal);

       var node = svg.selectAll("g.node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })

      node.append("circle")
        .attr("r", 4.5);

      node.append("text")
        .attr("dy", ".31em")
        .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
        .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
        .text(function(d) { return d.name; });
    });
  };

  function tip(state,d) {
    if(state=="show") {
      d3.select("#tip")
        .datum(d)
        .style("opacity",1)
        .html(function(d) {
          return d.name
          +"<br/>"+d.value;
        });
      //highlight(d);
    }
    else if(state=="hide") {
      d3.select("#tip").style("opacity",0);
      //highlight();
    }
    else { // move
      d3.select("#tip").style("top", (d3.event.pageY-10)+"px")
        .style("left", (d3.event.pageX+10)+"px");
    }
  }



}
