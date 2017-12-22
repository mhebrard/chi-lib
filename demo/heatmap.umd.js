(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'd3-array', 'd3-axis', 'd3-collection', 'd3-interpolate', 'd3-scale', 'd3-transition', 'd3-selection'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('d3-array'), require('d3-axis'), require('d3-collection'), require('d3-interpolate'), require('d3-scale'), require('d3-transition'), require('d3-selection'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.d3Array, global.d3Axis, global.d3Collection, global.d3Interpolate, global.d3Scale, global.d3Transition, global.d3Selection);
    global.heatmap = mod.exports;
  }
})(this, function (exports, _d3Array, _d3Axis, _d3Collection, _d3Interpolate, _d3Scale, _d3Transition, _d3Selection) {
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
      max: _d3Array.max, range: _d3Array.range,
      axisLeft: _d3Axis.axisLeft, axisRight: _d3Axis.axisRight, axisTop: _d3Axis.axisTop, axisBottom: _d3Axis.axisBottom,
      set: _d3Collection.set,
      interpolateRgbBasis: _d3Interpolate.interpolateRgbBasis,
      scaleBand: _d3Scale.scaleBand, scaleLinear: _d3Scale.scaleLinear, scaleThreshold: _d3Scale.scaleThreshold,
      select: d3sel.select,
      selectAll: d3sel.selectAll,
      transition: _d3Transition.transition
    };
  } else {
    d4 = d3;
  }

  function Chart(p) {
    var chart = { version: '2.1.1' };

    // PARAMETERS
    p = p || {};
    p.div = p.div || 'body';
    p.id = p.id || 'view';
    p.data = p.data || { serie: [{ x: 'col1', y: 'row1', size: 1 }] };
    p.title = p.title || 'Heatmap of ' + p.id;
    p.titleSize = p.titleSize || 20;
    p.fontSize = p.fontSize || 14;
    p.width = p.width || 800;
    p.height = p.height || 400;
    p.margin = p.margin || { top: 30, bottom: 5, left: 5, right: 5 };
    p.legend = p.legend || { top: 70, bottom: 70, left: 100, right: 100 };
    p.grid = p.grid || false; // true: use gris size, false: use global size;
    p.gridWidth = p.gridWidth || 0;
    p.gridHeight = p.gridHeight || 0;
    p.color = p.color || ['#ffffff', '#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000', '#550000']; // ColorBrewer sequential
    p.cornerRadius = p.cornerRadius || 3;
    p.padding = p.padding || 0.1;

    // Scale values from 0 to 1
    var scale = d4.scaleLinear().range([0.000, 1.000]);
    // Threshold color according to color list
    var color = d4.scaleThreshold().domain(d4.range(p.color.length - 1).map(function (m) {
      return m / (p.color.length - 1);
    })).range(p.color);
    var v = {}; // Global variables

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
        case 'enableGroup':
          action.payload.enable.forEach(function (n) {
            n.disabled = false;
          });
          action.payload.disable.forEach(function (n) {
            n.disabled = true;
          });
          chart.update();
          break;
        case 'enableAll':
          p.data.serie.forEach(function (n) {
            n.disabled = false;
          });
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

      // labels
      v.labelx = {};
      v.labely = {};

      // Scale
      v.x = d4.scaleBand();
      v.y = d4.scaleBand();

      // Axis
      v.xAxisTop = d4.axisTop(v.x);
      v.xAxisBottom = d4.axisBottom(v.x);
      v.yAxisLeft = d4.axisLeft(v.y);
      v.yAxisRight = d4.axisRight(v.y);

      // SVG
      v.svg = d4.select('#' + p.div).append('svg').attr('id', p.id).attr('title', p.title);

      // title
      v.svg.append('g').attr('class', 'title').append('text').attr('x', 0).attr('y', p.margin.top / 2).attr('dy', '0.5ex').style('font-size', p.titleSize + 'px').text(p.title);

      // group for visual elements
      v.svg.append('g').classed('cells', true);

      // group for legend
      v.svg.append('g').classed('legendTop', true).attr('transform', 'translate(0, ' + (p.margin.top + p.legend.top) + ')');
      v.svg.append('g').classed('legendBottom', true).attr('transform', 'translate(0, ' + (p.height - p.margin.bottom - p.legend.bottom) + ')');
      v.svg.append('g').classed('legendLeft', true).attr('transform', 'translate(' + (p.margin.left + p.legend.left) + ', 0)');
      v.svg.append('g').classed('legendRight', true).attr('transform', 'translate(' + (p.width - p.margin.right - p.legend.right) + ', 0)');
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

      // Labels
      // Delete old labels
      Object.keys(v.labelx).forEach(function (k) {
        v.labelx[k].keep = false;
      });
      Object.keys(v.labely).forEach(function (k) {
        v.labely[k].keep = false;
      });
      // Keep current labels
      d4.set(p.data.serie.map(function (m) {
        return m.x;
      })).values().forEach(function (l) {
        if (v.labelx[l] === undefined) {
          v.labelx[l] = { label: l, disabled: false };
        }
        v.labelx[l].keep = true;
      });
      d4.set(p.data.serie.map(function (m) {
        return m.y;
      })).values().forEach(function (l) {
        if (v.labely[l] === undefined) {
          v.labely[l] = { label: l, disabled: false };
        }
        v.labely[l].keep = true;
      });
      // Filter + sort
      var lx = Object.keys(v.labelx).filter(function (k) {
        return v.labelx[k].keep;
      }).sort();
      var ly = Object.keys(v.labely).filter(function (k) {
        return v.labely[k].keep;
      }).sort();

      // Grid
      // If grid is defined, size accordingly
      // else size according to width / height
      if (p.grid === true) {
        // calculate width and height according to data
        p.width = p.margin.left + p.legend.left + lx.length * p.gridWidth + p.legend.right + p.margin.right;
        p.height = p.margin.top + p.legend.top + ly.length * p.gridHeight + p.legend.bottom + p.margin.bottom;
      }

      // Scale
      v.x.domain(lx).rangeRound([p.margin.left + p.legend.left, p.width - p.margin.right - p.legend.right]).padding(p.padding);

      v.y.domain(ly).rangeRound([p.margin.top + p.legend.top, p.height - p.margin.bottom - p.legend.bottom]).padding(p.padding);

      scale.domain([0, d4.max(p.data.serie, function (d) {
        return d.size;
      })]);

      // Axis
      v.xAxisTop = d4.axisTop(v.x);
      v.xAxisBottom = d4.axisBottom(v.x);
      v.yAxisLeft = d4.axisLeft(v.y);
      v.yAxisRight = d4.axisRight(v.y);

      // Update pattern
      var sel = void 0;
      var add = void 0;
      // Transitions
      var delay = 500;
      var t1 = d4.transition().duration(delay);
      var t2 = d4.transition().delay(delay).duration(delay);
      var t3 = d4.transition().delay(delay * 2).duration(delay);

      // Adjust SVG
      v.svg.attr('width', p.width).attr('height', p.height);
      v.svg.select('.legendBottom').transition(t2).attr('transform', 'translate(0, ' + (p.height - p.margin.bottom - p.legend.bottom) + ')');
      v.svg.select('.legendRight').transition(t2).attr('transform', 'translate(' + (p.width - p.margin.right - p.legend.right) + ', 0)');

      // Update axis
      if (p.legend.top > 0) {
        v.svg.select('.legendTop').transition(t2).call(v.xAxisTop).selectAll('text').attr('transform', 'rotate(-30)').attr('dx', '1ex').attr('dy', '1ex').style('text-anchor', 'start').style('cursor', 'pointer');
        v.svg.select('.legendTop').selectAll('text').on('click', function (d) {
          return labelClick('x', d);
        }).on('contextmenu', function (d) {
          return labelLeftClick(d);
        });
      }
      if (p.legend.bottom > 0) {
        v.svg.select('.legendBottom').transition(t2).call(v.xAxisBottom).selectAll('text').attr('transform', 'rotate(-30)').style('text-anchor', 'end').attr('dx', '-1ex').attr('dy', '1ex').style('cursor', 'pointer');
        v.svg.select('.legendBottom').selectAll('text').on('click', function (d) {
          return labelClick('x', d);
        }).on('contextmenu', function (d) {
          return labelLeftClick(d);
        });
      }
      if (p.legend.left > 0) {
        v.svg.select('.legendLeft').transition(t2).call(v.yAxisLeft).style('cursor', 'pointer');
        v.svg.select('.legendLeft').selectAll('text').on('click', function (d) {
          return labelClick('y', d);
        }).on('contextmenu', function (d) {
          return labelLeftClick(d);
        });
      }
      if (p.legend.right > 0) {
        v.svg.select('.legendRight').transition(t2).call(v.yAxisRight).style('cursor', 'pointer');
        v.svg.select('.legendRight').selectAll('text').on('click', function (d) {
          return labelClick('y', d);
        }).on('contextmenu', function (d) {
          return labelLeftClick(d);
        });
      }

      // Cells
      sel = d4.select('#' + p.id).select('.cells').selectAll('rect').data(p.data.serie, function (d) {
        return d.x + d.y;
      });
      // exit
      sel.exit().transition(t1).style('opacity', 0).remove();
      // update
      sel.transition(t1).style('fill', function (d) {
        return d.disabled ? '#eee' : color(scale(d.size));
      }).style('stroke', function (d) {
        return d.disabled ? '#fff' : '#000';
      });
      sel.transition(t2).attr('x', function (d) {
        return v.x(d.x);
      }).attr('y', function (d) {
        return v.y(d.y);
      }).attr('width', v.x.bandwidth()).attr('height', v.y.bandwidth());
      // add
      add = sel.enter().append('rect').attr('x', function (d) {
        return v.x(d.x);
      }).attr('y', function (d) {
        return v.y(d.y);
      }).attr('width', 0).attr('height', 0).attr('rx', p.cornerRadius).attr('ry', p.cornerRadius).style('opacity', 0).style('fill-rule', 'evenodd').style('cursor', 'pointer').on('mouseover', function (d) {
        return tip('show', d);
      }).on('mousemove', function (d) {
        return tip('move', d);
      }).on('mouseout', function (d) {
        return tip('hide', d);
      });
      // update
      sel = add.merge(sel);
      sel.transition(t3).attr('width', v.x.bandwidth()).attr('height', v.y.bandwidth()).style('opacity', 1).style('fill', function (d) {
        return d.disabled ? '#eee' : color(scale(d.size));
      }).style('stroke', function (d) {
        return d.disabled ? '#fff' : '#000';
      });
    };

    function labelClick(key, label) {
      var enable = [];
      var disable = [];
      var e = d3sel.event ? d3sel.event : d3.event;
      if (e.shiftKey || e.ctrlKey) {
        // Shift + Click or Ctrl + Click = enableSwitch
        var l = v['label' + key][label];
        if (l.disabled === true) {
          p.data.serie.filter(function (n) {
            return n[key] === label;
          }).forEach(function (n) {
            enable.push(n);
          });
        } else {
          p.data.serie.filter(function (n) {
            return n[key] === label;
          }).forEach(function (n) {
            disable.push(n);
          });
        }
        l.disabled = !l.disabled;
      } else {
        (function () {
          // Click = Deselect all and select only clicked node
          p.data.serie.forEach(function (n) {
            if (n[key] === label) {
              enable.push(n);
            } else {
              disable.push(n);
            }
          });
          var ls = v.labelx;
          Object.keys(ls).forEach(function (l) {
            ls[l].disabled = true;
          });
          ls = v.labely;
          Object.keys(ls).forEach(function (l) {
            ls[l].disabled = true;
          });
          v['label' + key][label].disabled = false;
        })();
      }
      p.dispatch({ type: 'enableGroup', payload: { enable: enable, disable: disable, chart: p.id } });
    }

    function labelLeftClick() {
      var e = d3sel.event ? d3sel.event : d3.event;
      e.preventDefault();
      // Left Click = select all
      var ls = v.labelx;
      Object.keys(ls).forEach(function (l) {
        ls[l].disabled = false;
      });
      ls = v.labely;
      Object.keys(ls).forEach(function (l) {
        ls[l].disabled = false;
      });
      p.dispatch({ type: 'enableAll', payload: { chart: p.id } });
    }

    function tip(state, d) {
      if (state === 'show') {
        d4.select('#tip').datum(d).style('opacity', 1).html(function (d) {
          return 'Row: ' + d.y + '<br/>\nColumn: ' + d.x + '<br/>\nValue: ' + d.size;
        });
        // highlight(d);
      } else if (state === 'hide') {
        d4.select('#tip').style('opacity', 0);
        // highlight();
      } else {
        // move
        var x = 0;
        var y = 0;
        var e = d3sel.event ? d3sel.event : d3.event;
        y = e.pageY;
        x = e.pageX;
        d4.select('#tip').style('top', y - 10 + 'px').style('left', x + 10 + 'px');
      }
    }

    return chart;
  }
});
