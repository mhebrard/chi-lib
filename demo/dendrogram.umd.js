(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'd3-selection', 'd3-hierarchy', 'd3-transition'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('d3-selection'), require('d3-hierarchy'), require('d3-transition'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.d3Selection, global.d3Hierarchy, global.d3Transition);
    global.dendrogram = mod.exports;
  }
})(this, function (exports, _d3Selection, _d3Hierarchy, _d3Transition) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Chart;


  // test d3 version Map d3v4
  /* global d3:true */
  var d4 = {};
  if (d3 === 'undefined' || d3.version) {
    d4 = {
      select: _d3Selection.select, selectAll: _d3Selection.selectAll,
      hierarchy: _d3Hierarchy.hierarchy, cluster: _d3Hierarchy.cluster,
      transition: _d3Transition.transition
    };
  } else {
    d4 = d3;
  }

  function Chart(p) {
    var chart = { version: 1.1 };

    // PARAMETERS
    p = p || {};
    p.div = p.div || 'body';
    p.id = p.id || 'view';
    p.data = p.data || { name: 'root', size: 1 };
    p.title = p.title || 'Dendrogram of ' + p.id;
    p.titleSize = p.titleSize || 20;
    p.fontSize = p.fontSize || 14;
    p.width = p.width || 800;
    p.height = p.height || 600;
    p.margin = p.margin || { top: 30, bottom: 10, left: 50, right: 200 };
    p.shape = p.shape || 'curve';

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
          chart.update();
          break;
        case 'expand':
          action.node.collapsed = false;
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

    // path of edges
    var link = function link(d, show) {
      var path = void 0;
      var f = 'L';
      if (show) {
        if (p.shape === 'comb') {
          path = 'M' + d.y + ', ' + d.x + ' ' + f + d.parent.y + ', ' + d.parent.x;
        } else {
          if (p.shape === 'curve') {
            f = 'C';
          }
          path = 'M' + d.y + ', ' + d.x + ' ' + ('' + f + (d.parent.y + p.space) + ', ' + d.x + ' ') + (d.parent.y + p.space + ', ' + d.parent.x + ' ') + (d.parent.y + ', ' + d.parent.x);
        }
      } else {
        path = 'M' + d.parent.y + ', ' + d.parent.x + ' L' + d.parent.y + ', ' + d.parent.x;
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
      // layout
      var filter = function filter(d) {
        if (d.children && !d.collapsed) {
          return d.children;
        }
      };
      var root = d4.hierarchy(p.data, filter);
      d4.cluster().size([p.height - p.margin.top - p.margin.bottom, p.width - p.margin.left - p.margin.right])(root);

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
      sel = d4.select('#' + p.id).select('.edges').selectAll('.edge').data(root.descendants().slice(1), function (d) {
        return d.data.name;
      });
      // exit
      sel.exit().transition(t1).attr('d', function (d) {
        return link(d, false);
      }).style('opacity', 0).remove();
      // update
      sel.transition(t2).attr('d', function (d) {
        return link(d, true);
      });
      // add
      add = sel.enter().append('path').attr('class', function (d) {
        return 'edge e' + d.data.name.replace(' ', '');
      }).attr('d', function (d) {
        return link(d, false);
      }).style('fill', 'none').style('stroke', '#ccc').style('stroke-width', '1.5px').style('opacity', 0);
      // update
      sel = add.merge(sel);
      sel.transition(t3).attr('d', function (d) {
        return link(d, true);
      }).style('opacity', 1);

      // nodes
      sel = d4.select('#' + p.id).select('.nodes').selectAll('.node').data(root.descendants().slice(1), function (d) {
        return d.data.name;
      });
      // exit
      sel.exit().transition(t1).attr('transform', function (d) {
        return 'translate(' + d.parent.y + ', ' + d.parent.x + ')';
      }).style('opacity', 0).remove();
      // update
      sel.transition(t2).attr('transform', function (d) {
        return 'translate(' + d.y + ', ' + d.x + ')';
      });
      // add
      add = sel.enter().append('g').attr('class', function (d) {
        return 'node n' + d.data.name.replace(' ', '');
      }).attr('transform', function (d) {
        var coord = [0, p.height / 2];
        if (d.parent) {
          coord = [d.parent.y, d.parent.x];
        }
        return 'translate(' + coord[0] + ', ' + coord[1] + ')';
      }).style('cursor', 'pointer').style('opacity', 0).on('click', function (d) {
        if (d.data.collapsed) {
          p.dispatch({ type: 'expand', node: d.data });
        } else if (d.parent && d.children) {
          p.dispatch({ type: 'collapse', node: d.data });
        }
      }).on('mouseover', function (d) {
        return p.dispatch({ type: 'hover', node: d.data });
      }).on('mouseout', function (d) {
        return p.dispatch({ type: 'hoverOut', node: d.data });
      });
      add.append('circle').style('stroke-width', '2px');
      add.append('text').attr('dy', 3);
      // update
      sel = add.merge(sel);
      sel.transition(t3).attr('transform', function (d) {
        return 'translate(' + d.y + ', ' + d.x + ')';
      }).style('opacity', 1);
      sel.select('circle').attr('r', function (d) {
        return d.data.collapsed ? 5.5 : 4.5;
      }).style('fill', function (d) {
        return d.data.collapsed ? '#ddd' : '#fff';
      }).style('stroke', function (d) {
        return d.data.collapsed ? '#324eb3' : '#009a74';
      });
      sel.select('text').attr('dx', function (d) {
        return d.children ? -8 : 8;
      }).style('text-anchor', function (d) {
        return d.children ? 'end' : 'start';
      }).text(function (d) {
        return d.data.name;
      });
    };

    // HELPERS
    function hover(n) {
      // hl node
      var d = d4.select('#' + p.id).selectAll('.n' + n.name);
      d.select('circle').style('stroke', '#9a0026');
      d.select('text').style('font-weight', 'bold');
      // reconstruct path to too root for hl
      var path = d.datum().ancestors().slice(0, -1).reduce(function (t, a) {
        t += link(a, true);
        return t;
      }, '');
      d4.select('#' + p.id).select('path.hl').attr('d', path);
    }

    function hoverOut(n) {
      // un-hl node
      var d = d4.select('#' + p.id).selectAll('.n' + n.name);
      d.select('circle').style('stroke', function (d) {
        return d.data.collapsed ? '#324eb3' : '#009a74';
      });
      d.select('text').style('font-weight', '');
      // delete hl path
      d4.select('#' + p.id).select('path.hl').attr('d', null);
    }

    // RETURN
    return chart;
  }
});
