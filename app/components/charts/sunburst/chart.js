// from http://bl.ocks.org/mbostock/5544621
// https://gist.github.com/mbostock/5544621
import d3 from 'd3';

export default function Chart (opts) {
  opts = opts || {};

  return function chart (selection) {
    selection.each(function (d, i) {
      var el = d3.select(this);

      el.selectAll('svg').remove();

      var width = 960,
      height = 700,
      radius = Math.min(width, height) / 2,
      color = d3.scale.category20c();

      var p={x:0,y:0};
      p.x = d3.scale.linear().range([0, 2 * Math.PI]);
      p.y = d3.scale.linear().range([0, radius]); 

      var layout = d3.layout.partition()
        .sort(null)
        //.size([2 * Math.PI, radius * radius])
        .value(function(d) { return d.size; });
        layout.nodes(d);

      console.log("data",d);
     //console.log("nodes",layout.nodes());

      var svg = el.append('svg')
        .attr('title', 'sunburst')
        .attr('width', width)
        .attr('height', height)
        
      //backgroung
      svg.append("rect") 
        .attr("width","100%")
        .attr("height","100%")
        .attr("fill","#fff")
        .attr("class","bg");

      //group for visual elements
      var visual = svg.append("g").datum(d)
        .attr("transform", "translate(" + width/2 + "," + height/2 + ")")
        .classed("visual",true)

      //visual elements
      visual.selectAll("path")
      .data(layout.nodes)
      .enter().append("path")
      .attr("class",function(d,i){return "v"+i;})
      .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
      .attr("d", function(d){return arc(d);})
      .style("stroke", "#fff")
      .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
      .style("fill-rule", "evenodd")
      .on('mouseover', function(d){ tip("show",d); })
      .on("mousemove", function(d) { tip("move"); })
      .on("mouseout", function(d){ tip("hide"); })

      //group for label elements
      var labels = svg.append("g").datum(d)
        .attr("transform", "translate(" + width/2 + "," + height/2 + ")")
        .classed("labels",true)
        .style("font-family","'Source Code Pro','Lucida Console',Monaco,monospace")
        .style("text-rendering","geometricprecision")
      //Label guide
      labels.selectAll("path")
      .data(layout.nodes)
      .enter().append("path")
      .attr("id",function(d,i){return "sun"+i;})
      .style("opacity",0)
      .style("pointer-events","none")
      .attr("d", function(d){return arc(d,"middle");})

      //text elements
      labels.selectAll("text")
      .data(layout.nodes)
      .enter().append("text")
      .attr("class",function(d,i){return "t"+i;})
      .attr("text-anchor", "left")
      .attr("dy","0.5ex")
      .style("pointer-events","none")
      .append("textPath")
      .attr("xlink:href",function(d,i){return "#sun"+i;})
      .text(function(d){return d.name;})  

      //Arc calculation
      function arc(d,edge) {
        //visual
        var a = p.x(d.x);
        var b = p.x(d.x + d.dx);
        var ir = p.y(d.y);
        var or = p.y(d.y + d.dy);
        
        if(edge=="middle") { //label guide
          or = p.y(d.y + (d.dy/2));
          //add marges angle = pi-2*acos(marge/radius)
          var m=Math.PI-(2*Math.acos(2/ir));
          //verify a < b or path=0;
          if(a+m<b-m) { a=a+m; b=b-m;} else {b=a;}
        }
        else if(edge=="extern") { // HL
          or=radius;
        }
      
        // compute path
        var path = d3.svg.arc()
          .startAngle(Math.max(0,Math.min(2*Math.PI,a)))
          .endAngle(Math.max(0,Math.min(2*Math.PI,b)))
          .innerRadius(Math.max(0,ir))
          .outerRadius(Math.max(0,or));
          
        var res;
        if(edge=="middle") { //extract outer arc
          var extract = /[Mm][\d\.\-e,\s]+A[\d\.\-e,\s]+/; 
          var guide = extract.exec(path(d));
          if(guide) {res=guide[0];}
          else {res="M0,0A0,0Z";}
        }
        else {res=path(d);}
        
        return res;
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
