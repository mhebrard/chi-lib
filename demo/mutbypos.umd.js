(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'd3-axis', 'd3-scale', 'd3-shape', 'd3-transition', 'd3-selection'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('d3-axis'), require('d3-scale'), require('d3-shape'), require('d3-transition'), require('d3-selection'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.d3Axis, global.d3Scale, global.d3Shape, global.d3Transition, global.d3Selection);
    global.mutbypos = mod.exports;
  }
})(this, function (exports, _d3Axis, _d3Scale, _d3Shape, _d3Transition, _d3Selection) {
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

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  // test d3 version Map d3v4
  /* global d3:true */
  var d4 = {};
  if (d3 === 'undefined' || d3.version) {
    d4 = {
      select: d3sel.select,
      selectAll: d3sel.selectAll,
      transition: _d3Transition.transition,
      axisBottom: _d3Axis.axisBottom, axisLeft: _d3Axis.axisLeft, axisRight: _d3Axis.axisRight,
      stack: _d3Shape.stack,
      scaleLinear: _d3Scale.scaleLinear, scaleOrdinal: _d3Scale.scaleOrdinal
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
    p.data = p.data || { 5: { a: 1, t: 1, g: 1, c: 1 }, 10: { a: 2, t: 2, g: 2, c: 2 } };
    p.title = p.title || 'Mutation by position of ' + p.id;
    p.titleSize = p.titleSize || 20;
    p.fontSize = p.fontSize || 14;
    p.width = p.width || 800;
    p.height = p.height || 400;
    p.margin = p.margin || { top: 50, bottom: 40, left: 40, right: 20 };
    p.xRange = p.xRange || [0, 15];
    p.yRange = p.yRange || [0, null];
    p.frames = p.frames || [{ label: 'FRAME1', x1: 5, x2: 10, fill: '#eee' }];
    p.masks = p.masks || [{ label: 'mask1', x1: 1, x2: 5, fill: '#808' }];

    var v = {};
    v.labels = ['a', 't', 'g', 'c'];
    var color = d4.scaleOrdinal().domain(v.labels).range(['#274A99', '#E4A527', '#1FB71F', '#E42727']);

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
        case 'setMasks':
          p.masks = action.payload;
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
      // Scales
      v.x = d4.scaleLinear().domain(p.xRange).range([p.margin.left, p.width - p.margin.right]);
      v.y = d4.scaleLinear()
      // .domain(p.yRange) // in update
      .range([p.height - p.margin.bottom, p.margin.top]);

      // Axis def
      v.xAxis = d4.axisBottom(v.x).ticks(10).tickSize(5, 1);
      v.yAxisOut = d4.axisLeft(v.y).ticks(5).tickSize(5, 0);
      v.yAxisIn = d4.axisRight(v.y).ticks(5).tickSize(p.width - p.margin.right - p.margin.left, 0);

      // SVG
      v.svg = d4.select('#' + p.div).append('svg').attr('id', p.id).attr('title', p.title).attr('width', p.width).attr('height', p.height);

      // Frames
      var sel = v.svg.selectAll('.frame').data(p.frames).enter().append('g').attr('class', 'frame');
      sel.append('text').attr('x', function (d) {
        return v.x((d.x1 + d.x2) / 2);
      }).attr('y', p.margin.top).attr('dy', '-0.5ex').attr('text-anchor', 'middle').on('mousemove', function (d) {
        return tip('move', d);
      }).on('mouseout', function (d) {
        return tip('hide', d);
      }).on('mouseover', function (d) {
        return tip('frame', d);
      }).style('cursor', 'pointer').text(function (d) {
        return d.label;
      });
      sel.selectAll('rect').data(function (d) {
        return [d];
      }).enter().append('rect').attr('x', function (d) {
        return v.x(d.x1 - 0.5);
      }).attr('y', p.margin.top).attr('width', function (d) {
        return v.x(d.x2 + 1) - v.x(d.x1);
      }).attr('height', p.height - p.margin.top - p.margin.bottom).attr('stroke', function (d) {
        return d.fill === 'none' ? 'none' : '#000';
      }).attr('fill', function (d) {
        return d.fill;
      });

      // Title
      v.svg.append('g').attr('class', 'title').append('text').attr('x', 0).attr('y', p.margin.top / 2).attr('dy', '0.5ex').style('font-size', p.titleSize + 'px').text(p.title);

      // Axis
      v.svg.append('g').attr('class', 'axis').attr('transform', 'translate(0, ' + (p.height - p.margin.bottom) + ')').call(v.xAxis);
      v.svg.append('g').attr('class', 'axis yOut').attr('transform', 'translate(' + p.margin.left + ',0)').call(v.yAxisOut);
      v.svg.append('g').attr('class', 'axis yIn').attr('transform', 'translate(' + p.margin.left + ',0)').call(v.yAxisIn);

      // Legend
      sel = v.svg.append('g').attr('class', 'legend');
      sel.append('text').attr('x', p.margin.left / 2).attr('y', p.height / 2 + p.margin.top).attr('text-anchor', 'middle').style('writing-mode', 'vertical-rl').text('Mutation count');
      sel.append('text').attr('x', p.width / 2 + p.margin.left).attr('y', p.height - p.margin.bottom / 2).attr('text-anchor', 'middle').attr('dy', '0.5ex').text('Position');
      sel = sel.append('g').attr('transform', 'translate(' + (p.width - 120) + ', ' + (p.height - p.margin.bottom / 2) + ')');
      sel.selectAll('rect').data(v.labels).enter().append('rect').attr('x', function (d, i) {
        return (i - 1) * 30;
      }).attr('y', 0).attr('height', 10).attr('width', 10).attr('fill', function (d) {
        return color(d);
      });
      sel.selectAll('text').data(v.labels).enter().append('text').attr('x', function (d, i) {
        return (i - 1) * 30 + 15;
      }).attr('y', 5).attr('text-anchor', 'middle').attr('dy', '0.5ex').text(function (d) {
        return d;
      });

      // Series
      v.svg.selectAll('.serie').data(v.labels).enter().append('g').attr('class', 'serie');
    };

    // accessor
    chart.data = function (d) {
      if (d) {
        p.data = d;
      }
      return p.data;
    };

    chart.update = function () {
      // console.log('chart update');
      var poss = Object.keys(p.data);
      // Update pattern
      var sel = void 0;
      var add = void 0;
      // Transitions
      var delay = 500;
      var t1 = d4.transition().duration(delay);
      var t2 = d4.transition().delay(delay).duration(delay);
      var t3 = d4.transition().delay(delay * 2).duration(delay);

      // Masks
      sel = v.svg.selectAll('.mask').data(p.masks);
      // exit
      sel.exit().transition(t1).style('opacity', 0).remove();
      // update
      // add
      add = sel.enter().append('g').attr('class', 'mask').style('opacity', 0);
      add.append('text').attr('x', v.x(0)).attr('y', v.y(0) - 15).attr('dy', '-0.5ex').attr('text-anchor', 'middle');
      add.append('rect').attr('x', v.x(0)).attr('y', v.y(0) - 10).attr('width', 0).attr('height', 10);
      // update
      sel = v.svg.selectAll('.mask').style('opacity', 1);
      sel.selectAll('text').data(function (d) {
        return [d];
      }).transition(t3).attr('x', function (d) {
        return v.x((d.x1 + d.x2) / 2);
      }).text(function (d) {
        return d.label;
      });
      sel.selectAll('rect').data(function (d) {
        return [d];
      }).transition(t3).attr('x', function (d) {
        return Math.max(v.x(0), v.x(d.x1 - 0.5));
      }).attr('width', function (d) {
        return v.x(d.x2 + 1) - v.x(d.x1);
      }).attr('stroke', function (d) {
        return d.fill === 'none' ? 'none' : '#000';
      }).attr('fill', function (d) {
        return d.fill;
      });

      // for each pos under a mask, mutations are down to 0
      poss.forEach(function (f) {
        p.masks.forEach(function (g) {
          if (f >= g.x1 && f <= g.x2) {
            p.data[f] = { a: 0, t: 0, g: 0, c: 0 };
          }
        });
      });

      // AXIS
      var domain = [].concat(_toConsumableArray(p.yRange)) || [0, null];
      var sum = poss.map(function (pos) {
        var mut = p.data[pos];
        return mut.a + mut.t + mut.g + mut.c;
      });
      // Set domain as [0, max+1]
      // if (domain[0] === null) {
      //  domain[0] = Math.min(...sum) - 1;
      // }
      if (domain[1] === null) {
        domain[1] = Math.max.apply(Math, _toConsumableArray(sum)) + 1;
      }
      v.y.domain(domain);

      // update Axis ticks
      v.yAxisOut = d4.axisLeft(v.y).ticks(5).tickSize(5, 0);
      v.yAxisIn = d4.axisRight(v.y).ticks(5).tickSize(p.width - p.margin.right - p.margin.left, 0);

      // update axis
      v.svg.select('.yOut').transition(t3).call(v.yAxisOut);
      v.svg.select('.yIn').transition(t3).call(v.yAxisIn);

      // Layout
      var layout = d4.stack().keys(v.labels)(poss.map(function (m) {
        return p.data[m];
      }));
      // console.log('layout', layout);

      // Rects
      sel = d4.select('#' + p.id).selectAll('.serie').data(layout).attr('fill', function (d) {
        return color(d.key);
      }).selectAll('rect').data(function (d) {
        return d;
      });
      // exit
      sel.exit().transition(t1).attr('y', v.y(0)).attr('height', 0).remove();
      // update
      sel.transition(t2).attr('x', function (d, i) {
        return v.x(poss[i] - 0.5);
      }).attr('y', function (d) {
        return v.y(d[1]);
      }).attr('height', function (d) {
        return v.y(d[0]) - v.y(d[1]);
      });
      // add
      add = sel.enter().append('rect').attr('x', function (d, i) {
        return v.x(poss[i] - 0.5);
      }) // Rect is centered on the tick
      .attr('y', v.y(0)).attr('height', 0).attr('width', v.x(1) - v.x(0)) // Rect width is 1 unit
      .on('mousemove', function (d) {
        return tip('move', d);
      }).on('mouseout', function (d) {
        return tip('hide', d);
      });
      // update
      sel = add.merge(sel);
      sel.on('mouseover', function (d, i) {
        return tip('show', { pos: poss[i], value: d[1] - d[0] });
      }).transition(t3).attr('x', function (d, i) {
        return v.x(poss[i] - 0.5);
      }) // Rect is centered on the tick
      .attr('y', function (d) {
        return v.y(d[1]);
      }).attr('height', function (d) {
        return v.y(d[0]) - v.y(d[1]);
      });
    };

    function tip(state, d) {
      if (state === 'show') {
        d4.select('#tip').datum(d).style('opacity', 1).html(function (d) {
          return 'Position: ' + d.pos + '<br/>\nValue: ' + d.value;
        });
        // highlight(d);
      } else if (state === 'frame') {
        d4.select('#tip').datum(d).style('opacity', 1).html(function (d) {
          return 'Frame: ' + d.label + '<br/>\nStart: ' + d.x1 + '<br/>\nStop: ' + d.x2;
        });
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
