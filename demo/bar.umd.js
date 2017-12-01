(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'd3-axis', 'd3-scale', 'd3-scale-chromatic', 'd3-transition', 'd3-selection'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('d3-axis'), require('d3-scale'), require('d3-scale-chromatic'), require('d3-transition'), require('d3-selection'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.d3Axis, global.d3Scale, global.d3ScaleChromatic, global.d3Transition, global.d3Selection);
    global.bar = mod.exports;
  }
})(this, function (exports, _d3Axis, _d3Scale, _d3ScaleChromatic, _d3Transition, _d3Selection) {
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
      axisLeft: _d3Axis.axisLeft, axisRight: _d3Axis.axisRight,
      scaleBand: _d3Scale.scaleBand, scaleLinear: _d3Scale.scaleLinear, scaleOrdinal: _d3Scale.scaleOrdinal,
      schemeSet3: _d3ScaleChromatic.schemeSet3,
      select: d3sel.select,
      selectAll: d3sel.selectAll,
      transition: _d3Transition.transition
    };
  } else {
    d4 = d3;
  }

  function Chart(p) {
    var chart = { version: 2.0 };

    // PARAMETERS
    p = p || {};
    p.div = p.div || 'body';
    p.id = p.id || 'view';
    p.data = p.data || { serie: [{ name: 'root', size: 1 }] };
    p.title = p.title || 'Bar chart of ' + p.id;
    p.titleSize = p.titleSize || 20;
    p.fontSize = p.fontSize || 14;
    p.width = p.width || 800;
    p.height = p.height || 600;
    p.margin = p.margin || { top: 30, bottom: 5, left: 5, right: 0 };
    p.legend = p.legend || { inner: true, bottom: 100, left: 50, padding: 5 };
    p.color = p.color || d4.schemeSet3;
    p.padding = p.padding || 0.1;
    p.cutoff = p.cutoff || null;
    if (p.sort === undefined) {
      p.sort = function (a, b) {
        return b.size - a.size;
      };
    }

    var color = d4.scaleOrdinal(p.color);
    var v = {}; // Global variables

    var percent = function percent(value) {
      var res = Math.round(value * 100 * 100 / v.total) / 100;
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
        case 'setCutoff':
          p.cutoff = action.payload;
          chart.update();
          break;
        case 'disable':
          action.node.disabled = true;
          chart.update();
          break;
        case 'enable':
          action.node.disabled = false;
          chart.update();
          break;
        default:
        // console.log('unknown event');
      }
    };

    // add dispatcher to parameters
    p.dispatch = p.dispatch || chart.consumer;

    chart.init = function () {
      // console.log('chart init');
      // Scale
      v.x = d4.scaleBand().rangeRound([p.margin.left + p.legend.left, p.width - p.margin.left - p.legend.left - p.margin.right]).padding(p.padding);
      v.y = d4.scaleLinear().rangeRound([p.height - p.margin.top - p.margin.bottom - p.legend.bottom, p.margin.top]);

      // Axis
      v.yAxisOut = d4.axisLeft(v.y).ticks(5).tickSize(5, 0);

      v.yAxisIn = d4.axisRight(v.y).ticks(5).tickSize(p.width - p.margin.right - p.legend.left - p.margin.left, 0);

      // SVG
      v.svg = d4.select('#' + p.div).append('svg').attr('id', p.id).attr('title', p.title).attr('width', p.width).attr('height', p.height);

      // title
      v.svg.append('g').attr('class', 'title').append('text').attr('x', 0).attr('y', p.margin.top / 2).attr('dy', '0.5ex').style('font-size', p.titleSize + 'px').text(p.title);

      // Axis
      v.svg.append('g').attr('class', 'axis yOut').attr('transform', 'translate(' + (p.margin.left + p.legend.left) + ',0)').call(v.yAxisOut);

      v.svg.append('g').attr('class', 'axis yIn').attr('transform', 'translate(' + (p.margin.left + p.legend.left) + ',0)').call(v.yAxisIn);

      // group for visual elements
      v.svg.append('g').classed('bars', true);

      // group for legend
      v.svg.append('g').classed('legendInner', true);
      v.svg.append('g').classed('legendBottom', true);
    };

    // accessor
    chart.data = function (d) {
      if (d) {
        p.data = d;
      }
      return p.data;
    };

    chart.update = function () {
      // C console.log('chart update');
      // Filter and sort data
      var filtered = p.data.serie.filter(function (d) {
        return p.cutoff ? d.size > p.cutoff : true;
      }).sort(p.sort);

      v.total = filtered.reduce(function (tot, r) {
        // Disabled category
        r.disabled = r.name === 'disabled' ? true : r.disabled;
        // Sum data
        tot += r.size;
        return tot;
      }, 0);
      // Scale domains
      v.x.domain(filtered.map(function (d) {
        return d.name;
      }));
      v.y.domain([0, d3.max(filtered, function (d) {
        return d.size;
      })]);
      // Axis
      v.yAxisOut = d4.axisLeft(v.y).ticks(5).tickSize(5, 0);
      v.yAxisIn = d4.axisRight(v.y).ticks(5).tickSize(p.width - p.margin.right - p.legend.left - p.margin.left, 0);

      // Update pattern
      var sel = void 0;
      var add = void 0;
      // Transitions
      var delay = 500;
      var t1 = d4.transition().duration(delay);
      var t2 = d4.transition().delay(delay).duration(delay);
      var t3 = d4.transition().delay(delay * 2).duration(delay);

      // Update axis
      v.svg.select('.yOut').transition(t3).call(v.yAxisOut);
      v.svg.select('.yIn').transition(t3).call(v.yAxisIn);

      // Update bars
      sel = d4.select('#' + p.id).select('.bars').selectAll('rect').data(filtered, function (d) {
        return d.name;
      });
      // exit
      sel.exit().transition(t1).attr('y', v.y(0)).attr('height', 0).style('opacity', 0).remove();
      // update
      sel.transition(t1).style('fill', function (d) {
        return d.disabled ? '#eee' : color(d.name);
      }).style('stroke', function (d) {
        return d.disabled ? '#fff' : '#000';
      });
      sel.transition(t2).attr('x', function (d) {
        return v.x(d.name);
      }).attr('y', function (d) {
        return v.y(d.size);
      }).attr('width', v.x.bandwidth()).attr('height', function (d) {
        return v.y(0) - v.y(d.size);
      });
      // add
      add = sel.enter().append('rect').attr('class', function (d) {
        return 'v' + d.name;
      }).attr('x', function (d) {
        return v.x(d.name);
      }).attr('y', v.y(0)).attr('width', v.x.bandwidth()).attr('height', 0).style('opacity', 0).style('fill-rule', 'evenodd').style('cursor', 'pointer').on('click', function (d) {
        if (d.disabled) {
          p.dispatch({ type: 'enable', node: d, chart: p.id });
        } else {
          p.dispatch({ type: 'disable', node: d, chart: p.id });
        }
      }).on('mouseover', function (d) {
        return tip('show', d);
      }).on('mousemove', function (d) {
        return tip('move', d);
      }).on('mouseout', function (d) {
        return tip('hide', d);
      });
      // update
      sel = add.merge(sel);
      sel.transition(t3).attr('y', function (d) {
        return v.y(d.size);
      }).attr('height', function (d) {
        return v.y(0) - v.y(d.size);
      }).style('fill', function (d) {
        return d.disabled ? '#eee' : color(d.name);
      }).style('stroke', function (d) {
        return d.disabled ? '#fff' : '#000';
      }).style('opacity', 1);

      // legend
      if (p.legend.inner) {
        addLegend('I', v.svg.select('.legendInner'), filtered);
      }
      if (p.legend.bottom > 2 * p.legend.padding) {
        addLegend('B', v.svg.select('.legendBottom'), filtered);
      }

      function addLegend(place, g, data) {
        // Update path
        sel = g.selectAll('path').data(data, function (d) {
          return d.name;
        });
        // exit
        sel.exit().transition(t1).attr('d', function (d) {
          return path('hide', place, d);
        }).remove();
        // update
        sel.transition(t2).attr('d', function (d) {
          return path('show', place, d);
        });
        // add
        add = sel.enter().append('path').attr('id', function (d) {
          return 'map' + p.id + place + d.name.replace(' ', '_');
        }).attr('d', function (d) {
          return path('hide', place, d);
        }).style('pointer-events', 'none').style('opacity', 0);
        // update
        sel = add.merge(sel);
        sel.transition(t3).attr('d', function (d) {
          return path('show', place, d);
        });

        // Update labels
        sel = g.selectAll('text').data(data, function (d) {
          return d.name;
        });
        // exit
        sel.exit().transition(t1).style('opacity', 0).remove();
        // add
        add = sel.enter().append('text').attr('text-anchor', 'start').attr('dy', '0.5ex').style('pointer-events', 'none');
        // textPath
        sel = g.selectAll('text').selectAll('textPath').data(function (d) {
          return [d];
        });
        // add
        add = sel.enter().append('textPath').attr('xlink:href', function (d) {
          return '#map' + p.id + place + d.name.replace(' ', '_');
        }).text(function (d) {
          return d.name;
        });
      }
    };

    function path(mode, place, d) {
      var x = v.x(d.name) + v.x.bandwidth() / 2;
      if (mode === 'hide') {
        if (place === 'I') {
          return 'M' + x + ', ' + (v.y(0) - p.legend.padding) + ' V' + (v.y(0) - p.legend.padding - 1);
        } // Else place === 'B'
        return 'M' + x + ', ' + (v.y(0) + p.legend.padding) + ' V' + (v.y(0) + p.legend.padding + 1);
      } // Else mode === 'show'
      if (place === 'I') {
        return 'M' + x + ', ' + (v.y(0) - p.legend.padding) + ' V' + (v.y(d.size) + p.legend.padding);
      } // Else place === 'B'
      return 'M' + x + ', ' + (v.y(0) + p.legend.padding) + ' V' + (v.y(0) + p.legend.bottom - p.legend.padding);
    }

    function tip(state, d) {
      if (state === 'show') {
        d4.select('#tip').datum(d).style('opacity', 1).html(function (d) {
          return 'name: ' + d.name + '\n          <br/>value: ' + d.size.toLocaleString() + '\n          <br/>(' + percent(d.size) + '%)';
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
          y = d3.event.layerY;
          x = d3.event.layerX;
        }
        d4.select('#tip').style('top', y - 10 + 'px').style('left', x + 10 + 'px');
      }
    }

    return chart;
  }
});
