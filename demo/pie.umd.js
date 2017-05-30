(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'd3-scale', 'd3-scale-chromatic', 'd3-shape', 'd3-transition', 'd3-selection'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('d3-scale'), require('d3-scale-chromatic'), require('d3-shape'), require('d3-transition'), require('d3-selection'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.d3Scale, global.d3ScaleChromatic, global.d3Shape, global.d3Transition, global.d3Selection);
    global.pie = mod.exports;
  }
})(this, function (exports, _d3Scale, _d3ScaleChromatic, _d3Shape, _d3Transition, _d3Selection) {
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
  // workaround for event

  if (d3 === 'undefined' || d3.version) {
    d4 = {
      select: d3sel.select,
      selectAll: d3sel.selectAll,
      transition: _d3Transition.transition,
      scaleOrdinal: _d3Scale.scaleOrdinal,
      schemeSet3: _d3ScaleChromatic.schemeSet3,
      arc: _d3Shape.arc, pie: _d3Shape.pie
    };
  } else {
    d4 = d3;
  }

  function Chart(p) {
    var chart = { version: 1.0 };

    // PARAMETERS
    p = p || {};
    p.div = p.div || 'body';
    p.id = p.id || 'view';
    p.data = p.data || { serie: [{ name: 'root', size: 1 }] };
    p.title = p.title || 'Pie chart of ' + p.id;
    p.titleSize = p.titleSize || 20;
    p.fontSize = p.fontSize || 14;
    p.width = p.width || 800;
    p.height = p.height || 600;
    p.margin = p.margin || { top: 30, bottom: 0, left: 0, right: 0 };
    p.color = p.color || d4.schemeSet3;
    p.inner = p.inner || 70;
    p.cornerRadius = p.cornerRadius || 3;
    p.padAngle = p.padAngle || 0.01;
    p.aMin = p.aMin || 0.1;

    p.radius = Math.min(p.width - p.margin.left - p.margin.right, p.height - p.margin.top - p.margin.bottom) / 2;
    p.total = 0;
    var color = d4.scaleOrdinal(p.color);

    var arc = d4.arc().innerRadius(p.inner).outerRadius(p.radius).cornerRadius(p.cornerRadius).padAngle(p.padAngle);

    var coord = function coord(d) {
      var a = (d.startAngle + d.endAngle) / 2 - Math.PI / 2;
      var inner = { x: (p.inner + 5) * Math.cos(a), y: (p.inner + 5) * Math.sin(a) };
      var outer = { x: (p.radius - 5) * Math.cos(a), y: (p.radius - 5) * Math.sin(a) };
      return { inner: inner, outer: outer };
    };

    var path = function path(d) {
      var c = coord(d);
      if (c.inner.x < c.outer.x) {
        return 'M' + c.inner.x + ',' + c.inner.y + 'L' + c.outer.x + ',' + c.outer.y;
      }
      return 'M' + c.outer.x + ',' + c.outer.y + 'L' + c.inner.x + ',' + c.inner.y;
    };

    var align = function align(d) {
      var c = coord(d);
      return c.inner.x < c.outer.x;
    };

    var percent = function percent(value) {
      var res = Math.round(value * 100 * 100 / p.total) / 100;
      return res;
    };

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
        default:
        // console.log('unknown event');
      }
    };

    // add dispatcher to parameters
    p.dispatch = p.dispatch || chart.consumer;

    chart.init = function () {
      console.log('chart init');
      // SVG
      var svg = d4.select('#' + p.div).append('svg').attr('id', p.id).attr('title', p.title).attr('width', p.width).attr('height', p.height);

      // title
      svg.append('g').attr('class', 'title').append('text').attr('x', 0).attr('y', p.margin.top / 2).attr('dy', '0.5ex').style('font-size', p.titleSize + 'px').text(p.title);

      // group for visual elements
      svg.append('g').attr('transform', 'translate(' + (p.margin.left + p.radius) + ', ' + (p.margin.top + p.radius) + ')').classed('arcs', true);

      // group for labels
      svg.append('g').attr('transform', 'translate(' + (p.margin.left + p.radius) + ', ' + (p.margin.top + p.radius) + ')').classed('labels', true);

      // center
      svg.append('g').attr('transform', 'translate(' + (p.margin.left + p.radius) + ', ' + (p.margin.top + p.radius) + ')').classed('center', true).append('text').attr('text-anchor', 'middle').attr('dy', '0.5ex');
    };

    // accessor
    chart.data = function (d) {
      if (d) {
        p.data = d;
      }
      return p.data;
    };

    chart.update = function () {
      console.log('chart update');
      // Layout
      var root = d4.pie().value(function (d) {
        return d.size;
      })(p.data.serie);
      console.log('pie layout', root);

      // center
      p.total = root.reduce(function (res, r) {
        res += r.data.size;
        return res;
      }, 0);

      d4.select('#' + p.id).select('.center').select('text').text(p.total.toLocaleString());

      // Update pattern
      var sel = void 0;
      var add = void 0;
      // Transitions
      var delay = 500;
      var t1 = d4.transition().duration(delay);
      var t2 = d4.transition().delay(delay).duration(delay);
      var t3 = d4.transition().delay(delay * 2).duration(delay);

      // arcs
      sel = d4.select('#' + p.id).select('.arcs').selectAll('path').data(root, function (d) {
        return d.data.name;
      });
      // exit
      sel.exit().transition(t1).attr('d', 'M0,0A0,0Z').style('opacity', 0).remove();
      // update
      sel.transition(t2).attr('d', function (d) {
        return arc(d);
      });
      // add
      add = sel.enter().append('path').attr('class', function (d) {
        return 'v' + d.data.name;
      }).attr('d', 'M0,0A0,0Z').style('opacity', 0).style('fill', function (d) {
        return color(d.data.name);
      }).style('fill-rule', 'evenodd').style('stroke', '#000').style('cursor', 'pointer').on('mouseover', function (d) {
        return tip('show', d);
      }).on('mousemove', function (d) {
        return tip('move', d);
      }).on('mouseout', function (d) {
        return tip('hide', d);
      });
      // update
      sel = add.merge(sel);
      sel.transition(t3).attr('d', function (d) {
        return arc(d);
      }).style('opacity', 1);

      // filter for labels
      var labelled = root.filter(function (d) {
        return d.endAngle - d.startAngle > p.aMin;
      });
      // path
      sel = d4.select('#' + p.id).select('.labels').selectAll('path').data(labelled, function (d) {
        return d.data.name;
      });
      // exit
      sel.exit().transition(t1).attr('d', 'M0,0A0,0Z').style('opacity', 0).remove();
      // update
      sel.transition(t2).attr('d', function (d) {
        return path(d);
      });
      // add
      add = sel.enter().append('path').attr('id', function (d) {
        return 'map' + p.id + d.data.name;
      }).attr('d', 'M0,0A0,0Z').style('pointer-events', 'none').style('opacity', 0);
      // update
      sel = add.merge(sel);
      sel.transition(t3).attr('d', function (d) {
        return path(d);
      });

      // Labels
      sel = d4.select('#' + p.id).select('.labels').selectAll('text').data(labelled, function (d) {
        return d.data.name;
      });
      // exit
      sel.exit().transition(t1).style('opacity', 0).remove();
      // update
      sel.transition(t2).attr('text-anchor', function (d) {
        return align(d) ? 'end' : 'start';
      });
      // add
      add = sel.enter().append('text').attr('dy', '0.5ex').style('pointer-events', 'none');
      // update
      sel = add.merge(sel);
      sel.transition(t3).attr('text-anchor', function (d) {
        return align(d) ? 'end' : 'start';
      });

      // textPath
      sel = d4.select('#' + p.id).select('.labels').selectAll('text').selectAll('textPath').data(function (d) {
        return [d];
      });
      // update
      sel.transition(t2).attr('startOffset', function (d) {
        return align(d) ? '100%' : '0%';
      });
      // add
      add = sel.enter().append('textPath').attr('xlink:href', function (d) {
        return '#map' + p.id + d.data.name;
      }).text(function (d) {
        return d.data.name;
      });
      // update
      sel = add.merge(sel);
      sel.transition(t3).attr('startOffset', function (d) {
        return align(d) ? '100%' : '0%';
      });
    };

    function tip(state, d) {
      if (state === 'show') {
        d4.select('#tip').datum(d).style('opacity', 1).html(function (d) {
          return 'name: ' + d.data.name + '\n          <br/>value: ' + d.data.size.toLocaleString() + '\n          <br/>(' + percent(d.data.size) + '%)';
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

    return chart;
  }
});
