(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'd3-interpolate', 'd3-scale', 'd3-transition', 'd3-selection'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('d3-interpolate'), require('d3-scale'), require('d3-transition'), require('d3-selection'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.d3Interpolate, global.d3Scale, global.d3Transition, global.d3Selection);
    global.heatmap = mod.exports;
  }
})(this, function (exports, _d3Interpolate, _d3Scale, _d3Transition, _d3Selection) {
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
      interpolateRgbBasis: _d3Interpolate.interpolateRgbBasis,
      scaleLinear: _d3Scale.scaleLinear, scaleSequential: _d3Scale.scaleSequential
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
    p.data = p.data || { row1: { column1: 1 } };
    p.title = p.title || 'Heatmap of ' + p.id;
    p.titleSize = p.titleSize || 20;
    p.fontSize = p.fontSize || 14;
    p.width = p.width || 800;
    p.height = p.height || 400;
    p.margin = p.margin || { top: 30, bottom: 5, left: 5, right: 5, padding: 1 };
    p.legend = p.legend || { top: 100, bottom: 100, left: 100, right: 100, padding: 5 };
    p.grid = p.grid || false; // true: use gris size, false: use global size;
    p.gridWidth = p.gridWidth || 0;
    p.gridHeight = p.gridHeight || 0;
    p.color = p.color || ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000']; // ColorBrewer sequential
    p.cornerRadius = p.cornerRadius || 3;

    var color = d4.scaleSequential(d4.interpolateRgbBasis(p.color));
    var scale = d4.scaleLinear().range([0.000, 1.000]);
    p.max = 0; // Maximal cell value

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
      var svg = d4.select('#' + p.div).append('svg').attr('id', p.id).attr('title', p.title);

      // title
      svg.append('g').attr('class', 'title').append('text').attr('x', 0).attr('y', p.margin.top / 2).attr('dy', '0.5ex').style('font-size', p.titleSize + 'px').text(p.title);

      // group for visual elements
      svg.append('g').attr('transform', 'translate(' + (p.margin.left + p.legend.left) + ', ' + (p.margin.top + p.legend.top) + ')').classed('rows', true);

      // group for legend
      svg.append('g').classed('legendTop', true).attr('transform', 'translate(' + (p.margin.left + p.legend.left) + ', ' + p.margin.top + ')');
      svg.append('g').classed('legendBottom', true);
      /**/ // .attr('transform', `translate(${p.margin.left + p.legend.left}, ${p.height - p.margin.bottom - p.legend.bottom})`)
      svg.append('g').classed('legendLeft', true).attr('transform', 'translate(' + p.margin.left + ', ' + (p.margin.top + p.legend.top) + ')');
      svg.append('g').classed('legendRight', true);
      /**/ //    .attr('transform', `translate(${p.width - p.margin.right - p.legend.right}, ${p.margin.top + p.legend.top})`)
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
      p.labelX = [];
      p.labelY = [];
      p.heatmap = [];
      // Parse data
      Object.keys(p.data).forEach(function (row) {
        // Define Y label and index
        var y = p.labelY.indexOf(row);
        if (y < 0) {
          y = p.labelY.length;
          p.labelY.push(row);
        }
        Object.keys(p.data[row]).forEach(function (col) {
          // Define X label and index
          var x = p.labelX.indexOf(col);
          if (x < 0) {
            x = p.labelX.length;
            p.labelX.push(col);
          }
          // Populate heatmap
          if (p.heatmap[y] === undefined) {
            p.heatmap[y] = [];
          }
          p.heatmap[y][x] = p.data[row][col];
          p.max = Math.max(p.max, p.data[row][col]);
        });
      });
      // Scale color
      scale.domain([0, p.max]);
      // Sort label
      p.labelX = p.labelX.map(function (m, i) {
        return [m, i];
      });
      p.labelY = p.labelY.map(function (m, i) {
        return [m, i];
      });
      p.labelX.sort(function (a, b) {
        return a[0] < b[0] ? -1 : 1;
      });
      p.labelY.sort(function (a, b) {
        return a[0] < b[0] ? -1 : 1;
      });
      // Grid
      // If grid is defined, size accordingly
      // else size according to width / height
      if (p.grid) {
        p.width = p.margin.left + p.legend.left + p.labelX.length * p.gridWidth + p.legend.right + p.margin.right;
        p.height = p.margin.top + p.legend.top + p.labelY.length * p.gridHeight + p.legend.bottom + p.margin.bottom;
      } else {
        p.gridWidth = (p.width - p.margin.left - p.legend.left - p.margin.right - p.legend.right) / p.labelX.length;
        p.gridHeight = (p.height - p.margin.top - p.legend.top - p.margin.bottom - p.legend.bottom) / p.labelY.length;
      }
      // Adjust SVG
      var svg = d4.select('#' + p.div).select('svg').attr('width', p.width).attr('height', p.height);
      svg.select('.legendBottom').attr('transform', 'translate(' + (p.margin.left + p.legend.left) + ', ' + (p.height - p.margin.bottom - p.legend.bottom) + ')');
      svg.select('.legendRight').attr('transform', 'translate(' + (p.width - p.margin.right - p.legend.right) + ', ' + (p.margin.top + p.legend.top) + ')');

      // Update pattern
      var sel = void 0;
      var add = void 0;
      // Transitions
      var delay = 500;
      var t1 = d4.transition().duration(delay);
      var t2 = d4.transition().delay(delay).duration(delay);
      var t3 = d4.transition().delay(delay * 2).duration(delay);

      // Legend
      // const svg = d4.select(`#${p.id}`);
      if (p.legend.top > 2 * p.legend.padding) {
        addLegend('T', svg.select('.legendTop'), p.labelX.map(function (m) {
          return m[0];
        }));
      }
      if (p.legend.bottom > 2 * p.legend.padding) {
        addLegend('B', svg.select('.legendBottom'), p.labelX.map(function (m) {
          return m[0];
        }));
      }
      if (p.legend.left > 2 * p.legend.padding) {
        addLegend('L', svg.select('.legendLeft'), p.labelY.map(function (m) {
          return m[0];
        }));
      }
      if (p.legend.right > 2 * p.legend.padding) {
        addLegend('R', svg.select('.legendRight'), p.labelY.map(function (m) {
          return m[0];
        }));
      }

      // Rows
      sel = d4.select('#' + p.id).select('.rows').selectAll('g').data(p.labelY.map(function (y) {
        return [y[0], p.heatmap[y[1]]];
      }));
      // exit
      sel.exit().transition(t1).attr('transform', 'translate(0,0)').remove();
      // update
      sel.transition(t2).attr('transform', function (d, i) {
        return 'translate(0, ' + i * p.gridHeight + ')';
      });
      // add
      add = sel.enter().append('g').attr('transform', 'translate(0,0)');
      // update
      sel = add.merge(sel);
      sel.transition(t3).attr('transform', function (d, i) {
        return 'translate(0, ' + i * p.gridHeight + ')';
      });

      // Cells
      sel = d4.select('#' + p.id).select('.rows').selectAll('g').selectAll('rect').data(function (d) {
        return p.labelX.map(function (x) {
          return [d[0], x[0], d[1][x[1]] || 0];
        });
      });
      // exit
      sel.exit().transition(t1).remove();
      // update
      sel.transition(t2).attr('x', function (d, i) {
        return i * p.gridWidth + p.margin.padding;
      }).attr('width', p.gridWidth - 2 * p.margin.padding).attr('height', p.gridHeight - 2 * p.margin.padding).style('fill', function (d) {
        return color(scale(d[2]));
      });
      // add
      add = sel.enter().append('rect').attr('x', 0).attr('y', p.margin.padding).attr('width', 0).attr('height', 0).attr('rx', p.cornerRadius).attr('ry', p.cornerRadius).style('opacity', 1).style('fill', '#fff').style('fill-rule', 'evenodd').style('stroke', '#000').style('cursor', 'pointer').on('mouseover', function (d) {
        return tip('show', { row: d[0], col: d[1], value: d[2] });
      }).on('mousemove', function (d) {
        return tip('move', d);
      }).on('mouseout', function (d) {
        return tip('hide', d);
      });
      // update
      sel = add.merge(sel);
      sel.transition(t3).attr('x', function (d, i) {
        return i * p.gridWidth + p.margin.padding;
      }).attr('width', p.gridWidth - 2 * p.margin.padding).attr('height', p.gridHeight - 2 * p.margin.padding).style('fill', function (d) {
        return color(scale(d[2]));
      });

      function addLegend(mode, g, data) {
        // Path
        sel = g.selectAll('path').data(data, function (d) {
          return d;
        });
        // exit
        sel.exit().transition(t1).attr('d', 'M0,0L0,0').remove();
        // update
        sel.transition(t2).attr('d', function (d, i) {
          return path(mode, d, i);
        });
        // add
        add = sel.enter().append('path').attr('id', function (d) {
          return 'map' + mode + d.replace(' ', '_');
        }).attr('d', 'M0,0L0,0').style('pointer-events', 'none').style('opacity', 0);
        // update
        sel = add.merge(sel);
        sel.transition(t3).attr('d', function (d, i) {
          return path(mode, d, i);
        });

        // Text
        sel = g.selectAll('text').data(data, function (d) {
          return d;
        });
        // exit
        sel.exit().transition(t1).style('opacity', 0).remove();
        // add
        add = sel.enter().append('text').attr('text-anchor', 'left').attr('dy', '0.5ex').style('pointer-events', 'none').style('opacity', 1).append('textPath').attr('xlink:href', function (d) {
          return '#map' + mode + d.replace(' ', '_');
        }).text(function (d) {
          return d;
        });
      }
    };

    function path(mode, d, i) {
      var path = void 0;
      var line = 0;
      if (mode === 'L') {
        line = i * p.gridHeight;
        path = 'M' + p.legend.padding + ',' + (line + p.gridHeight / 2) + ' L' + (p.legend.left - p.legend.padding) + ',' + (line + p.gridHeight / 2);
      } else if (mode === 'R') {
        line = i * p.gridHeight;
        path = 'M' + p.legend.padding + ',' + (line + p.gridHeight / 2) + ' L' + (p.legend.right - p.legend.padding) + ',' + (line + p.gridHeight / 2);
      } else if (mode === 'T') {
        line = i * p.gridWidth;
        path = 'M' + (line + p.legend.padding) + ',' + (p.legend.top - p.legend.padding) + ' L' + (line + p.gridWidth - p.legend.padding) + ',' + p.legend.padding;
      } else if (mode === 'B') {
        line = i * p.gridWidth;
        path = 'M' + (line + p.legend.padding) + ',' + p.legend.padding + ' L' + (line + p.gridWidth - p.legend.padding) + ',' + (p.legend.bottom - p.legend.padding);
      } else {
        console.log('Error addLabel mode');
      }
      return path;
    }

    function tip(state, d) {
      if (state === 'show') {
        d4.select('#tip').datum(d).style('opacity', 1).html(function (d) {
          return 'Row: ' + d.row + '<br/>\nColumn: ' + d.col + '<br/>\nValue: ' + d.value;
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
