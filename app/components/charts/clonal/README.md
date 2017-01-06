# Clonal Evolution
Vertical tree with  quantity represented by the height of each area.

Inspire by the clonal evolution diagram. The tree topology is conserved and the height of each area is proportional to the quantity associated to each node.

**sources**
  * [D3.js v4.x](https://github.com/d3/d3/blob/master/API.md) (d3-color, d3-hierarchy, d3-scale, d3-scale-chromatic, d3-selection, d3-transition)
  * [d3 partition layout](https://github.com/d3/d3-hierarchy#partition)
  * Hierarchy in JSON format with size

**actions:**
  * collapse: click on a node to hide its children (turn node to blue)
  * expand: click on a node to show its children (turn node to black)
  * hover: hover a node to highlight its area (turn node to red)
  * hoverOut: after hover, set the node to its initial status.
