# Violin
Series of values represented as violin plot. The corps of the violin is the distribution of values mirroring on Y axis. A box plot is added on top of the violin.

**sources**
  * From a plot by [z-m-k](http://bl.ocks.org/z-m-k/5014368)
  * [D3.js v4.x](https://github.com/d3/d3/blob/master/API.md) (d3-array, d3-axis, d3-scale, d3-scale-chromatic, d3-shape, d3-selection, d3-transition)
  * Input data is an object with one property by serie and an array of value for each property. {serie1: [val1,val2,...], serie2: [val1,val2...]}

**actions:**
  * collapse: click on a node to hide its children (turn node to blue)
  * expand: click on a node to show its children (turn node to black)
  * hover: hover a node to highlight its area (turn node to red)
  * hoverOut: after hover, set the node to its initial status.
