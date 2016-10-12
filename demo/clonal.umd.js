(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'd3-selection', 'd3-hierarchy', 'd3-transition', 'd3-scale', 'd3-scale-chromatic', 'd3-color'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('d3-selection'), require('d3-hierarchy'), require('d3-transition'), require('d3-scale'), require('d3-scale-chromatic'), require('d3-color'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.d3Selection, global.d3Hierarchy, global.d3Transition, global.d3Scale, global.d3ScaleChromatic, global.d3Color);
    global.clonal = mod.exports;
  }
})(this, function (exports, _d3Selection, _d3Hierarchy, _d3Transition, _d3Scale, _d3ScaleChromatic, _d3Color) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Chart;


  // test d3 version Map d3v4
  var d4 = {};
  if (d3.version) {
    // d3v3.x present as global
    d4 = {
      select: _d3Selection.select, selectAll: _d3Selection.selectAll,
      hierarchy: _d3Hierarchy.hierarchy, partition: _d3Hierarchy.partition,
      transition: _d3Transition.transition,
      scaleOrdinal: _d3Scale.scaleOrdinal,
      schemeSet3: _d3ScaleChromatic.schemeSet3,
      rgb: _d3Color.rgb
    };
  } else {
    // d3v4 present as global
    d4 = d3;
  }

  function Chart(p) {
    var chart = { version: 1.0 };

    // PARAMETERS
    p = p || {};
    p.div = p.div || 'body';
    p.id = p.id || 'view';
    p.data = p.data || { name: 'root', size: 1 };
    p.title = p.title || 'Clonal Evolution of ' + p.id;
    p.titleSize = p.titleSize || 18;
    p.fontSize = p.fontSize || 14;
    p.width = p.width || 800;
    p.height = p.height || 600;
    p.margin = p.margin || { top: 30, bottom: 10, left: 50, right: 50 };
    p.shape = p.shape || 'curve';
    p.color = p.color || null;

    var color = d4.scaleOrdinal(p.color ? p.color : d4.schemeSet3);

    // consume action: mutate data and apply changes
    chart.consumer = function (action) {
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

    var middle = function middle(d) {
      return [d.y0, (d.x0 + d.x1) / 2];
    };

    var area = function area(d, show) {
      var coord = middle(d);
      var path = void 0;
      var f = 'L';
      if (show) {
        if (p.shape === 'comb') {
          path = 'M' + (p.width - p.margin.left - p.margin.right) + ', ' + d.x0 + ('L' + d.y1 + ', ' + d.x0) + ('' + f + coord[0] + ', ' + coord[1] + ' ' + d.y1 + ', ' + d.x1) + ('L' + (p.width - p.margin.left - p.margin.right) + ', ' + d.x1);
        } else {
          if (p.shape === 'curve') {
            f = 'C';
          }
          path = 'M' + (p.width - p.margin.left - p.margin.right) + ', ' + d.x0 + ' ' + ('L' + d.y1 + ', ' + d.x0) + ('' + f + (d.y0 + p.space) + ', ' + d.x0 + ' ' + (d.y0 + p.space) + ', ' + coord[1] + ' ' + coord[0] + ', ' + coord[1]) + ('' + f + (d.y0 + p.space) + ', ' + coord[1] + ' ' + (d.y0 + p.space) + ', ' + d.x1 + ' ' + d.y1 + ', ' + d.x1) + ('L' + (p.width - p.margin.left - p.margin.right) + ', ' + d.x1);
        }
      } else {
        path = 'M' + coord[0] + ', ' + coord[1] + ' L' + coord[0] + ', ' + coord[1];
      }
      return path;
    };

    chart.init = function () {
      // SVG
      var svg = d4.select('#' + p.div).append('svg').attr('id', p.id).attr('title', p.title).attr('width', p.width).attr('height', p.height);

      // title
      svg.append('g').attr('class', 'title').append('text').attr('x', 0).attr('y', p.margin.top / 2).attr('dy', '0.5ex').style('font-size', p.titleSize + 'px').text(p.title);

      // data
      var tree = svg.append('g').attr('class', 'tree').attr('transform', 'translate(' + p.margin.left + ', ' + p.margin.top + ')').style('font-size', p.fontSize + 'px');
      tree.append('g').attr('class', 'edges');
      tree.append('g').attr('class', 'nodes');
      tree.append('path').attr('class', 'edge hl').style('fill', 'none').style('stroke', '#000').style('stroke-width', '1.5px').style('pointer-events', 'none');
    };

    // accessor
    chart.data = function (d) {
      if (d) {
        p.data = d;
      }
      return p.data;
    };

    chart.update = function () {
      // console.log('chart.update');
      // layout
      var root = d4.hierarchy(p.data);
      d4.partition().size([p.height - p.margin.top - p.margin.bottom, p.width - p.margin.left - p.margin.right])(root.sum(function (d) {
        return d.size;
      }));

      // console.log('root', root);

      // edge breakpoint (distance to parent node where the break occure)
      p.space = (p.width - p.margin.left - p.margin.right) / (2 * root.height);

      // update pattern
      var sel = void 0;
      var add = void 0;
      // transitions
      var delay = 500;
      var t1 = d4.transition().duration(delay);
      var t2 = d4.transition().delay(delay).duration(delay);
      var t3 = d4.transition().delay(delay * 2).duration(delay);

      // edges
      sel = d4.select('#' + p.id).select('.edges').selectAll('.edge').data(root.descendants().filter(function (d) {
        return !d.data.hidden;
      }), function (d) {
        return d.data.name;
      });
      // exit
      sel.exit().transition(t1).attr('d', function (d) {
        return area(d, false);
      }).style('opacity', 0).remove();
      // update
      sel.transition(t2).attr('d', function (d) {
        return area(d, true);
      });
      // add
      add = sel.enter().append('path').attr('class', function (d) {
        return 'edge e' + d.data.name.replace(' ', '');
      }).attr('d', function (d) {
        return area(d, false);
      }).style('fill', function (d) {
        return color(d.data.name);
      }).style('stroke', '#000').style('stroke-width', '1.5px').style('opacity', 0);
      // update
      sel = add.merge(sel);
      sel.transition(t3).attr('d', function (d) {
        return area(d, true);
      }).style('opacity', 1);

      // nodes
      sel = d4.select('#' + p.id).select('.nodes').selectAll('.node').data(root.descendants().filter(function (d) {
        return !d.data.hidden;
      }), function (d) {
        return d.data.name;
      });
      // exit
      sel.exit().transition(t1).attr('transform', function (d) {
        var coord = d.parent ? middle(d.parent) : middle(root);
        return 'translate(' + coord[0] + ', ' + coord[1] + ')';
      }).style('opacity', 0).remove();
      // update
      sel.transition(t2).attr('transform', function (d) {
        var coord = middle(d);
        return 'translate(' + coord[0] + ', ' + coord[1] + ')';
      });
      // add
      add = sel.enter().append('g').attr('class', function (d) {
        return 'node n' + d.data.name.replace(' ', '');
      }).attr('transform', function (d) {
        var coord = d.parent ? middle(d.parent) : middle(root);
        return 'translate(' + coord[0] + ', ' + coord[1] + ')';
      }).style('cursor', 'pointer').style('opacity', 0).on('click', function (d) {
        if (d.data.collapsed) {
          p.dispatch({ type: 'expand', node: d.data });
        } else if (d.children) {
          p.dispatch({ type: 'collapse', node: d.data });
        }
      }).on('mouseover', function (d) {
        return p.dispatch({ type: 'hover', node: d.data });
      }).on('mouseout', function (d) {
        return p.dispatch({ type: 'hoverOut', node: d.data });
      });
      add.append('circle').style('fill', function (d) {
        return color(d.data.name);
      }).style('stroke-width', '2px');
      add.append('text').attr('dy', 3).attr('dx', -8).style('text-anchor', 'end');
      // update
      sel = add.merge(sel);
      sel.transition(t3).attr('transform', function (d) {
        var coord = middle(d);
        return 'translate(' + coord[0] + ', ' + coord[1] + ')';
      }).style('opacity', 1);
      sel.select('circle').attr('r', function (d) {
        return d.data.collapsed ? 5.5 : 4.5;
      }).style('stroke', function (d) {
        return d.data.collapsed ? '#324eb3' : '#000000';
      });
      sel.select('text').text(function (d) {
        return d.data.name;
      });
    };

    // HELPERS
    function collapse(n) {
      var d = d4.select('#' + p.id).selectAll('.n' + n.name.replace(' ', ''));
      d.datum().descendants().slice(1).forEach(function (n) {
        n.data.collapsed = false;
        n.data.hidden = true;
      });
    }

    function expand(n) {
      var d = d4.select('#' + p.id).selectAll('.n' + n.name.replace(' ', ''));
      d.datum().descendants().slice(1).forEach(function (n) {
        n.data.hidden = false;
      });
    }

    function hover(n) {
      // hl node
      var d = d4.select('#' + p.id).selectAll('.n' + n.name.replace(' ', ''));
      d.select('circle').style('stroke', '#9a0026');
      d.select('text').style('font-weight', 'bold');
      // hl path
      d4.select('#' + p.id).select('path.hl').attr('d', area(d.datum(), true)).style('fill', function () {
        var c = d4.rgb(color(n.name));
        c.opacity = 0.9;
        return c;
      });
    }

    function hoverOut(n) {
      // console.log(n);
      // un-hl node
      var d = d4.select('#' + p.id).selectAll('.n' + n.name.replace(' ', ''));
      d.select('circle').style('stroke', function (d) {
        return d.data.collapsed ? '#324eb3' : '#000000';
      });
      d.select('text').style('font-weight', '');
      // delete hl path
      d4.select('#' + p.id).select('path.hl').attr('d', null);
    }

    // RETURN
    return chart;
  }
});
