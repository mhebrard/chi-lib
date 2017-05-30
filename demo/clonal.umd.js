(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'd3-hierarchy', 'd3-transition', 'd3-scale', 'd3-scale-chromatic', 'd3-shape', 'd3-selection'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('d3-hierarchy'), require('d3-transition'), require('d3-scale'), require('d3-scale-chromatic'), require('d3-shape'), require('d3-selection'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.d3Hierarchy, global.d3Transition, global.d3Scale, global.d3ScaleChromatic, global.d3Shape, global.d3Selection);
    global.clonal = mod.exports;
  }
})(this, function (exports, _d3Hierarchy, _d3Transition, _d3Scale, _d3ScaleChromatic, _d3Shape, _d3Selection) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Chart;

  var d3sel = _interopRequireWildcard(_d3Selection);

  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};

      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
        }
      }

      newObj.default = obj;
      return newObj;
    }
  }

  // test d3 version Map d3v4
  /* global d3:true */
  var d4 = {};
  // workaround for event manager (d3sel.event)

  if (d3 === 'undefined' || d3.version) {
    d4 = {
      select: d3sel.select,
      selectAll: d3sel.selectAll,
      hierarchy: _d3Hierarchy.hierarchy, partition: _d3Hierarchy.partition,
      transition: _d3Transition.transition,
      scaleOrdinal: _d3Scale.scaleOrdinal,
      schemeSet3: _d3ScaleChromatic.schemeSet3,
      curveLinear: _d3Shape.curveLinear, line: _d3Shape.line
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
    p.title = p.title || 'Clonal Evolution of ' + p.id;
    p.titleSize = p.titleSize || 20;
    p.fontSize = p.fontSize || 14;
    p.width = p.width || 800;
    p.height = p.height || 600;
    p.margin = p.margin || { top: 30, bottom: 10, left: 50, right: 50 };
    p.shape = p.shape || 'curve';
    p.color = p.color || null;

    var color = d4.scaleOrdinal(p.color ? p.color : d4.schemeSet3);
    var mw = 6; // left/right margin for labels;
    var mh = 22; // minimal height for label;

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
        /*  case 'collapse':
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

      // group for labels
      svg.append('g').attr('class', 'labels').attr('transform', 'translate(' + p.margin.left + ', ' + p.margin.top + ')');
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
        return id(d);
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
      }).style('stroke', '#000').style('stroke-width', '1.5px').style('opacity', 0).on('mouseover', function (d) {
        return tip('show', d);
      }).on('mousemove', function (d) {
        return tip('move', d);
      }).on('mouseout', function (d) {
        return tip('hide', d);
      });
      // update
      sel = add.merge(sel);
      sel.transition(t3).attr('d', function (d) {
        return area(d, true);
      }).style('opacity', 1);

      // nodes
      sel = d4.select('#' + p.id).select('.nodes').selectAll('.node').data(root.descendants().filter(function (d) {
        return !d.data.hidden;
      }), function (d) {
        return id(d);
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
      }).style('cursor', 'pointer').style('opacity', 0).on('mouseover', function (d) {
        return tip('show', d);
      }).on('mousemove', function (d) {
        return tip('move', d);
      }).on('mouseout', function (d) {
        return tip('hide', d);
      });
      /*
      .on('click', d => {
        if (d.data.collapsed) {
          p.dispatch({type: 'expand', node: d.data});
        } else if (d.children) {
          p.dispatch({type: 'collapse', node: d.data});
        }
      })
      .on('mouseover', d => p.dispatch({type: 'hover', node: d.data}))
      .on('mouseout', d => p.dispatch({type: 'hoverOut', node: d.data}));
      */
      add.append('circle').style('fill', function (d) {
        return color(d.data.name);
      }).style('stroke-width', '2px');
      /* add.append('text')
        .attr('dy', 3)
        .attr('dx', -8)
        .style('text-anchor', 'end');
      */
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
      /* sel.select('text')
        .text(d => d.data.name);
      */

      // path
      sel = d4.select('#' + p.id).select('.labels').selectAll('path') // height > 1
      .data(root.descendants().filter(function (d) {
        return !d.data.hidden && d.x1 - d.x0 > mh;
      }), function (d) {
        return id(d);
      });
      // exit
      sel.exit().transition(t1).attr('d', function (d) {
        return line(d, false);
      }).remove();
      // update
      sel.transition(t2).attr('d', function (d) {
        return line(d, true);
      });
      // add
      add = sel.enter().append('path').attr('id', function (d) {
        return 'map' + p.id + id(d);
      }).attr('d', function (d) {
        return line(d, false);
      }).style('opacity', 0);
      // update
      sel = add.merge(sel);
      sel.transition(t3).attr('d', function (d) {
        return line(d, true);
      });

      // text
      sel = d4.select('#' + p.id).select('.labels').selectAll('text') // height > 1
      .data(root.descendants().filter(function (d) {
        return !d.data.hidden && d.x1 - d.x0 > mh;
      }), function (d) {
        return id(d);
      });
      // exit
      sel.exit().transition(t1).remove();
      // add
      add = sel.enter().append('text').attr('class', function (d) {
        return 't' + id(d);
      }).attr('text-anchor', 'left').attr('dy', '0.5ex').style('pointer-events', 'none').append('textPath').attr('xlink:href', function (d) {
        return '#map' + p.id + id(d);
      }).text(function (d) {
        return d.data.name;
      });
    };

    function line(d, mode) {
      var coord = middle(d);
      var ax = coord[0];
      var ay = coord[1];
      var bx = coord[0];
      var by = coord[1];
      if (mode) {
        ax += mw;
        bx = d.children ? bx + 2 * p.space - 2 * mw : p.width - p.margin.left - p.margin.right;
      }

      var path = d4.line().x(function (t) {
        return t[0];
      }).y(function (t) {
        return t[1];
      }).curve(d4.curveLinear);

      return path([[ax, ay], [bx, by]]);
    }

    function tip(state, d) {
      if (state === 'show') {
        d4.select('#tip').datum(d).style('opacity', 1).html(function (d) {
          var txt = 'name: ' + d.data.name + '\n          <br/>value: ' + f(d.value);
          if (d.data.data) {
            Object.keys(d.data.data).forEach(function (k) {
              txt += '<br/>' + k + ': ' + d.data.data[k];
            });
          }
          return txt;
        });
        // highlight(d);
      } else if (state === 'hide') {
        d4.select('#tip').style('opacity', 0);
        // highlight();
      } else {
        // move
        var x = 0;
        var y = 0;
        if (d3sel.event) {
          y = d3sel.event.pageY;
          x = d3sel.event.pageX;
        } else {
          y = d3.event.clientY;
          x = d3.event.clientX;
        }
        d4.select('#tip').style('top', y - 10 + 'px').style('left', x + 10 + 'px');
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
    /*  function expand(n) {
        const d = d4.select(`#${p.id}`).selectAll(`.n${n.name.replace(' ', '')}`);
        d.datum().descendants().slice(1).forEach(n => {
          n.data.hidden = false;
        });
      }
    */
    /*  function hover(n) {
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
    /*  function hoverOut(n) {
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
});
