// from http://bl.ocks.org/mbostock/5544621
// https://gist.github.com/mbostock/5544621
import d3 from 'd3';

export default function Chart (opts) {
  opts = opts || {};

  return function chart (selection) {
    selection.each(function (d, i) {
      var el = d3.select(this);

      el.selectAll('svg').remove();

      var margin = {top: 40, right: 10, bottom: 10, left: 10};
      var width = 960 - margin.left - margin.right;
      var height = 500 - margin.top - margin.bottom;

      var color = d3.scale.category20c();

      var treemap = d3.layout.treemap()
        .size([width, height])
        .sticky(true)
        .value(function(d) { return d.size; });
      treemap.nodes(d);

      console.log("nodes",treemap.nodes());

      var svg = el.append('svg')
        .attr('title', 'treemap')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        
      //backgroung
      svg.append("rect") 
        .attr("width","100%")
        .attr("height","100%")
        .attr("fill","#fff")
        .attr("class","bg");

      //group for visual elements
      var visual = svg.append("g").datum(d)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .classed("visual",true)

      //visual elements
      var leaves = treemap.nodes().filter(function(d) { return !d.children; });
      visual.selectAll("rect")
      .data(leaves)
      .enter().append("rect")
      .attr("class",function(d,i){return "v"+i;})
      .attr("transform", function(d){ return "translate(" + d.x + "," + d.y + ")"; })
      .attr('width', function(d){ return Math.max(0, d.dx - 1); })
      .attr('height', function(d){ return Math.max(0, d.dy - 1); })
      .attr("fill",function(d){return color(d.parent.name);})
      .on('mouseover', function(d){ tip("show",d); })
      .on("mousemove", function(d) { tip("move"); })
      .on("mouseout", function(d){ tip("hide"); })
     
      //group for label elements
      var labels = svg.append("g").datum(d)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .classed("labels",true)
        .style("font-family","'Source Code Pro','Lucida Console',Monaco,monospace");

      //Label guide (leaves)
      labels.selectAll("path")
        .data(leaves)
        .enter().append("path")
        .attr("id",function(d,i){return "map"+i;})
        .style("opacity",0)
        .style("pointer-events","none")
        .attr("d",function(d) {return line(d); })

      //text elements (leaves)
     labels.selectAll("text")
        .data(leaves)
        .enter().append("text")
        .attr("class",function(d,i){return "t"+i;})
        .attr("text-anchor", "left")
        .attr("dy","0.5ex")
        .style("pointer-events","none")
        .append("textPath")
        .attr("xlink:href",function(d,i){return "#map"+i;})
        .text(function(d){return d.name;})

      function line(d) {
        var ax,ay,bx,by;
        var mw=5,mh=22; //margin width and height
        var rw=d.dx-1; //rect width
        var rh=d.dy-1; //rect height

        if(rw<rh) {//vertical
          ax=d.x+(d.dx/2);
          ay=d.y;
          bx=ax;
          by=d.y+d.dy;
          //margin && min width
          if(ay+mw<by-mw && rw>mh) { ay=ay+mw; by=by-mw;} 
          else {by=ay;}
        }
        else { //horizontal
          ax=d.x;
          ay=d.y+(d.dy/2);
          bx=d.x+d.dx;
          by=ay;
          //margin && min height
          if(ax+mw<bx-mw && rh>mh) { ax=ax+mw; bx=bx-mw;}
          else {bx=ax;}         
        }
        
        var path = d3.svg.line()
        .x(function(t) {return t[0];})
        .y(function(t) {return t[1];})
        .interpolate("linear");
    
        return path([[ax,ay],[bx,by]]);
      }
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
