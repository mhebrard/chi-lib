(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'd3-array', 'd3-axis', 'd3-scale', 'd3-shape', 'd3-selection', 'd3-transition'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('d3-array'), require('d3-axis'), require('d3-scale'), require('d3-shape'), require('d3-selection'), require('d3-transition'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.d3Array, global.d3Axis, global.d3Scale, global.d3Shape, global.d3Selection, global.d3Transition);
    global.violin = mod.exports;
  }
})(this, function (exports, _d3Array, _d3Axis, _d3Scale, _d3Shape, _d3Selection, _d3Transition) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Chart;

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
      ascending: _d3Array.ascending, extent: _d3Array.extent, histogram: _d3Array.histogram, max: _d3Array.max, mean: _d3Array.mean, quantile: _d3Array.quantile, range: _d3Array.range,
      axisLeft: _d3Axis.axisLeft, axisRight: _d3Axis.axisRight,
      scaleOrdinal: _d3Scale.scaleOrdinal, scaleLinear: _d3Scale.scaleLinear,
      area: _d3Shape.area, line: _d3Shape.line, curveBasis: _d3Shape.curveBasis, curveCatmullRom: _d3Shape.curveCatmullRom, curveLinear: _d3Shape.curveLinear, curveStepAfter: _d3Shape.curveStepAfter,
      select: _d3Selection.select, selectAll: _d3Selection.selectAll,
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
    p.options = p.options || null;
    p.data = p.data || { serie: [0, 1] };
    p.title = p.title || 'Violin plot of ' + p.id;
    p.titleSize = p.titleSize || 20;
    p.fontSize = p.fontSize || 14;
    // p.width // adjust according to series number
    p.height = p.height || 600;
    p.margin = p.margin || { top: 30, bottom: 40, left: 50, right: 50 };
    p.layouts = p.layouts || { violin: true, box: true, bar: false, beeswarm: false };
    p.ymin = p.ymin || null;
    p.ymax = p.ymax || null;
    p.catWidth = p.catWidth || 100;
    p.catSpacing = p.catSpacing || 20;
    p.strokeWidth = p.strokeWidth || 3;
    p.resolution = p.resolution || 10;
    p.interpolation = p.interpolation || 'catmull'; // catmull | basis | linear | step
    p.xScale = p.xScale === 'common' ? 'common' : 'each'; // each | common
    p.bg = p.bg || ['#F88', '#A8F', '#AF8', '#8FF', '#FA8', '#F8F', '#8F8', '#88F', '#FF8', '#F8A', '#8FA', '#8AF'];
    p.fg = p.fg || ['#900', '#609', '#690', '#099', '#960', '#909', '#090', '#009', '#990', '#906', '#096', '#069'];

    var color = d4.scaleOrdinal(d4.range(12));
    var v = {};
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
        case 'setLayouts':
          {
            var a = action.payload;
            if (a.violin !== undefined) {
              p.layouts.violin = a.violin;
            }
            if (a.box !== undefined) {
              p.layouts.box = a.box;
            }
            if (a.bar !== undefined) {
              p.layouts.bar = a.bar;
            }
            if (a.beeswarm !== undefined) {
              p.layouts.beeswarm = a.beeswarm;
            }
            chart.update();
            break;
          }
        default:
        // console.log('unknown event');
      }
    };

    // add dispatcher to parameters
    p.dispatch = p.dispatch || chart.consumer;

    chart.init = function () {
      // svg width (adjust according to series number)
      v.width = 300;
      // domain Y
      v.domain = [0, 1];
      // curve
      v.curve = '';
      switch (p.interpolation) {
        case 'linear':
          v.curve = d4.curveLinear;
          break;
        case 'step':
          v.curve = d4.curveStepAfter;
          break;
        case 'basis':
          v.curve = d4.curveBasis;
          break;
        default:
          // CatmullRom
          v.curve = d4.curveCatmullRom;
      }
      // Scales
      v.y = d4.scaleLinear().range([p.height - p.margin.bottom, p.margin.top]);

      v.x = d4.scaleLinear().range([0, p.catWidth]);

      v.yV = d4.scaleLinear().range([p.catWidth / 2, 0]);

      v.xV = d4.scaleLinear().range([p.height - p.margin.bottom, p.margin.top]).nice();

      // Axis
      v.yAxisOut = d4.axisLeft(v.y).ticks(5).tickSize(5, 0);

      v.yAxisIn = d4.axisRight(v.y).ticks(5).tickSize(v.width - p.margin.right - p.margin.left, 0);

      // SVG
      v.svg = d4.select('#' + p.div).append('svg').attr('id', p.id).attr('title', p.title).attr('width', v.width).attr('height', p.height);

      // title
      v.svg.append('g').attr('class', 'title').append('text').attr('x', 0).attr('y', p.margin.top / 2).attr('dy', '0.5ex').style('font-size', p.titleSize + 'px').text(p.title);

      // Axis
      v.svg.append('g').attr('class', 'axis yOut').attr('transform', 'translate(' + p.margin.left + ',0)').call(v.yAxisOut);

      v.svg.append('g').attr('class', 'axis yIn').attr('transform', 'translate(' + p.margin.left + ',0)').call(v.yAxisIn);

      // Legend
      var sel = v.svg.append('g').attr('class', 'legend');
      sel.append('circle');
      sel.append('text');

      // Options
      if (p.options) {
        d4.select('#' + p.options).append('b').text('Layouts: ');
        d4.select('#' + p.options).selectAll('input').data(Object.keys(p.layouts)).enter().append('label').attr('for', function (d) {
          return 'layout-' + d;
        }).text(function (d) {
          return d;
        }).append('input').attr('type', 'checkbox').attr('id', function (d) {
          return 'layout-' + d;
        }).property('checked', function (d) {
          return p.layouts[d];
        }).style('margin', '0 10px 0 5px').on('change', layoutChange);
      }
    };

    // accessor
    chart.data = function (d) {
      if (d) {
        p.data = d;
      }
      return p.data;
    };

    chart.update = function () {
      // console.log('UPDATE');
      // series
      var keys = Object.keys(p.data).sort(d4.ascending);
      var sorted = keys.map(function (k) {
        return p.data[k].sort(d4.ascending);
      });

      // update pattern
      var sel = void 0;
      var add = void 0;
      // transitions
      var delay = 500;
      var t1 = d4.transition().duration(delay);
      var t2 = d4.transition().delay(delay).duration(delay);
      var t3 = d4.transition().delay(delay * 2).duration(delay);

      // AXIS
      // update width
      v.width = p.catSpacing + keys.length * (p.catWidth + p.catSpacing) + p.margin.left + p.margin.right;
      d4.select('#' + p.div).select('svg').transition(t3).attr('width', v.width);

      // update y axis domain
      // Set domain as [min-1, max+1]
      if (p.ymin === null) {
        v.domain[0] = Math.min.apply(Math, _toConsumableArray(sorted.map(function (s) {
          return s[0];
        }))) - 1;
      } else {
        v.domain[0] = p.ymin;
      }
      if (p.ymax === null) {
        v.domain[1] = Math.max.apply(Math, _toConsumableArray(sorted.map(function (s) {
          return s[s.length - 1];
        }))) + 1;
      } else {
        v.domain[1] = p.ymax;
      }
      v.y.domain(v.domain);

      // update Axis ticks
      v.yAxisOut = d4.axisLeft(v.y).ticks(5).tickSize(5, 0);

      v.yAxisIn = d4.axisRight(v.y).ticks(5).tickSize(v.width - p.margin.right - p.margin.left, 0);

      // update axis
      v.svg.select('.yOut').transition(t3).call(v.yAxisOut);
      v.svg.select('.yIn').transition(t3).call(v.yAxisIn);

      // VIOLIN
      // Violin X scale
      v.xV.domain(v.domain);

      /**/ /* // TEST BIN
           const data = [1,2,2,3,3,3,4,5,6,7,7,7,8,8,9,10];
           // Number of bars I wish to have
           const binCount = 20;
           // Scale based on data
           const scale = d4.scaleLinear()
           .domain(d4.extent(data))
           .rangeRound([0, 100]);
           // Using threshold(array)
           const bin = d4.histogram().thresholds(scale.ticks(binCount))(data);
           const binLng = bin.length;
           const binLast = bin[binLng - 1];
           console.log(`BIN TEST: lng:${binLng} - last:[${binLast.x0},${binLast.x1}]: ${binLast}`);
           // console.log('data', data, 'scale.domain', scale.domain[0], scale.domain[0], 'ticks', '20', 'bin', bin);
           */ /**/ // SHOULD BE lng: 19 - last: [10,10]: 10 // JsFiddle works, Here bug

      v.bins = sorted.map(function (s) {
        return d4.histogram().thresholds(v.xV.ticks(p.resolution))(s);
      });

      // Violin Y scale
      if (p.xScale === 'common') {
        // same y scale for all series
        // violin width
        v.yViolinMax = Math.max.apply(Math, _toConsumableArray(v.bins.map(function (b) {
          return Math.max.apply(Math, _toConsumableArray(b.map(function (vals) {
            return vals.length;
          })));
        })));
        v.yV.domain([0, v.yViolinMax]);
      }

      // violin group
      sel = d4.select('#' + p.div).select('svg').selectAll('.serie').data(keys, function (k) {
        return k;
      });
      // exit
      sel.exit().transition(t1).style('opacity', 0).remove();
      // update
      sel.transition(t2).attr('transform', function (d, i) {
        return 'translate(' + (p.catSpacing + i * (p.catWidth + p.catSpacing) + p.margin.left) + ', 0)';
      });
      // add
      add = sel.enter().append('g').attr('class', function (d, i) {
        return 'serie ' + keys[i];
      }).style('opacity', 0);
      // update
      sel = add.merge(sel);
      sel.transition(t3).attr('transform', function (k, i) {
        return 'translate(' + (p.catSpacing + i * (p.catWidth + p.catSpacing) + p.margin.left) + ', 0)';
      }).style('opacity', 1);

      keys.forEach(function (k, i) {
        var g = d4.select('#' + p.div).select('svg').select('.' + k);
        // layouts order
        var lay = ['violin', 'bar', 'beeswarm', 'box'];
        lay.forEach(function (l) {
          g.selectAll('.' + l).data([l]).enter().append('g').attr('class', l);

          var sub = g.select('.' + l);
          if (p.layouts[l]) {
            sub.transition(t2).style('opacity', 1);
            switch (l) {
              case 'violin':
                addViolin(sub, v.bins[i], k);
                break;
              case 'bar':
                addBar(sub, v.bins[i], k);
                break;
              case 'beeswarm':
                addCircle(sub, v.bins[i], k);
                break;
              case 'box':
                addBoxPlot(sub, sorted[i], k, 0.10);
                break;
              default:
            }
          } else {
            sub.transition(t1).style('opacity', 0).text(null);
          }
        });
        addLabel(g, k);

        // Legend
        if (p.layouts.beeswarm) {
          v.svg.select('.legend').attr('transform', 'translate(' + (v.width - 120) + ', ' + (p.height - p.margin.bottom / 2) + ')').style('opacity', 1);
        } else {
          v.svg.select('.legend').style('opacity', 0);
        }
      });

      function addViolin(g, bins, k) {
        // Violin Y scale
        if (p.xScale === 'each') {
          // y scale for each series
          // violin width
          v.yViolinMax = Math.max.apply(Math, _toConsumableArray(bins.map(function (vals) {
            return vals.length;
          })));
          v.yV.domain([0, v.yViolinMax]);
        }
        // shapes
        var area = d4.area().curve(v.curve).x(function (d) {
          return v.xV(d.x0);
        }).y0(p.catWidth / 2).y1(function (d) {
          return v.yV(d.length);
        });

        var line = d4.line().curve(v.curve).x(function (d) {
          return v.xV(d.x0);
        }).y(function (d) {
          return v.yV(d.length);
        });

        // Add plus curve
        sel = g.selectAll('.plus').data([0]);
        add = sel.enter().append('g').attr('class', 'plus').attr('transform', 'rotate(90,0,0)  translate(0,-' + p.catWidth + ')');
        add.append('path').attr('class', 'area').style('fill', p.bg[color(k)]).style('stroke', 'none');
        add.append('path').attr('class', 'line').style('fill', 'none').style('stroke', '#000');
        // Add minus curve
        sel = g.selectAll('.minus').data([0]);
        add = sel.enter().append('g').attr('class', 'minus').attr('transform', 'rotate(90,0,0) scale(1,-1)');
        add.append('path').attr('class', 'area').style('fill', p.bg[color(k)]).style('stroke', 'none');
        add.append('path').attr('class', 'line').style('fill', 'none').style('stroke', '#000');
        // update
        g.selectAll('.area').transition(t3).attr('d', area(bins));
        g.selectAll('.line').transition(t3).attr('d', line(bins));
      }

      function addBar(g, bins, k) {
        // Violin Y scale
        if (p.xScale === 'each') {
          // y scale for each series
          // violin width
          v.yViolinMax = Math.max.apply(Math, _toConsumableArray(bins.map(function (vals) {
            return vals.length;
          })));
          v.yV.domain([0, v.yViolinMax]);
        }
        // Add plus
        sel = g.selectAll('.plus').data([0]);
        add = sel.enter().append('g').attr('class', 'plus').attr('transform', 'rotate(90,0,0)  translate(0,-' + p.catWidth + ')');
        // Add minus
        sel = g.selectAll('.minus').data([0]);
        add = sel.enter().append('g').attr('class', 'minus').attr('transform', 'rotate(90,0,0) scale(1,-1)');
        // Update plus
        sel = g.selectAll('.plus').selectAll('rect').data(bins);
        // exit
        sel.exit().transition(t1).attr('width', 0).attr('height', 0).remove();
        // update
        // add
        add = sel.enter().append('rect').style('fill', p.bg[color(k)]).style('stroke', '#000');
        // update
        sel = add.merge(sel);
        sel.transition(t3).attr('x', function (d) {
          return v.xV(d.x0);
        }).attr('y', function (d) {
          return v.yV(d.length);
        }).attr('width', function (d) {
          return v.xV(d.x0) - v.xV(d.x1);
        }).attr('height', function (d) {
          return v.yV(0) - v.yV(d.length);
        });
        // Update minus
        sel = g.selectAll('.minus').selectAll('rect').data(bins);
        // exit
        sel.exit().transition(t1).attr('width', 0).attr('height', 0).remove();
        // update
        // add
        add = sel.enter().append('rect').style('fill', p.bg[color(k)]).style('stroke', '#000');
        // update
        sel = add.merge(sel);
        sel.transition(t3).attr('x', function (d) {
          return v.xV(d.x0);
        }).attr('y', function (d) {
          return v.yV(d.length);
        }).attr('width', function (d) {
          return v.xV(d.x0) - v.xV(d.x1);
        }).attr('height', function (d) {
          return v.yV(0) - v.yV(d.length);
        });
      }

      function addCircle(g, bins, k) {
        // Violin Y scale
        if (p.xScale === 'each') {
          // y scale for each series
          // violin width
          v.yViolinMax = Math.max.apply(Math, _toConsumableArray(bins.map(function (vals) {
            return vals.length;
          })));
          v.yV.domain([0, v.yViolinMax]);
        }
        // Scale data to circles
        var radius = (v.xV(bins[1].x0) - v.xV(bins[1].x1)) / 2;
        // v.yV[ymax, 0]
        var circleMax = Math.floor(v.yV(0) / radius);
        var valueByCircle = Math.floor(v.yViolinMax / circleMax);
        if (valueByCircle === 0) {
          valueByCircle = 1;
        }

        // Legend
        v.svg.select('.legend').select('circle').attr('cx', radius + 2).attr('cy', radius + 2).attr('r', radius).style('fill', p.bg[0]).style('stroke', '#000');
        v.svg.select('.legend').select('text').attr('x', radius + 12).attr('y', radius + 2)
        // .attr('text-anchor', 'middle')
        .attr('dy', '0.5ex').text(function () {
          return valueByCircle === 1 ? '= 1' : '= 1 to ' + valueByCircle;
        });

        // Add plus
        sel = g.selectAll('g').data([k]);
        add = sel.enter().append('g').attr('transform', 'rotate(90,0,0)  translate(0,-' + p.catWidth + ')').style('fill', p.bg[color(k)]).style('stroke', '#000');
        sel = add.merge(sel);
        // One groub by bin
        var sub = sel.selectAll('g').data(bins);
        // exit // update
        // add
        add = sub.enter().append('g').attr('transform', function (d) {
          return 'translate(' + v.xV(d.x0) + ', ' + v.yV(0) + ')';
        });
        // update
        sub = add.merge(sub);
        sub.transition(t3).attr('transform', function (d) {
          return 'translate(' + v.xV(d.x0) + ', ' + v.yV(0) + ')';
        });

        // Circles
        sel = sub.selectAll('circle').data(function (d) {
          // transform data to circles
          var value = d.length;
          var draw = [];
          if (value > 0) {
            // value exist
            // nb circle
            var c = Math.ceil(value / valueByCircle);
            // circle center
            var center = 0;
            if (c % 2 !== 0) {
              // nb of circle odd
              // draw central circle
              draw.push(center);
              center += radius;
            }
            while (draw.length < c) {
              // draw symmetric circles
              center += radius;
              draw.push(center);
              draw.push(-center);
              center += radius;
            }
          }
          return draw;
        });
        // exit
        sel.exit().transition(t1).attr('r', 0).remove();
        // update
        // add
        add = sel.enter().append('circle').attr('cx', 0).attr('cy', 0).attr('r', 0);
        // update
        sel = add.merge(sel);
        sel.transition(t3).attr('cy', function (d) {
          return d;
        }).attr('r', radius);
      }

      function addBoxPlot(g, vals, k, boxPlotWidth) {
        var left = 0.5 - boxPlotWidth / 2;
        var right = 0.5 + boxPlotWidth / 2;

        var probs = [0.05, 0.25, 0.5, 0.75, 0.95];
        for (var i = 0; i < probs.length; i++) {
          probs[i] = v.y(d4.quantile(vals, probs[i]));
        }

        var iSH = [0, 2, 4];
        var iSV = [[0, 1], [3, 4]];

        sel = g.selectAll('.box').data([k]);
        add = sel.enter();
        add.append('rect').attr('class', 'box').style('fill', p.bg[color(k)]).style('stroke', p.fg[color(k)]).style('stroke-width', p.strokeWidth);
        add.selectAll('.iSH').data(iSH).enter().append('line').attr('class', 'ISH').style('stroke', p.fg[color(k)]).style('stroke-width', p.strokeWidth);
        add.selectAll('iSV').data(iSV).enter().append('line').attr('class', 'ISV').style('stroke', p.fg[color(k)]).style('stroke-width', p.strokeWidth);
        add.selectAll('.mean').data([k]).enter().append('circle').attr('class', 'mean').style('fill', p.bg[color(k)]).style('stroke', '#000').attr('r', v.x(boxPlotWidth / 5));
        // update
        // sel = d4.select(g.node());
        g.select('.box').transition(t3).attr('x', v.x(left)).attr('width', v.x(right) - v.x(left)).attr('y', probs[3] || 0).attr('height', -probs[3] + probs[1] || 0);
        g.selectAll('.ISH').transition(t3).attr('x1', v.x(left)).attr('x2', v.x(right)).attr('y1', function (d) {
          return probs[d] || 0;
        }).attr('y2', function (d) {
          return probs[d] || 0;
        });
        g.selectAll('.ISV').transition(t3).attr('x1', v.x(0.5)).attr('x2', v.x(0.5)).attr('y1', function (d) {
          return probs[d[0]] || 0;
        }).attr('y2', function (d) {
          return probs[d[1]] || 0;
        });
        g.selectAll('.mean').transition(t3).attr('cx', v.x(0.5)).attr('cy', v.y(d4.mean(vals)) || 0);
      }

      function addLabel(g, label) {
        g.selectAll('text').data([label]).enter().append('text').attr('class', 'label').attr('x', v.x(0.5)).attr('y', p.height - p.margin.bottom / 2).attr('dy', '-0.5ex').attr('text-anchor', 'middle').style('fill', '#000').text(label);
      }
    };

    function layoutChange() {
      var _this = this;

      d4.select(this).each(function (d) {
        p.layouts[d] = _this.checked;
        chart.update();
      });
    }
    // RETURN
    return chart;
  }
});
